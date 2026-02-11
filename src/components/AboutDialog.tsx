import { useState, useEffect } from 'react';
import { Info, ExternalLink, Coffee, Github, Download, Tag, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface GitHubStats {
  latestVersion: string;
  totalDownloads: number;
  latestDownloads: number;
  downloadTrend: { tag: string; downloads: number }[];
  loading: boolean;
  error: string | null;
}

function useGitHubStats() {
  const [stats, setStats] = useState<GitHubStats>({
    latestVersion: '',
    totalDownloads: 0,
    latestDownloads: 0,
    downloadTrend: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/cybruGhost/Cubic-Music/releases');
        if (!res.ok) throw new Error('Failed to fetch');
        const releases = await res.json();

        let totalDownloads = 0;
        const trend: { tag: string; downloads: number }[] = [];

        releases.forEach((release: any) => {
          let releaseTotal = 0;
          release.assets?.forEach((asset: any) => {
            releaseTotal += asset.download_count || 0;
          });
          totalDownloads += releaseTotal;
          trend.push({ tag: release.tag_name, downloads: releaseTotal });
        });

        const latest = releases[0];
        let latestDownloads = 0;
        latest?.assets?.forEach((asset: any) => {
          latestDownloads += asset.download_count || 0;
        });

        setStats({
          latestVersion: latest?.tag_name || 'N/A',
          totalDownloads,
          latestDownloads,
          downloadTrend: trend.slice(0, 8).reverse(),
          loading: false,
          error: null,
        });
      } catch {
        setStats(prev => ({ ...prev, loading: false, error: 'Could not load stats' }));
      }
    };
    fetchStats();
  }, []);

  return stats;
}

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

export function AboutDialog() {
  const stats = useGitHubStats();
  const maxDownloads = Math.max(...stats.downloadTrend.map(d => d.downloads), 1);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-16 z-50 h-10 w-10 rounded-full border border-border/50 bg-card/90 backdrop-blur-sm shadow-lg hover:bg-primary/20 hover:border-primary/50 transition-all"
          aria-label="About"
        >
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card border-border/50 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="gradient-text text-xl">About Kreate Backup Fixer</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          {/* Reason */}
          <div className="space-y-1.5">
            <h3 className="font-semibold text-foreground">Why this exists</h3>
            <p className="text-muted-foreground leading-relaxed">
              Kreate exports backups with a newer <code className="text-primary text-xs bg-muted px-1 py-0.5 rounded">user_version</code> (28) 
              that crashes Cubic Music, N-Zik, and RiMusic on import. This tool downgrades the version 
              and fixes malformed data so your playlists import cleanly.
            </p>
          </div>

          {/* Developer */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Developer</h3>
            <a
              href="https://github.com/cybruGhost"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border border-border/30 hover:border-primary/40 transition-colors group"
            >
              <img
                src="https://github.com/cybruGhost.png"
                alt="cybruGhost"
                className="w-10 h-10 rounded-full ring-2 ring-primary/30"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">cybruGhost</p>
                <p className="text-xs text-muted-foreground">Cubic Music Developer</p>
              </div>
              <Github className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-1.5">
              <Download className="w-4 h-4 text-primary" />
              Cubic Music Stats
            </h3>
            {stats.loading ? (
              <div className="flex gap-2 items-center text-muted-foreground">
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading stats...
              </div>
            ) : stats.error ? (
              <p className="text-muted-foreground">{stats.error}</p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <StatCard icon={<Tag className="w-3.5 h-3.5" />} label="Latest" value={stats.latestVersion} />
                  <StatCard icon={<Download className="w-3.5 h-3.5" />} label="Total" value={formatNumber(stats.totalDownloads)} />
                  <StatCard icon={<TrendingUp className="w-3.5 h-3.5" />} label="Latest DL" value={formatNumber(stats.latestDownloads)} />
                </div>

                {/* Mini bar chart for download trend */}
                {stats.downloadTrend.length > 1 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-xs text-muted-foreground font-medium">Download trend by release</p>
                    <div className="flex items-end gap-1" style={{ height: 80 }}>
                      {stats.downloadTrend.map((d) => {
                        const barH = Math.max((d.downloads / maxDownloads) * 64, 3);
                        return (
                          <div key={d.tag} className="flex-1 flex flex-col items-center justify-end h-full">
                            <span className="text-[8px] text-muted-foreground mb-0.5">{formatNumber(d.downloads)}</span>
                            <div
                              className="w-full rounded-t bg-primary/70 hover:bg-primary transition-colors"
                              style={{ height: barH }}
                              title={`${d.tag}: ${d.downloads} downloads`}
                            />
                            <span className="text-[8px] text-muted-foreground truncate w-full text-center mt-0.5">
                              {d.tag.replace(/^v/, '')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2">
            <a
              href="https://github.com/cybruGhost/Cubic-Music/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors text-primary font-medium"
            >
              <Download className="w-4 h-4" />
              Download Cubic Music
              <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
            </a>
            <a
              href="https://github.com/cybruGhost/Cubic-Music"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/30 hover:border-primary/40 transition-colors text-foreground"
            >
              <Github className="w-4 h-4" />
              GitHub Repository
              <ExternalLink className="w-3 h-3 ml-auto opacity-60 text-muted-foreground" />
            </a>
          </div>

          {/* Support */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <p className="text-muted-foreground leading-relaxed mb-2">
              If you enjoy our work and want to support development, you can buy us a coffee ☕
            </p>
            <a
              href="https://ko-fi.com/anonghost40418"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <Coffee className="w-4 h-4" />
              Support on Ko-fi
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <p className="text-xs text-muted-foreground mt-2">
              Every bit of support helps keep Cubic Music growing 🚀
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg bg-muted/50 border border-border/30 text-center">
      <div className="flex items-center justify-center gap-1 text-primary mb-0.5">{icon}</div>
      <p className="font-semibold text-foreground text-sm">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
