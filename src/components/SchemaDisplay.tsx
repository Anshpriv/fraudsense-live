import { Schema, ColumnType } from "@/types/anomaly";
import {
  Database,
  Hash,
  Calendar,
  ToggleLeft,
  Tag,
  FileText,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SchemaDisplayProps {
  schema: Schema;
}

const typeIcons: Record<ColumnType, React.ReactNode> = {
  numeric: <Hash className="w-4 h-4" />,
  categorical: <Tag className="w-4 h-4" />,
  datetime: <Calendar className="w-4 h-4" />,
  boolean: <ToggleLeft className="w-4 h-4" />,
  id: <Database className="w-4 h-4" />,
  text: <FileText className="w-4 h-4" />,
  geo: <MapPin className="w-4 h-4" />,
};

const typeColors: Record<ColumnType, string> = {
  numeric: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  categorical: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  datetime: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  boolean: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  id: "bg-muted text-muted-foreground border-border",
  text: "bg-secondary text-secondary-foreground border-border",
  geo: "bg-chart-5/20 text-chart-5 border-chart-5/30",
};

export function SchemaDisplay({ schema }: SchemaDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass rounded-2xl p-6 gradient-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/20">
          <Database className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Inferred Schema</h3>
          <p className="text-sm text-muted-foreground">
            {schema.rowCount.toLocaleString()} rows × {schema.columns.length}{" "}
            columns
          </p>
        </div>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 w-full p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors mb-3">
            <ChevronDown
              className={cn(
                "w-5 h-5 text-primary transition-transform",
                isOpen ? "rotate-180" : ""
              )}
            />
            <span className="text-sm font-medium text-foreground">
              {isOpen ? "Hide" : "Show"} all {schema.columns.length} features
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3">
          {schema.columns.map((col, index) => (
            <div
              key={col.name}
              className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border",
                  typeColors[col.type]
                )}
              >
                {typeIcons[col.type]}
                <span className="text-xs font-medium uppercase">
                  {col.type}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-foreground truncate">
                  {col.name}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="font-mono">{col.uniqueCount} unique</span>
                {col.nullCount > 0 && (
                  <span className="px-2 py-0.5 rounded bg-warning/20 text-warning">
                    {col.nullCount} null
                  </span>
                )}
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {!isOpen && (
        <div className="text-xs text-muted-foreground text-center py-2">
          Click to expand and see all {schema.columns.length} columns
        </div>
      )}
    </div>
  );
}
