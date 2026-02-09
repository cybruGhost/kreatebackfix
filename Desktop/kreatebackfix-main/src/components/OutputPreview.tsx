import { Database, Table as TableIcon, FileOutput } from 'lucide-react';
import { CUBIC_MUSIC_SCHEMA } from '@/lib/kreate-converter';

interface OutputPreviewProps {
  songCount: number;
  playlistCount: number;
  mappingCount: number;
}

export function OutputPreview({ songCount, playlistCount, mappingCount }: OutputPreviewProps) {
  const tables = [
    {
      name: 'Song',
      description: 'All unique songs',
      rowCount: songCount,
      columns: CUBIC_MUSIC_SCHEMA[0].columns,
    },
    {
      name: 'Playlist',
      description: 'Your playlists',
      rowCount: playlistCount,
      columns: CUBIC_MUSIC_SCHEMA[1].columns,
    },
    {
      name: 'SongPlaylistMap',
      description: 'Song-playlist links',
      rowCount: mappingCount,
      columns: CUBIC_MUSIC_SCHEMA[2].columns,
    },
  ];

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <FileOutput className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
          <span className="font-medium text-sm sm:text-base">Output SQLite Structure</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Preview of the generated database structure
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
                {table.rowCount} rows
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{table.description}</p>
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
