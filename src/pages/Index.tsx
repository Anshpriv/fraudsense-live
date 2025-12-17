import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { FileUpload } from '@/components/FileUpload';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { SchemaDisplay } from '@/components/SchemaDisplay';
import { MetricsCard } from '@/components/MetricsCard';
import { AnomalyTable } from '@/components/AnomalyTable';
import { TimeSeriesChart } from '@/components/TimeSeriesChart';
import { DistributionChart } from '@/components/DistributionChart';
import { ModelPerformance } from '@/components/ModelPerformance';
import { AnalysisResult, ProcessingStage } from '@/types/anomaly';
import { analyzeCSV } from '@/lib/mockAnalysis';
import { Database, AlertTriangle, Layers, TrendingUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const simulateProcessing = useCallback(async (content: string) => {
    const stages: ProcessingStage[] = [
      'uploading',
      'parsing',
      'inferring',
      'preprocessing',
      'training',
      'evaluating',
    ];

    for (const s of stages) {
      setStage(s);
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
    }

    const analysisResult = await analyzeCSV(content);
    setResult(analysisResult);
    setStage('complete');
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      if (file.size > 200 * 1024 * 1024) { // 200MB
        console.warn(
          `Warning: You are attempting to load a large file (${(file.size / 1024 / 1024).toFixed(2)} MB). ` +
          `This may cause the browser to become unresponsive or crash.`
        );
      }
      const content = await file.text();
      await simulateProcessing(content);
    } catch (error) {
      console.error('Error processing file:', error);
      setStage('error');
    }
  }, [simulateProcessing]);

  const handleReset = () => {
    setStage('idle');
    setResult(null);
  };

  const isProcessing = stage !== 'idle' && stage !== 'complete' && stage !== 'error';
  const showResults = stage === 'complete' && result;

  return (
    <div className="min-h-screen bg-background data-grid">
      <Header />

      <main className="container mx-auto px-6 py-12">
        {stage === 'idle' && (
          <div className="space-y-12 animate-fade-in">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Detect Anomalies with{' '}
                <span className="text-gradient">Machine Learning</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Upload any CSV dataset and our ensemble ML engine will automatically
                infer schema, preprocess data, train multiple models, and identify
                anomalies with high accuracy.
              </p>
            </div>

            {/* File Upload */}
            <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: Database,
                  title: 'Auto Schema Detection',
                  description: 'Automatically infers column types and relationships',
                },
                {
                  icon: Layers,
                  title: 'Ensemble Models',
                  description: 'IsolationForest, LightGBM, LOF, HBOS combined',
                },
                {
                  icon: TrendingUp,
                  title: 'Instant Insights',
                  description: 'Visual charts and detailed anomaly explanations',
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className="glass rounded-xl p-6 gradient-border text-center animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="inline-flex p-3 rounded-xl bg-primary/20 mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="py-12 animate-fade-in">
            <ProcessingStatus stage={stage} />
          </div>
        )}

        {/* Results Dashboard */}
        {showResults && (
          <div className="space-y-8 animate-fade-in">
            {/* Header with Reset */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Analysis Complete</h2>
                <p className="text-muted-foreground">
                  Processed {result.summary.rows.toLocaleString()} rows across {result.summary.columns.length} columns
                </p>
              </div>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricsCard
                title="Total Rows"
                value={result.summary.rows.toLocaleString()}
                icon={Database}
                variant="default"
              />
              <MetricsCard
                title="Anomalies Detected"
                value={result.summary.anomalyCount}
                subtitle={`${((result.summary.anomalyCount / result.summary.rows) * 100).toFixed(1)}% of data`}
                icon={AlertTriangle}
                variant="anomaly"
              />
              <MetricsCard
                title="Models Trained"
                value={result.models.length}
                icon={Layers}
                variant="success"
              />
              <MetricsCard
                title="F1 Score"
                value={result.evaluation.f1Score ? `${(result.evaluation.f1Score * 100).toFixed(1)}%` : '—'}
                icon={TrendingUp}
                variant="success"
              />
            </div>

            {/* Schema & Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SchemaDisplay schema={result.schema} />
              {result.timeSeriesData && result.timeSeriesData.length > 0 && (
                <TimeSeriesChart data={result.timeSeriesData} />
              )}
            </div>

            {/* Distribution Chart */}
            {result.distributionData && result.distributionData.length > 0 && (
              <DistributionChart data={result.distributionData} />
            )}

            {/* Model Performance */}
            <ModelPerformance models={result.models} evaluation={result.evaluation} />

            {/* Anomaly Table */}
            <AnomalyTable results={result.results} />

            {/* Summary Insights */}
            <div className="glass rounded-2xl p-6 gradient-border">
              <h3 className="font-semibold text-foreground mb-4">Key Findings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.summary.topReasons.map((reason, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                  >
                    <div className="p-1.5 rounded bg-warning/20">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                    </div>
                    <p className="text-sm text-muted-foreground">{reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12">
        <div className="container mx-auto px-6 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Powered by ensemble machine learning • IsolationForest • LightGBM • LOF • HBOS
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
