import { useState, useCallback } from 'react';
import { Database, Download, ChevronDown, ChevronUp, Eye, EyeOff, Disc3, Users, Music, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { ConversionResult, Playlist } from '@/lib/kreate-converter';
import { SchemaComparison } from '@/components/SchemaComparison';
import { CleaningReport } from '@/components/CleaningReport';
import { PlaylistSelector } from '@/components/PlaylistSelector';
import { OutputPreview } from '@/components/OutputPreview';

interface SQLiteViewerProps {
  result: ConversionResult;
  onDownload: (selectedPlaylists: number[]) => void;
}

export function SQLiteViewer({ result, onDownload }: SQLiteViewerProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>(result.playlists);
  const [showSchema, setShowSchema] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  const totalSongs = result.songs.length;
  const selectedPlaylists = playlists.filter(p => p.selected);
  const songsInSelectedPlaylists = selectedPlaylists.reduce((acc, p) => acc + p.songs.length, 0);

  const handlePlaylistSelectionChange = useCallback((playlistId: number, selected: boolean) => {
    setPlaylists(prev => prev.map(p => 
      p.id === playlistId ? { ...p, selected } : p
    ));
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    setPlaylists(prev => prev.map(p => ({ ...p, selected })));
  }, []);

  const handleDownload = () => {
    const selectedIds = playlists.filter(p => p.selected).map(p => p.id);
    onDownload(selectedIds);
  };

  // Count favorites
  const favSongs = result.songs.filter(s => s.likedAt).length;
  const favAlbums = result.albums.filter(a => a.bookmarkedAt).length;
  const favArtists = result.artists.filter(a => a.bookmarkedAt).length;

  return (
    <div className="w-full space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <StatBadge label="Songs" value={totalSongs} color="primary" icon={<Music className="w-3 h-3" />} />
        <StatBadge label="Albums" value={result.albums.length} color="accent" icon={<Disc3 className="w-3 h-3" />} />
        <StatBadge label="Artists" value={result.artists.length} color="success" icon={<Users className="w-3 h-3" />} />
      </div>

      {/* Favorites Row */}
      {(favSongs > 0 || favAlbums > 0 || favArtists > 0) && (
        <div className="glass-card rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-destructive fill-destructive" />
            <span className="text-sm font-medium">Favorites Found</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {favSongs > 0 && (
              <span className="px-2 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
                {favSongs} liked songs
              </span>
            )}
            {favAlbums > 0 && (
              <span className="px-2 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
                {favAlbums} bookmarked albums
              </span>
            )}
            {favArtists > 0 && (
              <span className="px-2 py-1 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
                {favArtists} bookmarked artists
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            ✅ All favorites will be preserved in your converted backup
          </p>
        </div>
      )}

      {/* Extra data stats */}
      {(result.events.length > 0 || result.formats.length > 0 || result.lyrics.length > 0 || result.searchQueries.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {result.events.length > 0 && (
            <span className="px-2.5 py-1 bg-muted/50 border border-border/50 rounded-full text-xs">
              📊 {result.events.length} play events
            </span>
          )}
          {result.formats.length > 0 && (
            <span className="px-2.5 py-1 bg-muted/50 border border-border/50 rounded-full text-xs">
              🎵 {result.formats.length} audio formats
            </span>
          )}
          {result.lyrics.length > 0 && (
            <span className="px-2.5 py-1 bg-muted/50 border border-border/50 rounded-full text-xs">
              📝 {result.lyrics.length} lyrics
            </span>
          )}
          {result.searchQueries.length > 0 && (
            <span className="px-2.5 py-1 bg-muted/50 border border-border/50 rounded-full text-xs">
              🔍 {result.searchQueries.length} searches
            </span>
          )}
        </div>
      )}

      {/* Playlists stat */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <StatBadge label="Playlists" value={playlists.length} color="accent" />
        <StatBadge label="To Export" value={songsInSelectedPlaylists} color="success" />
      </div>

      {/* Schema Comparison */}
      <div className="glass-card rounded-xl overflow-hidden">
        <button
          onClick={() => setShowSchema(!showSchema)}
          className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="font-medium text-sm sm:text-base">Database Analysis</span>
          </div>
          {showSchema ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showSchema && (
          <div className="p-3 sm:p-4 pt-0">
            <SchemaComparison 
              kreateSchema={result.kreateSchema} 
              cubicMusicSchema={result.cubicMusicSchema} 
            />
          </div>
        )}
      </div>

      {/* Kreate Tables Detail */}
      {result.tableInfo.length > 0 && (
        <div className="glass-card rounded-xl p-3 sm:p-4">
          <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
            Kreate Source Tables
          </h4>
          <div className="space-y-2">
            {result.tableInfo.map((table, i) => (
              <div key={i} className="bg-muted/30 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedTable(expandedTable === table.name ? null : table.name)}
                  className="w-full p-2 sm:p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs sm:text-sm truncate">{table.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      ({table.rowCount} rows)
                    </span>
                  </div>
                  {expandedTable === table.name ? (
                    <EyeOff className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  ) : (
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  )}
                </button>
                {expandedTable === table.name && (
                  <div className="px-2 sm:px-3 pb-2 sm:pb-3">
                    <div className="flex flex-wrap gap-1">
                      {table.columns.map((col, j) => (
                        <span key={j} className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                          {col.name}
                          <span className="text-muted-foreground ml-1 text-[10px]">
                            {col.type}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cleaning Report */}
      <CleaningReport report={result.cleaningReport} />

      {/* Errors & Warnings */}
      {result.errors.length > 0 && (
        <div className="glass-card rounded-xl p-3 sm:p-4 border-destructive/50">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <span className="text-sm sm:text-base font-medium">Errors ({result.errors.length})</span>
          </div>
          <ul className="space-y-1 text-xs sm:text-sm text-muted-foreground">
            {result.errors.map((error, i) => (
              <li key={i}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {result.warnings.length > 0 && (
        <details className="glass-card rounded-xl overflow-hidden">
          <summary className="p-3 sm:p-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <span className="text-warning text-sm sm:text-base font-medium">
              Warnings ({result.warnings.length})
            </span>
          </summary>
          <ul className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1 text-xs sm:text-sm text-muted-foreground max-h-32 overflow-y-auto">
            {result.warnings.slice(0, 30).map((warning, i) => (
              <li key={i}>• {warning}</li>
            ))}
            {result.warnings.length > 30 && (
              <li className="text-muted-foreground/60">...and {result.warnings.length - 30} more</li>
            )}
          </ul>
        </details>
      )}

      {/* Playlist Selector */}
      {playlists.length > 0 && (
        <PlaylistSelector
          playlists={playlists}
          onSelectionChange={handlePlaylistSelectionChange}
          onSelectAll={handleSelectAll}
        />
      )}

      {/* Output Preview */}
      {totalSongs > 0 && (
        <OutputPreview
          songCount={totalSongs}
          playlistCount={selectedPlaylists.length}
          mappingCount={songsInSelectedPlaylists}
          albumCount={result.albums.length}
          artistCount={result.artists.length}
          songAlbumMapCount={result.songAlbumMaps.length}
          songArtistMapCount={result.songArtistMaps.length}
          eventCount={result.events.length}
          formatCount={result.formats.length}
          lyricsCount={result.lyrics.length}
          searchQueryCount={result.searchQueries.length}
        />
      )}

      {/* Data Preview */}
      {totalSongs > 0 && (
        <div className="glass-card rounded-xl overflow-hidden">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="font-medium text-sm sm:text-base">Song Data Preview</span>
            </div>
            {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showPreview && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs whitespace-nowrap">Title</TableHead>
                    <TableHead className="text-xs whitespace-nowrap hidden sm:table-cell">Artist</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.songs.slice(0, 15).map((song, i) => (
                    <TableRow key={i}>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2 max-w-[180px] sm:max-w-none">
                          {song.thumbnailUrl && (
                            <img 
                              src={song.thumbnailUrl} 
                              alt=""
                              className="w-8 h-8 rounded object-cover shrink-0 hidden sm:block"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm truncate">{song.title || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground truncate sm:hidden">
                              {song.artists || 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                        <span className="truncate block max-w-[150px]">{song.artists || '-'}</span>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm font-mono">
                        {formatDuration(song.duration)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {result.songs.length > 15 && (
                <p className="text-center text-xs sm:text-sm text-muted-foreground py-3 border-t border-border">
                  ...and {result.songs.length - 15} more songs
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Download Button */}
      {totalSongs > 0 && (
        <Button 
          onClick={handleDownload}
          disabled={selectedPlaylists.length === 0 && playlists.length > 0}
          className="w-full h-12 sm:h-14 text-base sm:text-lg glow-effect"
          size="lg"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Fixed Backup
        </Button>
      )}
    </div>
  );
}

function StatBadge({ label, value, color, icon }: { label: string; value: number; color: 'primary' | 'accent' | 'success'; icon?: React.ReactNode }) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    accent: 'bg-accent/10 text-accent border-accent/20',
    success: 'bg-success/10 text-success border-success/20',
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-2 sm:py-3 px-2 sm:px-4 rounded-lg border",
      colorClasses[color]
    )}>
      {icon && <span className="mb-0.5">{icon}</span>}
      <span className="text-lg sm:text-2xl font-bold">{value}</span>
      <span className="text-[10px] sm:text-xs opacity-80">{label}</span>
    </div>
  );
}

function formatDuration(seconds: string): string {
  const num = parseInt(seconds, 10);
  if (isNaN(num) || num === 0) return '--:--';
  const mins = Math.floor(num / 60);
  const secs = num % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
