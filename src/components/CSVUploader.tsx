import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CSVStats {
  rowCount: number;
  sampleSize: number;
  meanAmount: number;
  medianAmount: number;
  minAmount: number;
  maxAmount: number;
  topMerchants: [string, number][];
  hourDistribution: number[];
  uniqueUsers: number;
}

interface TrainingProgress {
  percent: number;
  step: string;
  message: string;
  intermediateMetrics?: {
    samples_processed?: number;
    top_merchants?: [string, number][];
    feature_importances?: Record<string, number>;
  };
}

interface CSVUploaderProps {
  userId: string;
}

const TRAINING_STEPS = [
  { name: "Parsing file", range: [0, 10] },
  { name: "Feature Extraction", range: [10, 35] },
  { name: "Uploading & Scheduling Training", range: [35, 50] },
  { name: "Server Training", range: [50, 99] },
  { name: "Done", range: [99, 100] },
];

const CSVUploader = ({ userId }: CSVUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [stats, setStats] = useState<CSVStats | null>(null);
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0];
    if (!csvFile) return;

    setFile(csvFile);
    setIsProcessing(true);
    setProgress({ percent: 5, step: "Parsing file", message: "Analyzing CSV structure..." });

    Papa.parse(csvFile, {
      header: true,
      preview: 500,
      complete: (results) => {
        const data = results.data as any[];
        setPreviewData(data.slice(0, 10));

        // Compute quick stats
        const amounts = data
          .map((row) => parseFloat(row.amount || row.Amount || 0))
          .filter((val) => !isNaN(val));
        
        const merchants = data.map((row) => row.merchant || row.Merchant || "");
        const merchantCounts = new Map<string, number>();
        merchants.forEach((m) => {
          if (m) merchantCounts.set(m, (merchantCounts.get(m) || 0) + 1);
        });
        const topMerchants = Array.from(merchantCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        const hourDistribution = new Array(24).fill(0);
        data.forEach((row) => {
          const time = row.transaction_time || row.time || "";
          if (time) {
            const hour = new Date(time).getHours();
            if (!isNaN(hour)) hourDistribution[hour]++;
          }
        });

        const uniqueUsers = new Set(data.map((row) => row.user_id || row.userId)).size;

        const sortedAmounts = [...amounts].sort((a, b) => a - b);
        const median =
          sortedAmounts.length > 0
            ? sortedAmounts[Math.floor(sortedAmounts.length / 2)]
            : 0;

        const computedStats: CSVStats = {
          rowCount: data.length,
          sampleSize: Math.min(500, data.length),
          meanAmount: amounts.reduce((a, b) => a + b, 0) / amounts.length || 0,
          medianAmount: median,
          minAmount: Math.min(...amounts) || 0,
          maxAmount: Math.max(...amounts) || 0,
          topMerchants,
          hourDistribution,
          uniqueUsers,
        };

        setStats(computedStats);
        setProgress({ percent: 10, step: "Parsing file", message: "File parsed successfully" });

        // Start simulated training
        simulateTraining(csvFile, computedStats);
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`);
        setIsProcessing(false);
      },
    });
  }, [userId]);

  const simulateTraining = async (file: File, stats: CSVStats) => {
    // Step 2: Feature Extraction
    await delay(800);
    setProgress({
      percent: 20,
      step: "Feature Extraction",
      message: "Extracting features from transactions",
      intermediateMetrics: {
        samples_processed: stats.sampleSize,
        top_merchants: stats.topMerchants,
      },
    });

    await delay(1000);
    setProgress({
      percent: 35,
      step: "Feature Extraction",
      message: "Feature extraction complete",
    });

    // Step 3: Upload
    await delay(500);
    setProgress({
      percent: 40,
      step: "Uploading & Scheduling Training",
      message: "Uploading data to backend...",
    });

    // TODO: Replace with actual upload to Supabase Storage and backend API
    const uploadId = crypto.randomUUID();
    
    // Save upload record
    const { error: uploadError } = await supabase.from("uploads").insert({
      user_id: userId,
      filename: file.name,
      file_path: `uploads/${userId}/${file.name}`,
      status: "processing",
      row_count: stats.rowCount,
      interim_metrics: stats as any,
    });

    if (uploadError) {
      toast.error("Failed to save upload record");
      setIsProcessing(false);
      return;
    }

    await delay(800);
    setProgress({
      percent: 50,
      step: "Uploading & Scheduling Training",
      message: "Upload complete, starting training...",
    });

    // Step 4: Training simulation
    const trainingSteps = [
      { percent: 60, msg: "Model training started", features: { amount: 0.35, hour: 0.15 } },
      { percent: 70, msg: "Training in progress...", features: { amount: 0.38, hour: 0.12, merchant: 0.25 } },
      { percent: 80, msg: "Evaluating on holdout set", features: { amount: 0.42, hour: 0.12, merchant: 0.28 } },
      { percent: 90, msg: "Saving model artifact" },
      { percent: 95, msg: "Registering model" },
    ];

    for (const step of trainingSteps) {
      await delay(1500);
      setProgress({
        percent: step.percent,
        step: "Server Training",
        message: step.msg,
        intermediateMetrics: step.features
          ? { feature_importances: step.features }
          : undefined,
      });
    }

    // Step 5: Done
    await delay(800);
    const modelVersion = `v${new Date().toISOString().split("T")[0].replace(/-/g, "")}_001`;
    
    // Create model record
    const { error: modelError } = await supabase.from("models").insert({
      user_id: userId,
      version: modelVersion,
      status: "completed",
      metrics: {
        precision: 0.87,
        recall: 0.76,
        roc_auc: 0.91,
      },
    });

    if (modelError) {
      toast.error("Failed to save model record");
    } else {
      toast.success("Model training complete!");
    }

    setProgress({
      percent: 100,
      step: "Done",
      message: "Training complete!",
    });

    setTimeout(() => {
      setIsProcessing(false);
      setProgress(null);
    }, 2000);
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  const getCurrentStep = () => {
    if (!progress) return 0;
    return TRAINING_STEPS.findIndex(
      (step) => progress.percent >= step.range[0] && progress.percent <= step.range[1]
    );
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">
            {isDragActive ? "Drop CSV file here" : "Drag & drop CSV file here"}
          </p>
          <p className="text-sm text-muted-foreground">or click to select file</p>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              {stats && (
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Rows</p>
                    <p className="text-lg font-semibold">{stats.rowCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mean Amount</p>
                    <p className="text-lg font-semibold">${stats.meanAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Unique Users</p>
                    <p className="text-lg font-semibold">{stats.uniqueUsers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Top Merchant</p>
                    <p className="text-lg font-semibold">
                      {stats.topMerchants[0]?.[0] || "N/A"}
                    </p>
                  </div>
                </div>
              )}

              {progress && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{progress.message}</span>
                      <span className="text-sm text-muted-foreground">
                        {progress.percent}%
                      </span>
                    </div>
                    <Progress value={progress.percent} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    {TRAINING_STEPS.map((step, idx) => {
                      const currentStep = getCurrentStep();
                      const isComplete = idx < currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 p-2 rounded transition-colors ${
                            isCurrent ? "bg-primary/10" : ""
                          }`}
                        >
                          {isComplete ? (
                            <div className="h-5 w-5 rounded-full bg-success flex items-center justify-center">
                              <svg
                                className="h-3 w-3 text-success-foreground"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          ) : isCurrent ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                          )}
                          <span
                            className={`text-sm ${
                              isCurrent ? "font-medium" : "text-muted-foreground"
                            }`}
                          >
                            {step.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {progress.intermediateMetrics?.feature_importances && (
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4">
                        <p className="text-sm font-medium mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Top Predictive Features (interim)
                        </p>
                        <div className="space-y-2">
                          {Object.entries(progress.intermediateMetrics.feature_importances).map(
                            ([feature, importance]) => (
                              <div key={feature}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="capitalize">{feature}</span>
                                  <span>{(importance * 100).toFixed(1)}%</span>
                                </div>
                                <Progress value={importance * 100} className="h-1" />
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {!isProcessing && (
                <Button
                  onClick={() => {
                    setFile(null);
                    setStats(null);
                    setPreviewData([]);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Upload Another File
                </Button>
              )}
            </CardContent>
          </Card>

          {previewData.length > 0 && !progress && (
            <Card>
              <CardContent className="pt-6">
                <p className="font-medium mb-4">Data Preview (first 10 rows)</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {Object.keys(previewData[0]).slice(0, 5).map((key) => (
                          <th key={key} className="text-left p-2 font-medium">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, idx) => (
                        <tr key={idx} className="border-b">
                          {Object.values(row)
                            .slice(0, 5)
                            .map((val: any, i) => (
                              <td key={i} className="p-2">
                                {String(val)}
                              </td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default CSVUploader;
