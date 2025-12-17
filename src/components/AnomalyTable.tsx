import { AnomalyResult } from '@/types/anomaly';
import { AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface AnomalyTableProps {
  results: AnomalyResult[];
}

export function AnomalyTable({ results }: AnomalyTableProps) {
  const sortedResults = [...results].sort((a, b) => b.anomalyScore - a.anomalyScore);
  const displayResults = sortedResults.slice(0, 20);

  return (
    <div className="glass rounded-2xl overflow-hidden gradient-border">
      <div className="p-6 border-b border-border">
        <h3 className="font-semibold text-foreground">Anomaly Detection Results</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Top {displayResults.length} results by anomaly score
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground w-20">Row</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Score</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Explanations</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Model Votes</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {displayResults.map((result, index) => (
              <AnomalyRow key={result.rowIndex} result={result} index={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnomalyRow({ result, index }: { result: AnomalyResult; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const isAnomaly = result.anomalyScore > 0.7;

  return (
    <Collapsible asChild open={isOpen} onOpenChange={setIsOpen}>
      <>
        <tr
          className={cn(
            'transition-colors hover:bg-secondary/20',
            isAnomaly && 'bg-anomaly/5',
            isOpen && 'bg-secondary/10'
          )}
          style={{ animationDelay: `${index * 30}ms` }}
        >
          <td className="p-4 font-mono text-sm text-foreground">
            #{result.rowIndex}
          </td>
          <td className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    result.anomalyScore > 0.7 ? 'bg-anomaly' : 'bg-success'
                  )}
                  style={{ width: `${result.anomalyScore * 100}%` }}
                />
              </div>
              <span className={cn(
                'font-mono text-sm',
                isAnomaly ? 'text-anomaly' : 'text-success'
              )}>
                {(result.anomalyScore * 100).toFixed(1)}%
              </span>
            </div>
          </td>
          <td className="p-4">
            {isAnomaly ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-anomaly/20 text-anomaly text-xs font-medium">
                <AlertTriangle className="w-3 h-3" />
                Anomaly
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/20 text-success text-xs font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Normal
              </span>
            )}
          </td>
          <td className="p-4">
            <div className="flex flex-wrap gap-1">
              {result.explanations?.length > 0 ? (
                result.explanations.slice(0, 2).map((exp, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-warning/20 text-warning text-xs"
                  >
                    {exp.title}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground text-xs">—</span>
              )}
            </div>
          </td>
          <td className="p-4">
            <div className="flex gap-2">
              {result.modelVotes.slice(0, 3).map((vote, i) => (
                <span
                  key={i}
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-mono',
                    vote.score > 0.7 ? 'bg-anomaly/20 text-anomaly' : 'bg-secondary text-muted-foreground'
                  )}
                  title={vote.model}
                >
                  {vote.model.slice(0, 3).toUpperCase()}: {(vote.score * 100).toFixed(0)}%
                </span>
              ))}
            </div>
          </td>
          <td className="p-4">
            {result.explanations?.length > 0 && (
              <CollapsibleTrigger asChild>
                <button className="p-1 rounded-md hover:bg-secondary">
                  <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
                </button>
              </CollapsibleTrigger>
            )}
          </td>
        </tr>
        <CollapsibleContent asChild>
          <tr className="bg-secondary/5">
            <td colSpan={6} className="p-0">
              <div className="p-4 ml-8 border-l-2 border-warning">
                <h4 className="font-semibold text-sm text-warning mb-2">Anomaly Details</h4>
                <div className="space-y-2">
                  {result.explanations.map((exp, i) => (
                    <div key={i} className="text-xs">
                      <p className="font-medium text-foreground">{exp.title}</p>
                      <p className="text-muted-foreground">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </td>
          </tr>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
}
