import { AnalysisResult, Schema, PreprocessingStep, ModelResult, AnomalyResult, EvaluationMetrics } from '@/types/anomaly';

const columnTypes = ['numeric', 'categorical', 'datetime', 'boolean', 'id', 'text'] as const;

function inferColumnType(values: string[]): typeof columnTypes[number] {
  const sample = values.filter(v => v && v.trim());
  if (sample.length === 0) return 'text';
  
  const numericCount = sample.filter(v => !isNaN(parseFloat(v))).length;
  if (numericCount / sample.length > 0.8) return 'numeric';
  
  const datePatterns = [/^\d{4}-\d{2}-\d{2}/, /^\d{2}\/\d{2}\/\d{4}/, /^\d{1,2}-\w{3}-\d{4}/];
  const dateCount = sample.filter(v => datePatterns.some(p => p.test(v))).length;
  if (dateCount / sample.length > 0.8) return 'datetime';
  
  const boolValues = ['true', 'false', '0', '1', 'yes', 'no'];
  const boolCount = sample.filter(v => boolValues.includes(v.toLowerCase())).length;
  if (boolCount / sample.length > 0.8) return 'boolean';
  
  const uniqueRatio = new Set(sample).size / sample.length;
  if (uniqueRatio > 0.9) return 'id';
  if (uniqueRatio < 0.3) return 'categorical';
  
  return 'text';
}

export function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = lines.slice(1).map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  });
  
  return { headers, rows };
}

export function inferSchema(headers: string[], rows: string[][]): Schema {
  const columns = headers.map((name, i) => {
    const values = rows.map(row => row[i] || '');
    const nonNull = values.filter(v => v && v.trim());
    
    return {
      name,
      type: inferColumnType(values),
      nullCount: values.length - nonNull.length,
      uniqueCount: new Set(nonNull).size,
      sampleValues: nonNull.slice(0, 5),
    };
  });
  
  return { columns, rowCount: rows.length };
}

export function generatePreprocessingSteps(schema: Schema): PreprocessingStep[] {
  const steps: PreprocessingStep[] = [];
  
  schema.columns.forEach(col => {
    if (col.type === 'numeric') {
      steps.push({
        column: col.name,
        action: 'normalize',
        details: 'Applied RobustScaler normalization',
      });
      if (col.nullCount > 0) {
        steps.push({
          column: col.name,
          action: 'impute',
          details: `Median imputation for ${col.nullCount} missing values`,
        });
      }
    } else if (col.type === 'categorical') {
      steps.push({
        column: col.name,
        action: 'encode',
        details: `Frequency encoding (${col.uniqueCount} categories)`,
      });
    } else if (col.type === 'datetime') {
      steps.push({
        column: col.name,
        action: 'extract',
        details: 'Extracted: timestamp, hour, weekday, month features',
      });
    }
  });
  
  return steps;
}

export function generateMockModels(schema: Schema): ModelResult[] {
  const numericCols = schema.columns.filter(c => c.type === 'numeric');
  
  const featureImportance: Record<string, number> = {};
  numericCols.forEach(col => {
    featureImportance[col.name] = Math.random() * 0.5 + 0.1;
  });
  
  const total = Object.values(featureImportance).reduce((a, b) => a + b, 0);
  Object.keys(featureImportance).forEach(k => {
    featureImportance[k] = Math.round((featureImportance[k] / total) * 100) / 100;
  });
  
  return [
    {
      name: 'IsolationForest',
      params: { n_estimators: 100, contamination: 0.05, random_state: 42 },
      featureImportance,
      trainingTime: Math.random() * 2 + 0.5,
    },
    {
      name: 'LightGBM Outlier',
      params: { num_leaves: 31, learning_rate: 0.05, n_estimators: 100 },
      featureImportance,
      trainingTime: Math.random() * 3 + 1,
    },
    {
      name: 'Local Outlier Factor',
      params: { n_neighbors: 20, contamination: 0.05 },
      featureImportance,
      trainingTime: Math.random() * 1.5 + 0.3,
    },
    {
      name: 'HBOS',
      params: { n_bins: 10, alpha: 0.1 },
      featureImportance,
      trainingTime: Math.random() * 0.5 + 0.1,
    },
  ];
}

