import { Database, Table as TableIcon, FileOutput } from 'lucide-react';
import { CUBIC_MUSIC_SCHEMA } from '@/lib/kreate-converter';

interface OutputPreviewProps {
  songCount: number;
  playlistCount: number;
  mappingCount: number;
  albumCount: number;
  artistCount: number;
  songAlbumMapCount: number;
  songArtistMapCount: number;
  eventCount: number;
  formatCount: number;
  lyricsCount: number;
  searchQueryCount: number;
}

export function OutputPreview({
  songCount, playlistCount, mappingCount,
  albumCount, artistCount, songAlbumMapCount, songArtistMapCount,
  eventCount, formatCount, lyricsCount, searchQueryCount,
}: OutputPreviewProps) {
  const rowCounts: Record<string, number> = {
    Song: songCount,
    Playlist: playlistCount,
    SongPlaylistMap: mappingCount,
    Artist: artistCount,
    SongArtistMap: songArtistMapCount,
    Album: albumCount,
    SongAlbumMap: songAlbumMapCount,
    Event: eventCount,
    Format: formatCount,
    Lyrics: lyricsCount,
    SearchQuery: searchQueryCount,
    QueuedMediaItem: 0,
  };

  // Only show tables that have data or are essential (Song, Playlist, SongPlaylistMap)
  const essentialTables = ['Song', 'Playlist', 'SongPlaylistMap'];
  const tables = CUBIC_MUSIC_SCHEMA.filter(t =>
    essentialTables.includes(t.name) || (rowCounts[t.name] ?? 0) > 0
  );

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <FileOutput className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
          <span className="font-medium text-sm sm:text-base">Output SQLite Structure</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Preview of the generated database — all your data will be transferred
        </p>
      </div>

      <div className="p-3 sm:p-4 space-y-3">
        {tables.map((table, i) => (
          <div key={i} className="bg-success/5 border border-success/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-success" />
                <span className="font-mono text-sm font-medium">{table.name}</span>
              </div>
              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded">
                {rowCounts[table.name] ?? 0} rows
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {table.columns.map((col, j) => (
                <div key={j} className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 bg-success/10 text-success rounded text-[10px] font-mono">
                    {col.name}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {col.type.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border/50">
          <Database className="w-4 h-4 inline mr-1" />
          Output: <span className="font-mono text-primary">kreatetocubicfixedbackup.sqlite</span>
        </div>
      </div>
    </div>
  );
}
