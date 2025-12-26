import { ModelResult, EvaluationMetrics } from "@/types/anomaly";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface ModelComparisonProps {
  models: ModelResult[];
  evaluation: EvaluationMetrics;
}

export function ModelComparison({ models, evaluation }: ModelComparisonProps) {
  // Calculate model efficiency metrics
  const modelData = models.map((model) => ({
    name: model.name,
    trainingTime: parseFloat(model.trainingTime.toFixed(2)),
    featureCount: Object.keys(model.featureImportance).length,
    topImportance: Math.max(...Object.values(model.featureImportance)) || 0,
    avgImportance:
      Object.values(model.featureImportance).reduce((a, b) => a + b, 0) /
        Object.keys(model.featureImportance).length || 0,
  }));

  // Normalize for radar chart (0-100 scale)
  const maxTime = Math.max(...modelData.map((m) => m.trainingTime)) || 1;
  const radarData = modelData.map((model) => ({
    model: model.name
      .replace("IsolationForest", "ISO")
      .replace("LightGBM", "LGBM")
      .replace("LocalOutlierFactor", "LOF")
      .replace("HistogramBasedOutlierScore", "HBOS"),
    Efficiency: 100 - (model.trainingTime / maxTime) * 100,
    "Feature Importance": model.topImportance * 100,
    "Avg Importance": model.avgImportance * 100,
    "F1 Score": (evaluation.f1Score || 0) * 100,
  }));

  return (
    <div className="space-y-6">
      {/* Training Time Comparison */}
      <div className="glass rounded-2xl p-6 gradient-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-foreground">
              Model Training Efficiency
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Training time and feature importance comparison
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={modelData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: "12px" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar
              dataKey="trainingTime"
              fill="#3b82f6"
              name="Training Time (s)"
            />
            <Bar
              dataKey="topImportance"
              fill="#10b981"
              name="Top Feature Importance"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Model Performance Radar */}
      <div className="glass rounded-2xl p-6 gradient-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-foreground">
              Model Performance Radar
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Multi-dimensional model capability comparison
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="model"
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: "12px" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              stroke="rgba(255,255,255,0.3)"
              style={{ fontSize: "11px" }}
            />
            <Radar
              name="Efficiency"
              dataKey="Efficiency"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.25}
            />
            <Radar
              name="Feature Importance"
              dataKey="Feature Importance"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.25}
            />
            <Legend />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Model Metrics Table */}
      <div className="glass rounded-2xl p-6 gradient-border">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            Detailed Model Metrics
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                  Model
                </th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                  Training Time (s)
                </th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                  Features
                </th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                  Top Importance
                </th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                  Avg Importance
                </th>
              </tr>
            </thead>
            <tbody>
              {modelData.map((model, index) => (
                <tr
                  key={model.name}
                  className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
                >
                  <td className="py-3 px-4 text-foreground font-medium">
                    {model.name}
                  </td>
                  <td className="text-right py-3 px-4 text-muted-foreground">
                    <span className="inline-block px-2 py-1 rounded bg-primary/20 text-primary">
                      {model.trainingTime.toFixed(2)}s
                    </span>
                  </td>
                  <td className="text-right py-3 px-4 text-muted-foreground">
                    {model.featureCount}
                  </td>
                  <td className="text-right py-3 px-4 text-muted-foreground">
                    {(model.topImportance * 100).toFixed(1)}%
                  </td>
                  <td className="text-right py-3 px-4 text-muted-foreground">
                    {(model.avgImportance * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
