import { ModelResult, EvaluationMetrics } from '@/types/anomaly';
import { Brain, Clock, Zap, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelPerformanceProps {
  models: ModelResult[];
  evaluation: EvaluationMetrics;
}

export function ModelPerformance({ models, evaluation }: ModelPerformanceProps) {
  const metrics = [
    { label: 'Accuracy', value: evaluation.accuracy, icon: Target },
    { label: 'Precision', value: evaluation.precision, icon: Zap },
    { label: 'Recall', value: evaluation.recall, icon: TrendingUp },
    { label: 'F1 Score', value: evaluation.f1Score, icon: Brain },
    { label: 'ROC AUC', value: evaluation.rocAuc, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Evaluation Metrics */}
      <div className="glass rounded-2xl p-6 gradient-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-foreground">Evaluation Metrics</h3>
            {evaluation.isSynthetic && (
              <p className="text-xs text-warning mt-1">
                * Metrics computed using synthetic labels
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="text-center p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <metric.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold font-mono text-foreground">
                {metric.value ? `${(metric.value * 100).toFixed(1)}%` : '—'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Model Details */}
      <div className="glass rounded-2xl p-6 gradient-border">
        <h3 className="font-semibold text-foreground mb-6">Trained Models</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((model, index) => (
            <div
              key={model.name}
              className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Brain className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{model.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {model.trainingTime.toFixed(2)}s
                </div>
              </div>

              {/* Feature Importance */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-2">Feature Importance</p>
                {Object.entries(model.featureImportance)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([feature, importance]) => (
                    <div key={feature} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground w-24 truncate">
                        {feature}
                      </span>
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${importance * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-foreground w-12 text-right">
                        {(importance * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
