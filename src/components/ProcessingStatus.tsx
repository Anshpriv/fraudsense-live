import { CheckCircle2, Loader2, Circle, AlertCircle } from 'lucide-react';
import { ProcessingStage } from '@/types/anomaly';
import { cn } from '@/lib/utils';

interface ProcessingStatusProps {
  stage: ProcessingStage;
}

const stages: { key: ProcessingStage; label: string }[] = [
  { key: 'uploading', label: 'Uploading file' },
  { key: 'parsing', label: 'Parsing CSV' },
  { key: 'inferring', label: 'Inferring schema' },
  { key: 'preprocessing', label: 'Preprocessing data' },
  { key: 'training', label: 'Training models' },
  { key: 'evaluating', label: 'Evaluating results' },
];

function getStageIndex(stage: ProcessingStage): number {
  const idx = stages.findIndex(s => s.key === stage);
  return idx === -1 ? -1 : idx;
}

export function ProcessingStatus({ stage }: ProcessingStatusProps) {
  const currentIndex = getStageIndex(stage);
  const isComplete = stage === 'complete';
  const isError = stage === 'error';

  if (stage === 'idle') return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="glass rounded-2xl p-8 gradient-border">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Processing Pipeline</h3>
            {isComplete && (
              <span className="px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium">
                Complete
              </span>
            )}
            {isError && (
              <span className="px-3 py-1 rounded-full bg-destructive/20 text-destructive text-sm font-medium">
                Error
              </span>
            )}
          </div>

          <div className="space-y-4">
            {stages.map((s, index) => {
              const isActive = index === currentIndex && !isComplete && !isError;
              const isDone = isComplete || index < currentIndex;
              const isPending = index > currentIndex && !isComplete;

              return (
                <div
                  key={s.key}
                  className={cn(
                    'flex items-center gap-4 transition-all duration-300',
                    isActive && 'scale-[1.02]'
                  )}
                >
                  <div className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                    isDone && 'bg-success/20 text-success',
                    isActive && 'bg-primary/20 text-primary animate-pulse',
                    isPending && 'bg-secondary text-muted-foreground',
                    isError && index === currentIndex && 'bg-destructive/20 text-destructive'
                  )}>
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isActive ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isError && index === currentIndex ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className={cn(
                      'font-medium transition-colors',
                      isDone && 'text-success',
                      isActive && 'text-primary',
                      isPending && 'text-muted-foreground'
                    )}>
                      {s.label}
                    </p>
                  </div>

                  {isDone && (
                    <span className="text-xs text-muted-foreground font-mono">
                      ✓ done
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500 ease-out rounded-full',
                isComplete ? 'bg-success' : isError ? 'bg-destructive' : 'bg-primary'
              )}
              style={{
                width: isComplete ? '100%' : `${((currentIndex + 1) / stages.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
