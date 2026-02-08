import { ArrowRight, Table as TableIcon, CheckCircle, XCircle } from 'lucide-react';
import type { TableInfo } from '@/lib/kreate-converter';
import { cn } from '@/lib/utils';

interface SchemaComparisonProps {
  kreateSchema: TableInfo[];
  cubicMusicSchema: TableInfo[];
}

export function SchemaComparison({ kreateSchema, cubicMusicSchema }: SchemaComparisonProps) {
  // Find matching tables between schemas
  const getMatchStatus = (kreateName: string): 'matched' | 'unmapped' => {
    const lowerName = kreateName.toLowerCase();
    if (lowerName.includes('song') || lowerName.includes('track')) return 'matched';
    if (lowerName.includes('playlist')) return 'matched';
    if (lowerName.includes('map')) return 'matched';
    return 'unmapped';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2">
        <TableIcon className="w-4 h-4 text-primary" />
        Schema Comparison
      </h3>

      <div className="grid md:grid-cols-[1fr,auto,1fr] gap-3 items-start">
        {/* Kreate Schema */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-warning px-2 py-1 bg-warning/10 rounded inline-block">
            Kreate Database
          </div>
          {kreateSchema.length > 0 ? (
            <div className="space-y-2">
              {kreateSchema.map((table, i) => (
                <TableCard 
                  key={i} 
                  table={table} 
                  status={getMatchStatus(table.name)}
                  variant="kreate"
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground px-2">No tables found</p>
          )}
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <ArrowRight className="w-6 h-6 text-primary" />
            <span className="text-[10px] text-muted-foreground text-center">
              Transform<br/>& Clean
            </span>
          </div>
        </div>

        {/* Cubic Music Schema */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-success px-2 py-1 bg-success/10 rounded inline-block">
            Cubic Music Format
          </div>
          <div className="space-y-2">
            {cubicMusicSchema.map((table, i) => (
              <TableCard 
                key={i} 
                table={table} 
                status="target"
                variant="cubic"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile arrow */}
      <div className="flex md:hidden justify-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <ArrowRight className="w-4 h-4 text-primary" />
          <span className="text-xs text-primary font-medium">Converts to Cubic Music format</span>
        </div>
      </div>
    </div>
  );
}

interface TableCardProps {
  table: TableInfo;
  status: 'matched' | 'unmapped' | 'target';
  variant: 'kreate' | 'cubic';
}

function TableCard({ table, status, variant }: TableCardProps) {
  const bgColor = variant === 'kreate' 
    ? status === 'matched' ? 'bg-warning/5 border-warning/20' : 'bg-muted/30 border-muted'
    : 'bg-success/5 border-success/20';

  return (
    <div className={cn("rounded-lg border p-2 sm:p-3", bgColor)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs sm:text-sm font-medium truncate max-w-[140px] sm:max-w-none">
            {table.name}
          </span>
          {variant === 'kreate' && (
            <span className="text-[10px] text-muted-foreground">
              ({table.rowCount} rows)
            </span>
          )}
        </div>
        {variant === 'kreate' && (
          status === 'matched' ? (
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-success shrink-0" />
          ) : (
            <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
          )
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {table.columns.slice(0, 6).map((col, j) => (
          <span 
            key={j} 
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-mono",
              variant === 'kreate' 
                ? 'bg-warning/10 text-warning' 
                : 'bg-success/10 text-success'
            )}
          >
            {col.name}
          </span>
        ))}
        {table.columns.length > 6 && (
          <span className="text-[10px] text-muted-foreground">
            +{table.columns.length - 6} more
          </span>
        )}
      </div>
    </div>
  );
}
