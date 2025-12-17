export type ColumnType = 'numeric' | 'categorical' | 'datetime' | 'boolean' | 'id' | 'text' | 'geo';

export interface SchemaColumn {
  name: string;
  type: ColumnType;
  nullCount: number;
  uniqueCount: number;
  sampleValues: string[];
}

export interface Schema {
  columns: SchemaColumn[];
  rowCount: number;
}

export interface PreprocessingStep {
  column: string;
  action: string;
  details: string;
}

export interface ModelResult {
  name: string;
  params: Record<string, unknown>;
  featureImportance: Record<string, number>;
  trainingTime: number;
}

export interface AnomalyExplanation {
  title: string;
  description: string;
}

export interface AnomalyResult {
  rowIndex: number;
  raw: Record<string, unknown>;
  anomalyScore: number;
  flags: string[];
  explanations: AnomalyExplanation[];
  modelVotes: { model: string; score: number }[];
}

export interface EvaluationMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  rocAuc?: number;
  isSynthetic: boolean;
}

export interface AnalysisResult {
  schema: Schema;
  preprocessing: PreprocessingStep[];
  models: ModelResult[];
  evaluation: EvaluationMetrics;
  summary: {
    rows: number;
    columns: string[];
    anomalyCount: number;
    topReasons: string[];
  };
  results: AnomalyResult[];
  timeSeriesData?: { timestamp: string; value: number; isAnomaly: boolean }[];
  distributionData?: { name: string; value: number; isAnomaly: boolean }[];
}

export type ProcessingStage = 
  | 'idle'
  | 'uploading'
  | 'parsing'
  | 'inferring'
  | 'preprocessing'
  | 'training'
  | 'evaluating'
  | 'complete'
  | 'error';