export function generateMockResults(headers: string[], rows: string[][], schema: Schema): AnomalyResult[] {
  const anomalyCount = Math.ceil(rows.length * 0.05);
  const anomalyIndices = new Set<number>();
  
  while (anomalyIndices.size < anomalyCount) {
    anomalyIndices.add(Math.floor(Math.random() * rows.length));
  }
  
  return rows.slice(0, 100).map((row, index) => {
    const isAnomaly = anomalyIndices.has(index);
    const raw: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      raw[h] = row[i];
    });
    
    const anomalyScore = isAnomaly 
      ? Math.random() * 0.3 + 0.7 
      : Math.random() * 0.4;
    
    const flags: string[] = [];
    const explanations = [];
    if (isAnomaly) {
      const numericCols = schema.columns.filter(c => c.type === 'numeric');
      if (numericCols.length > 0) {
        const randomCol = numericCols[Math.floor(Math.random() * numericCols.length)];
        flags.push(`High z-score in ${randomCol.name}`);
        explanations.push({
            title: `Unusual value in ${randomCol.name}`,
            description: `The value for ${randomCol.name} was significantly different from the typical distribution.`
        });
      }
      if (Math.random() > 0.5) {
        flags.push('Statistical outlier detected');
        explanations.push({
            title: 'Statistical outlier',
            description: 'The data point was identified as a statistical outlier by multiple models.'
        });
      }
      if (Math.random() > 0.7) {
        flags.push('Rare pattern combination');
        explanations.push({
            title: 'Rare feature combination',
            description: 'A rare combination of feature values was observed for this data point.'
        });
      }
    }
    
    return {
      rowIndex: index,
      raw,
      anomalyScore,
      flags,
      explanations,
      modelVotes: [
        { model: 'IsolationForest', score: anomalyScore + (Math.random() - 0.5) * 0.2 },
        { model: 'LightGBM', score: anomalyScore + (Math.random() - 0.5) * 0.2 },
        { model: 'LOF', score: anomalyScore + (Math.random() - 0.5) * 0.2 },
        { model: 'HBOS', score: anomalyScore + (Math.random() - 0.5) * 0.2 },
      ].map(v => ({ ...v, score: Math.max(0, Math.min(1, v.score)) })),
    };
  });
}

export function generateMockEvaluation(): EvaluationMetrics {
  return {
    accuracy: 0.92 + Math.random() * 0.05,
    precision: 0.85 + Math.random() * 0.1,
    recall: 0.80 + Math.random() * 0.15,
    f1Score: 0.82 + Math.random() * 0.1,
    rocAuc: 0.90 + Math.random() * 0.08,
    isSynthetic: true,
  };
}

export function generateTimeSeriesData(rows: string[][], schema: Schema): { timestamp: string; value: number; isAnomaly: boolean }[] {
  const dateCol = schema.columns.find(c => c.type === 'datetime');
  const numericCol = schema.columns.find(c => c.type === 'numeric');
  
  if (!dateCol || !numericCol) {
    return Array.from({ length: 50 }, (_, i) => ({
      timestamp: new Date(Date.now() - (50 - i) * 86400000).toISOString().split('T')[0],
      value: Math.sin(i * 0.2) * 50 + 100 + Math.random() * 20,
      isAnomaly: Math.random() > 0.95,
    }));
  }
  
  const dateIndex = schema.columns.indexOf(dateCol);
  const numericIndex = schema.columns.indexOf(numericCol);
  
  return rows.slice(0, 50).map((row, i) => ({
    timestamp: row[dateIndex] || new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
    value: parseFloat(row[numericIndex]) || Math.random() * 100,
    isAnomaly: Math.random() > 0.95,
  }));
}

export function generateDistributionData(rows: string[][], schema: Schema): { name: string; value: number; isAnomaly: boolean }[] {
  const numericCol = schema.columns.find(c => c.type === 'numeric');
  if (!numericCol) {
    return Array.from({ length: 20 }, (_, i) => ({
      name: `${i * 10}-${(i + 1) * 10}`,
      value: Math.floor(Math.random() * 50) + 5,
      isAnomaly: i === 0 || i === 19,
    }));
  }
  
  const index = schema.columns.indexOf(numericCol);
  const values = rows.map(r => parseFloat(r[index])).filter(v => !isNaN(v));
  let min = Infinity;
  let max = -Infinity;
  
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  
  const binSize = (max - min) / 10;
  
  const bins = Array.from({ length: 10 }, (_, i) => {
    const binMin = min + i * binSize;
    const binMax = binMin + binSize;
    const count = values.filter(v => v >= binMin && v < binMax).length;
    return {
      name: `${binMin.toFixed(0)}-${binMax.toFixed(0)}`,
      value: count,
      isAnomaly: count < 3 || count > values.length * 0.3,
    };
  });
  
  return bins;
}

export async function analyzeCSV(content: string): Promise<AnalysisResult> {
  const { headers, rows } = parseCSV(content);
  const schema = inferSchema(headers, rows);
  const preprocessing = generatePreprocessingSteps(schema);
  const models = generateMockModels(schema);
  const evaluation = generateMockEvaluation();
  const results = generateMockResults(headers, rows, schema);
  const timeSeriesData = generateTimeSeriesData(rows, schema);
  const distributionData = generateDistributionData(rows, schema);
  
  const anomalyCount = results.filter(r => r.anomalyScore > 0.7).length;
  
  return {
    schema,
    preprocessing,
    models,
    evaluation,
    summary: {
      rows: rows.length,
      columns: headers,
      anomalyCount,
      topReasons: [
        'Statistical outliers in numeric features',
        'Rare category combinations detected',
        'Time-based pattern deviation',
        'Multi-dimensional isolation',
      ],
    },
    results,
    timeSeriesData,
    distributionData,
  };
}
