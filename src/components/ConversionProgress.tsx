import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversionProgressProps {
  status: 'idle' | 'detecting' | 'parsing' | 'converting' | 'complete' | 'error';
  progress: number;
  currentStep?: string;
}

export function ConversionProgress({ status, progress, currentStep }: ConversionProgressProps) {
  const steps = [
    { id: 'detecting', label: 'Detecting format' },
    { id: 'parsing', label: 'Parsing database' },
    { id: 'converting', label: 'Converting data' },
    { id: 'complete', label: 'Complete' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === status);

  return (
    <div className="w-full glass-card rounded-xl p-6 space-y-6">
      {/* Progress bar */}
      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
            status === 'error' ? "bg-destructive" : "bg-primary"
          )}
          style={{ 
            width: `${progress}%`,
            background: status !== 'error' ? 'var(--gradient-primary)' : undefined
          }}
        />
        {status !== 'complete' && status !== 'error' && (
          <div 
            className="absolute inset-y-0 left-0 rounded-full animate-shimmer"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
            }}
          />
        )}
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = status === step.id;
          const isComplete = currentStepIndex > index || status === 'complete';
          const isError = status === 'error' && currentStepIndex === index;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div className={cn(
                "relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                isComplete && !isError && "bg-success/20",
                isActive && !isError && "bg-primary/20",
                isError && "bg-destructive/20",
                !isActive && !isComplete && !isError && "bg-muted"
              )}>
                {isComplete && !isError ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : isError ? (
                  <XCircle className="w-5 h-5 text-destructive" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                )}

                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className={cn(
                    "absolute left-full w-[calc(100%-2.5rem)] h-0.5 top-1/2 -translate-y-1/2 ml-2",
                    currentStepIndex > index ? "bg-success" : "bg-muted"
                  )} style={{ width: 'calc(100vw / 8)' }} />
                )}
              </div>
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive && "text-primary",
                isComplete && "text-success",
                isError && "text-destructive",
                !isActive && !isComplete && !isError && "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current step description */}
      {currentStep && (
        <p className="text-center text-sm text-muted-foreground">
          {currentStep}
        </p>
      )}
    </div>
  );
}
