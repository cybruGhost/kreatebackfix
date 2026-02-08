import { Sparkles, AlertTriangle, ChevronDown } from 'lucide-react';
import type { CleaningReport as CleaningReportType } from '@/lib/kreate-converter';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface CleaningReportProps {
  report: CleaningReportType[];
}

export function CleaningReport({ report }: CleaningReportProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (report.length === 0) {
    return (
      <div className="glass-card rounded-xl p-3 sm:p-4 border-success/30">
        <div className="flex items-center gap-2 text-success">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Data is Clean</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          No data cleaning was required. All values were properly formatted.
        </p>
      </div>
    );
  }

  // Group by issue type
  const issueGroups = report.reduce((acc, item) => {
    const key = item.issue;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, CleaningReportType[]>);

  const issueTypes = Object.keys(issueGroups);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="glass-card rounded-xl overflow-hidden">
      <CollapsibleTrigger className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
          <span className="font-medium text-sm sm:text-base">Data Cleaning Report</span>
          <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full">
            {report.length} fixes
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="p-3 sm:p-4 pt-0 space-y-3">
          {/* Summary */}
          <div className="flex flex-wrap gap-2">
            {issueTypes.map((issue, i) => (
              <span 
                key={i} 
                className="px-2 py-1 bg-muted rounded text-xs"
              >
                {issue}: <span className="font-semibold">{issueGroups[issue].length}</span>
              </span>
            ))}
          </div>

          {/* Detailed list */}
          <div className="max-h-48 overflow-y-auto space-y-2">
            {report.slice(0, 20).map((item, i) => (
              <div key={i} className="bg-muted/30 rounded p-2 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-primary">{item.field}</span>
                  <span className="text-warning text-[10px]">{item.issue}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Before: </span>
                    <span className="text-destructive break-all">
                      {item.original || '(empty)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">After: </span>
                    <span className="text-success break-all">
                      {item.cleaned || '(empty)'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {report.length > 20 && (
              <p className="text-center text-xs text-muted-foreground py-2">
                ...and {report.length - 20} more fixes
              </p>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
