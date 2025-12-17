import { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }, []);

  const handleAnalyze = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={cn(
          'relative rounded-2xl border-2 border-dashed transition-all duration-300',
          'glass gradient-border overflow-hidden',
          dragActive
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50',
          isProcessing && 'pointer-events-none opacity-70'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Scan line effect */}
        {dragActive && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
          </div>
        )}

        <div className="p-12 text-center">
          {selectedFile ? (
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-4 px-6 py-4 rounded-xl bg-secondary/50">
                <FileText className="w-10 h-10 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={clearFile}
                  className="p-1 rounded-lg hover:bg-destructive/20 transition-colors"
                  disabled={isProcessing}
                >
                  <X className="w-5 h-5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>

              <Button
                variant="glow"
                size="xl"
                onClick={handleAnalyze}
                disabled={isProcessing}
                className="w-full max-w-xs"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Start Analysis
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={cn(
                'inline-flex p-6 rounded-2xl transition-all duration-300',
                dragActive ? 'bg-primary/20 animate-pulse-glow' : 'bg-secondary/50'
              )}>
                <Upload className={cn(
                  'w-12 h-12 transition-colors',
                  dragActive ? 'text-primary' : 'text-muted-foreground'
                )} />
              </div>

              <div className="space-y-2">
                <p className="text-xl font-medium text-foreground">
                  Drop your CSV file here
                </p>
                <p className="text-muted-foreground">
                  or click to browse
                </p>
              </div>

              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="px-3 py-1 rounded-full bg-secondary/50 font-mono">.csv</span>
                <span>Max 1000MB</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
