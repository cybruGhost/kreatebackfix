import { Music, Check } from 'lucide-react';
import type { Playlist } from '@/lib/kreate-converter';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface PlaylistSelectorProps {
  playlists: Playlist[];
  onSelectionChange: (playlistId: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

export function PlaylistSelector({ playlists, onSelectionChange, onSelectAll }: PlaylistSelectorProps) {
  const selectedCount = playlists.filter(p => p.selected).length;
  const allSelected = selectedCount === playlists.length;
  const noneSelected = selectedCount === 0;

  if (playlists.length === 0) {
    return null;
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="font-medium text-sm sm:text-base">Select Playlists to Export</span>
          </div>
          <button
            onClick={() => onSelectAll(!allSelected)}
            className="text-xs text-primary hover:underline"
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {selectedCount} of {playlists.length} playlists selected
        </p>
      </div>

      <div className="p-2 sm:p-3 max-h-64 overflow-y-auto space-y-1">
        {playlists.map((playlist) => (
          <label
            key={playlist.id}
            className={cn(
              "flex items-center gap-3 p-2 sm:p-3 rounded-lg cursor-pointer transition-colors",
              playlist.selected 
                ? "bg-primary/10 border border-primary/20" 
                : "hover:bg-muted/50"
            )}
          >
            <Checkbox
              checked={playlist.selected}
              onCheckedChange={(checked) => onSelectionChange(playlist.id, !!checked)}
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{playlist.name}</p>
              <p className="text-xs text-muted-foreground">
                {playlist.songs.length} songs
              </p>
            </div>
            {playlist.selected && (
              <Check className="w-4 h-4 text-primary shrink-0" />
            )}
          </label>
        ))}
      </div>

      {noneSelected && (
        <div className="p-3 bg-destructive/10 border-t border-destructive/20">
          <p className="text-xs text-destructive text-center">
            Select at least one playlist to export
          </p>
        </div>
      )}
    </div>
  );
}
