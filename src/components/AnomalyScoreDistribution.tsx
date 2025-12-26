import { AnomalyResult } from "@/types/anomaly";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnomalyScoreDistributionProps {
  results: AnomalyResult[];
}

export function AnomalyScoreDistribution({
  results,
}: AnomalyScoreDistributionProps) {
  // Create bins for anomaly scores (0-0.1, 0.1-0.2, etc.)
  const bins = [
    { range: "0.0-0.1", count: 0, anomalies: 0 },
    { range: "0.1-0.2", count: 0, anomalies: 0 },
    { range: "0.2-0.3", count: 0, anomalies: 0 },
    { range: "0.3-0.4", count: 0, anomalies: 0 },
    { range: "0.4-0.5", count: 0, anomalies: 0 },
    { range: "0.5-0.6", count: 0, anomalies: 0 },
    { range: "0.6-0.7", count: 0, anomalies: 0 },
    { range: "0.7-0.8", count: 0, anomalies: 0 },
    { range: "0.8-0.9", count: 0, anomalies: 0 },
    { range: "0.9-1.0", count: 0, anomalies: 0 },
  ];

  results.forEach((result) => {
    const binIndex = Math.min(9, Math.floor(result.anomalyScore * 10));
    bins[binIndex].count++;
    if (result.anomalyScore > 0.5) {
      bins[binIndex].anomalies++;
    }
  });

  const normalBins = bins.map((bin) => ({
    ...bin,
    normal: bin.count - bin.anomalies,
  }));

  return (
    <div className="glass rounded-2xl p-6 gradient-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">
            Anomaly Score Distribution
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Distribution of anomaly detection scores
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={normalBins}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="range"
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: "12px" }}
          />
          <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0,0,0,0.8)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
            }}
            formatter={(value) => value}
          />
          <Legend />
          <Bar dataKey="normal" stackId="a" fill="#3b82f6" name="Normal" />
          <Bar
            dataKey="anomalies"
            stackId="a"
            fill="#ef4444"
            name="Anomalies"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
