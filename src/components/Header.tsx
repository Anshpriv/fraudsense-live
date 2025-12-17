import { Activity, Cpu } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-gradient">AnomalyDetect</h1>
              <p className="text-xs text-muted-foreground">ML-Powered Analysis Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50">
              <Cpu className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Ensemble Models Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
