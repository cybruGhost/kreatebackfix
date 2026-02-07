import { useState } from 'react';
import { Database, Table as TableIcon, ArrowRight, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
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
import type { ConversionResult } from '@/lib/kreate-converter';

interface SQLiteViewerProps {
  result: ConversionResult;
  onDownload: () => void;
}

// Cubic Music expected schema
const CUBIC_MUSIC_SCHEMA = {
  headers: ['PlaylistBrowseId', 'PlaylistName', 'SongId', 'Title', 'Artists', 'Duration', 'ThumbnailUrl'],
  description: 'Expected format for Cubic Music import'
};

export function SQLiteViewer({ result, onDownload }: SQLiteViewerProps) {
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [showMapping, setShowMapping] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

  const totalSongs = result.songs.length;
  const totalPlaylists = result.playlists.length;
  const songsInPlaylists = result.playlists.reduce((acc, p) => acc + p.songs.length, 0);

  return (
    <div className="w-full space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <StatBadge label="Songs" value={totalSongs} color="primary" />
        <StatBadge label="Playlists" value={totalPlaylists} color="accent" />
        <StatBadge label="In Playlists" value={songsInPlaylists} color="success" />
      </div>

      {/* Schema Mapping */}
      <div className="glass-card rounded-xl overflow-hidden">
        <button
          onClick={() => setShowMapping(!showMapping)}
          className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="font-medium text-sm sm:text-base">Schema Mapping</span>
          </div>
          {showMapping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showMapping && (
          <div className="p-3 sm:p-4 pt-0 space-y-3 sm:space-y-4">
            {/* Kreate Tables Found */}
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Kreate Database Tables</h4>
              {result.tableInfo.length > 0 ? (
                <div className="space-y-2">
                  {result.tableInfo.map((table, i) => (
                    <div key={i} className="bg-muted/30 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedTable(expandedTable === table.name ? null : table.name)}
                        className="w-full p-2 sm:p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <TableIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0" />
                          <span className="font-mono text-xs sm:text-sm truncate">{table.name}</span>
                          <span className="text-xs text-muted-foreground shrink-0">({table.rowCount} rows)</span>
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
                                {col}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-muted-foreground">No tables found in database</p>
              )}
            </div>

            {/* Mapping Arrow */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <ArrowRight className="w-4 h-4 text-primary" />
                <span className="text-xs sm:text-sm text-primary font-medium">Mapped to</span>
              </div>
            </div>

            {/* Cubic Music Schema */}
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-medium text-muted-foreground">Cubic Music Format</h4>
              <div className="bg-success/10 border border-success/20 rounded-lg p-2 sm:p-3">
                <div className="flex flex-wrap gap-1">
                  {CUBIC_MUSIC_SCHEMA.headers.map((header, i) => (
                    <span key={i} className="px-2 py-0.5 bg-success/20 text-success rounded text-xs font-mono">
                      {header}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
            <span className="text-warning text-sm sm:text-base font-medium">Warnings ({result.warnings.length})</span>
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

      {/* Data Preview */}
      {totalSongs > 0 && (
        <div className="glass-card rounded-xl overflow-hidden">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <TableIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="font-medium text-sm sm:text-base">Converted Data Preview</span>
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
                    <TableHead className="text-xs whitespace-nowrap hidden md:table-cell">Playlist</TableHead>
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
                            <p className="text-xs text-muted-foreground truncate sm:hidden">{song.artists || 'Unknown'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                        <span className="truncate block max-w-[150px]">{song.artists || '-'}</span>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm font-mono">
                        {formatDuration(song.duration)}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                        <span className="truncate block max-w-[120px]">{song.playlistName || '-'}</span>
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
          onClick={onDownload}
          className="w-full h-12 sm:h-14 text-base sm:text-lg glow-effect"
          size="lg"
        >
          Download Fixed CSV
        </Button>
      )}
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number; color: 'primary' | 'accent' | 'success' }) {
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
