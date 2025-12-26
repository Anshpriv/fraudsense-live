import { Schema } from "@/types/anomaly";
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
import { CheckCircle2, AlertTriangle, Database } from "lucide-react";

interface DataQualityMetricsProps {
  schema: Schema;
}

export function DataQualityMetrics({ schema }: DataQualityMetricsProps) {
  const columnMetrics = schema.columns.map((col) => ({
    name: col.name.substring(0, 12),
    fullName: col.name,
    completeness: ((schema.rowCount - col.nullCount) / schema.rowCount) * 100,
    nullCount: col.nullCount,
    uniqueCount: col.uniqueCount,
    type: col.type,
    cardinality: (col.uniqueCount / schema.rowCount) * 100,
  }));

  const overallCompleteness =
    columnMetrics.reduce((a, b) => a + b.completeness, 0) /
    columnMetrics.length;
  const nullPercentage =
    (columnMetrics.reduce((a, b) => a + b.nullCount, 0) /
      (schema.rowCount * schema.columns.length)) *
    100;
  const avgCardinality =
    columnMetrics.reduce((a, b) => a + b.cardinality, 0) / columnMetrics.length;

  const issues = [];
  if (nullPercentage > 5) {
    issues.push(`${nullPercentage.toFixed(1)}% missing values across dataset`);
  }
  const lowCompleteColumns = columnMetrics.filter((c) => c.completeness < 90);
  if (lowCompleteColumns.length > 0) {
    issues.push(`${lowCompleteColumns.length} column(s) with <90% completeness`);
  }
  const highCardinalityColumns = columnMetrics.filter((c) => c.cardinality > 95);
  if (highCardinalityColumns.length > 0) {
    issues.push(`${highCardinalityColumns.length} column(s) with very high cardinality`);
  }
  if (issues.length === 0) {
    issues.push("Excellent data quality overall");
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 gradient-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Completeness</p>
              <p className="text-2xl font-bold text-foreground">
                {overallCompleteness.toFixed(1)}%
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="glass rounded-xl p-4 gradient-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Missing Values</p>
              <p className="text-2xl font-bold text-foreground">
                {nullPercentage.toFixed(2)}%
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="glass rounded-xl p-4 gradient-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg Cardinality</p>
              <p className="text-2xl font-bold text-foreground">
                {avgCardinality.toFixed(1)}%
              </p>
            </div>
            <Database className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 gradient-border">
        <h3 className="font-semibold text-foreground mb-6">Column Completeness</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={columnMetrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} />
            <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} />
            <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px" }} formatter={(value) => value.toFixed(1)} />
            <Legend />
            <Bar dataKey="completeness" fill="#10b981" name="Completeness %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass rounded-2xl p-6 gradient-border">
        <h3 className="font-semibold text-foreground mb-4">Data Quality Assessment</h3>
        <div className="space-y-3">
          {issues.map((issue, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="p-1.5 rounded bg-blue-500/20 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-sm text-muted-foreground">{issue}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-6 gradient-border">
        <h3 className="font-semibold text-foreground mb-4">Column Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Column</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Completeness</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Null Count</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Unique</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Cardinality</th>
              </tr>
            </thead>
            <tbody>
              {columnMetrics.slice(0, 10).map((col) => (
                <tr key={col.fullName} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                  <td className="py-3 px-4 text-foreground font-medium">{col.fullName}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-1 rounded bg-primary/20 text-primary text-xs">{col.type}</span>
                  </td>
                  <td className="text-right py-3 px-4 text-muted-foreground">{col.completeness.toFixed(1)}%</td>
                  <td className="text-right py-3 px-4 text-muted-foreground">{col.nullCount}</td>
                  <td className="text-right py-3 px-4 text-muted-foreground">{col.uniqueCount}</td>
                  <td className="text-right py-3 px-4 text-muted-foreground">{col.cardinality.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {columnMetrics.length > 10 && (
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Showing 10 of {columnMetrics.length} columns
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
