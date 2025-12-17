import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

interface TimeSeriesChartProps {
  data: { timestamp: string; value: number; isAnomaly: boolean }[];
}

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  const anomalies = data.filter(d => d.isAnomaly);

  return (
    <div className="glass rounded-2xl p-6 gradient-border">
      <div className="mb-6">
        <h3 className="font-semibold text-foreground">Time Series Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Anomalies highlighted in red
        </p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.5}
            />
            <XAxis
              dataKey="timestamp"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickLine={{ stroke: 'hsl(var(--border))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              itemStyle={{ color: 'hsl(var(--primary))' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
            />
            {anomalies.map((anomaly, index) => (
              <ReferenceDot
                key={index}
                x={anomaly.timestamp}
                y={anomaly.value}
                r={8}
                fill="hsl(var(--anomaly))"
                stroke="hsl(var(--anomaly))"
                strokeWidth={2}
                style={{ filter: 'drop-shadow(0 0 6px hsl(var(--anomaly) / 0.6))' }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-anomaly glow-anomaly" />
          <span className="text-muted-foreground">Anomaly</span>
        </div>
      </div>
    </div>
  );
}
