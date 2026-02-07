import { useCallback, useState } from 'react';
import { Upload, FileText, Database, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  acceptedFormats: string[];
}

export function FileDropzone({ onFileSelect, isProcessing, acceptedFormats }: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    setDragError(null);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!acceptedFormats.some(f => f.includes(extension || ''))) {
      setDragError(`Invalid file format. Accepted: ${acceptedFormats.join(', ')}`);
      return;
    }

    onFileSelect(file);
  }, [acceptedFormats, onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative flex flex-col items-center justify-center w-full min-h-[280px] p-8",
          "rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer",
          "glass-card overflow-hidden group",
          isDragOver 
            ? "border-primary bg-primary/5 scale-[1.02]" 
            : "border-muted-foreground/30 hover:border-primary/50",
          isProcessing && "pointer-events-none opacity-70"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        {/* Background glow effect */}
        <div className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500",
          isDragOver && "opacity-100"
        )} style={{ background: 'var(--gradient-glow)' }} />

        <input
          id="file-input"
          type="file"
          className="hidden"
          accept=".sqlite,.db,.csv"
          onChange={handleFileInput}
          disabled={isProcessing}
        />

        <div className={cn(
          "relative z-10 flex flex-col items-center gap-6",
          isProcessing && "animate-pulse-slow"
        )}>
          {/* Icon container */}
          <div className={cn(
            "relative p-6 rounded-2xl bg-muted/50 transition-all duration-300",
            isDragOver && "bg-primary/20 scale-110",
            "group-hover:bg-muted"
          )}>
            <Upload className={cn(
              "w-12 h-12 transition-colors duration-300",
              isDragOver ? "text-primary" : "text-muted-foreground group-hover:text-primary"
            )} />
            
            {/* Floating icons */}
            <Database className={cn(
              "absolute -top-2 -right-2 w-6 h-6 text-primary/60",
              "animate-float"
            )} style={{ animationDelay: '0s' }} />
            <FileText className={cn(
              "absolute -bottom-2 -left-2 w-6 h-6 text-accent/60",
              "animate-float"
            )} style={{ animationDelay: '1s' }} />
          </div>

          {/* Text content */}
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">
              {isProcessing ? (
                <span className="gradient-text">Processing file...</span>
              ) : isDragOver ? (
                <span className="gradient-text">Drop your file here</span>
              ) : (
                <>Drop your Kreate backup here</>
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse • Accepts .sqlite, .db, .csv files
            </p>
          </div>
        </div>

        {dragError && (
          <div className="absolute bottom-4 flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" />
            {dragError}
          </div>
        )}
      </div>
    </div>
  );
}
