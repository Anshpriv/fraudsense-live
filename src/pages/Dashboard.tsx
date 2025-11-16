import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Activity, TrendingUp, LogOut, Shield } from "lucide-react";
import { toast } from "sonner";

interface ModelMetrics {
  precision: number;
  recall: number;
  roc_auc: number;
}

interface Model {
  id: string;
  version: string;
  status: string;
  metrics: any;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchModels();
    }
  }, [user]);

  const fetchModels = async () => {
    const { data, error } = await supabase
      .from("models")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      toast.error("Failed to fetch models");
    } else {
      setModels(data || []);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Fraud Detection</h1>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
            <p className="text-muted-foreground">
              Manage your fraud detection models and upload new training data
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/upload")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload Data
                </CardTitle>
                <CardDescription>Upload CSV files to train new models</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/simulator")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-secondary" />
                  Test Model
                </CardTitle>
                <CardDescription>Simulate transactions and test detection</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Analytics
                </CardTitle>
                <CardDescription>View model performance metrics</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Models</CardTitle>
              <CardDescription>Your latest trained fraud detection models</CardDescription>
            </CardHeader>
            <CardContent>
              {models.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No models trained yet</p>
                  <Button onClick={() => navigate("/upload")}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Training Data
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {models.map((model) => (
                    <div
                      key={model.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{model.version}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(model.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {model.metrics && typeof model.metrics === 'object' && (
                          <div className="text-sm space-y-1">
                            <p>Precision: {((model.metrics as ModelMetrics).precision * 100).toFixed(1)}%</p>
                            <p>Recall: {((model.metrics as ModelMetrics).recall * 100).toFixed(1)}%</p>
                          </div>
                        )}
                        <Badge
                          variant={model.status === "completed" ? "default" : "secondary"}
                        >
                          {model.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
