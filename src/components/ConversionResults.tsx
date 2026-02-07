import { Download, Music, ListMusic, AlertTriangle, Info, Database, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { ConversionResult } from '@/lib/kreate-converter';
import { cn } from '@/lib/utils';

interface ConversionResultsProps {
  result: ConversionResult;
  csvContent: string;
  fileName: string;
}

export function ConversionResults({ result, csvContent, fileName }: ConversionResultsProps) {
  const [showTableInfo, setShowTableInfo] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);

  const totalSongs = result.songs.length;
  const totalPlaylists = result.playlists.length;
  const songsInPlaylists = result.playlists.reduce((acc, p) => acc + p.songs.length, 0);

  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cubic_music_${fileName.replace(/\.[^/.]+$/, '')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Music className="w-5 h-5" />}
          label="Songs Found"
          value={totalSongs}
          accent="primary"
        />
        <StatCard
          icon={<ListMusic className="w-5 h-5" />}
          label="Playlists"
          value={totalPlaylists}
          accent="accent"
        />
        <StatCard
          icon={<Database className="w-5 h-5" />}
          label="Songs in Playlists"
          value={songsInPlaylists}
          accent="success"
        />
      </div>

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="glass-card rounded-xl p-4 border-destructive/50">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Errors ({result.errors.length})</span>
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {result.errors.map((error, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings (collapsible) */}
      {result.warnings.length > 0 && (
        <div className="glass-card rounded-xl p-4 border-warning/30">
          <button
            onClick={() => setShowWarnings(!showWarnings)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-warning">
              <Info className="w-5 h-5" />
              <span className="font-medium">Warnings ({result.warnings.length})</span>
            </div>
            {showWarnings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showWarnings && (
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground max-h-40 overflow-y-auto">
              {result.warnings.slice(0, 50).map((warning, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  {warning}
                </li>
              ))}
              {result.warnings.length > 50 && (
                <li className="text-muted-foreground/70">...and {result.warnings.length - 50} more</li>
              )}
            </ul>
          )}
        </div>
      )}

      {/* Table info (collapsible) */}
      {result.tableInfo.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <button
            onClick={() => setShowTableInfo(!showTableInfo)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Database className="w-5 h-5" />
              <span className="font-medium">Database Tables ({result.tableInfo.length})</span>
            </div>
            {showTableInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showTableInfo && (
            <div className="mt-3 space-y-2">
              {result.tableInfo.map((table, i) => (
                <div key={i} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm text-primary">{table.name}</span>
                    <span className="text-xs text-muted-foreground">{table.rowCount} rows</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {table.columns.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {totalSongs > 0 && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Music className="w-4 h-4 text-primary" />
            Sample Songs
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {result.songs.slice(0, 10).map((song, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                {song.thumbnailUrl ? (
                  <img 
                    src={song.thumbnailUrl} 
                    alt="" 
                    className="w-10 h-10 rounded object-cover bg-muted"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    <Music className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{song.title || 'Unknown Title'}</p>
                  <p className="text-xs text-muted-foreground truncate">{song.artists || 'Unknown Artist'}</p>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatDuration(song.duration)}
                </span>
              </div>
            ))}
            {result.songs.length > 10 && (
              <p className="text-center text-sm text-muted-foreground py-2">
                ...and {result.songs.length - 10} more songs
              </p>
            )}
          </div>
        </div>
      )}

      {/* Download button */}
      {totalSongs > 0 && (
        <Button 
          onClick={handleDownload}
          className="w-full h-14 text-lg glow-effect"
          size="lg"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Cubic Music CSV
        </Button>
      )}
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  accent 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number;
  accent: 'primary' | 'accent' | 'success';
}) {
  const accentColors = {
    primary: 'text-primary bg-primary/10',
    accent: 'text-accent bg-accent/10',
    success: 'text-success bg-success/10',
  };

  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-4">
      <div className={cn("p-3 rounded-lg", accentColors[accent])}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
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
