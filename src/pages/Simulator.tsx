import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const Simulator = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("");
  const [fraudScore, setFraudScore] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);

    // TODO: Replace with actual API call to your Python backend
    // For now, using mock scoring logic
    setTimeout(() => {
      const mockScore = Math.random() * 0.3 + (parseFloat(amount) > 1000 ? 0.5 : 0);
      setFraudScore(mockScore);
      setIsSimulating(false);
      toast.success("Transaction analyzed!");
    }, 1500);
  };

  const getRiskLevel = (score: number) => {
    if (score < 0.3) return { label: "Low Risk", color: "success", icon: CheckCircle };
    if (score < 0.7) return { label: "Medium Risk", color: "warning", icon: AlertTriangle };
    return { label: "High Risk", color: "destructive", icon: AlertTriangle };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Fraud Detection</h1>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Simulator</CardTitle>
              <CardDescription>
                Test your fraud detection model with sample transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSimulate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merchant">Merchant</Label>
                  <Input
                    id="merchant"
                    placeholder="Amazon Store"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="Electronics"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSimulating}>
                  {isSimulating ? "Analyzing..." : "Analyze Transaction"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Fraud risk assessment for the transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fraudScore === null ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Submit a transaction to see risk analysis
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                      <span className="text-2xl font-bold">
                        {(fraudScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Fraud Probability</p>
                    {(() => {
                      const risk = getRiskLevel(fraudScore);
                      const RiskIcon = risk.icon;
                      return (
                        <Badge variant={risk.color as any} className="text-sm">
                          <RiskIcon className="h-3 w-3 mr-1" />
                          {risk.label}
                        </Badge>
                      );
                    })()}
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-semibold text-sm">Transaction Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium">${amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Merchant:</span>
                        <span className="font-medium">{merchant}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium">{category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground pt-4 border-t">
                    Note: This is a mock prediction. Connect your Python backend to use actual trained models.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Simulator;
