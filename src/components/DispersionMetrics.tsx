import { AnomalyResult, EvaluationMetrics } from "@/types/anomaly";
import { TrendingDown } from "lucide-react";

interface DispersionMetricsProps {
  results: AnomalyResult[];
  evaluation: EvaluationMetrics;
}

export function DispersionMetrics({
  results,
  evaluation,
}: DispersionMetricsProps) {
  // Calculate statistical dispersion measures
  const scores = results.map((r) => r.anomalyScore);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // Calculate quartiles
  const sorted = [...scores].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q2Index = Math.floor(sorted.length * 0.5);
  const q3Index = Math.floor(sorted.length * 0.75);

  const q1 = sorted[q1Index];
  const q2 = sorted[q2Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const metrics = [
    { label: "Mean Score", value: mean.toFixed(3) },
    { label: "Std Deviation", value: stdDev.toFixed(3) },
    { label: "Q1 (25%)", value: q1.toFixed(3) },
    { label: "Median (Q2)", value: q2.toFixed(3) },
    { label: "Q3 (75%)", value: q3.toFixed(3) },
    { label: "IQR", value: iqr.toFixed(3) },
  ];

  return (
    <div className="glass rounded-2xl p-6 gradient-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/20">
          <TrendingDown className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            Statistical Dispersion
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Distribution and spread of anomaly scores
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
            <p className="text-2xl font-bold font-mono text-foreground">
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
