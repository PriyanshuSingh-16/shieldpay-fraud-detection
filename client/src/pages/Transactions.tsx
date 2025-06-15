import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import FileUpload from "@/components/FileUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Upload, Download, Flag, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface TransactionAnalysisResult {
  success: boolean;
  analysis: {
    totalAnalyzed: number;
    suspiciousCount: number;
    highRiskCount: number;
    patterns: {
      smurfing: number;
      flashLaundering: number;
      muleNetworks: number;
      circularTransfers: number;
    };
    flaggedTransactions: Array<{
      id: number;
      pattern: string;
      riskScore: number;
      description: string;
    }>;
  };
}

export default function Transactions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [analysisResult, setAnalysisResult] = useState<TransactionAnalysisResult | null>(null);
  const [analysisOptions, setAnalysisOptions] = useState({
    smurfing: true,
    flashLaundering: true,
    muleNetworks: true,
    circularTransfers: false,
  });

  const { data: transactions } = useQuery({
    queryKey: ['/api/transactions'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('transactionFile', file);
      return apiClient.postFormData('/analyze-transactions', formData);
    },
    onSuccess: (data: TransactionAnalysisResult) => {
      setAnalysisResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: "Transaction Analysis Complete",
        description: `Analyzed ${data.analysis.totalAnalyzed} transactions, found ${data.analysis.highRiskCount} high-risk cases`,
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze transaction data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const flagAccountMutation = useMutation({
    mutationFn: async ({ accountId, flagReason, riskScore }: { 
      accountId: string; 
      flagReason: string; 
      riskScore: number; 
    }) => {
      return apiClient.post('/flag-account', { accountId, flagReason, riskScore });
    },
    onSuccess: () => {
      toast({
        title: "Account Flagged",
        description: "Account has been flagged for review",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/flagged-accounts'] });
    },
  });

  const handleFileSelect = (file: File) => {
    uploadMutation.mutate(file);
  };

  const handleFlagAccount = (transaction: any) => {
    flagAccountMutation.mutate({
      accountId: transaction.senderId,
      flagReason: transaction.pattern || 'Suspicious transaction pattern',
      riskScore: transaction.riskScore || 50,
    });
  };

  const chartData = analysisResult ? [
    { name: 'Normal', count: analysisResult.analysis.totalAnalyzed - analysisResult.analysis.suspiciousCount - analysisResult.analysis.highRiskCount },
    { name: 'Smurfing', count: analysisResult.analysis.patterns.smurfing },
    { name: 'Flash Transfer', count: analysisResult.analysis.patterns.flashLaundering },
    { name: 'Mule Network', count: analysisResult.analysis.patterns.muleNetworks },
    { name: 'Circular', count: analysisResult.analysis.patterns.circularTransfers },
  ] : [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          <Card className="shield-bg-surface shield-border border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Transaction Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={handleFileSelect}
                acceptedTypes=".csv,.json,application/json,text/csv"
                title="Upload CSV or JSON transaction file"
                description="Supported formats: .csv, .json (max 10MB)"
                icon="file"
              />
            </CardContent>
          </Card>
        </div>

        {/* Analysis Options */}
        <Card className="shield-bg-surface shield-border border">
          <CardHeader>
            <CardTitle className="text-white">Analysis Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <Checkbox 
                  checked={analysisOptions.smurfing}
                  onCheckedChange={(checked) => 
                    setAnalysisOptions(prev => ({ ...prev, smurfing: checked as boolean }))
                  }
                />
                <span className="text-gray-300 text-sm">Smurfing Detection</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox 
                  checked={analysisOptions.flashLaundering}
                  onCheckedChange={(checked) => 
                    setAnalysisOptions(prev => ({ ...prev, flashLaundering: checked as boolean }))
                  }
                />
                <span className="text-gray-300 text-sm">Flash Laundering</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox 
                  checked={analysisOptions.muleNetworks}
                  onCheckedChange={(checked) => 
                    setAnalysisOptions(prev => ({ ...prev, muleNetworks: checked as boolean }))
                  }
                />
                <span className="text-gray-300 text-sm">Mule Networks</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox 
                  checked={analysisOptions.circularTransfers}
                  onCheckedChange={(checked) => 
                    setAnalysisOptions(prev => ({ ...prev, circularTransfers: checked as boolean }))
                  }
                />
                <span className="text-gray-300 text-sm">Circular Transfers</span>
              </label>
            </div>
            <Button 
              className="w-full bg-yellow-600 hover:bg-yellow-700"
              disabled={uploadMutation.isPending || !transactions?.length}
              onClick={() => {
                // Trigger analysis of existing transactions
                uploadMutation.mutate(new File([], 'existing-transactions'));
              }}
            >
              {uploadMutation.isPending ? 'Analyzing...' : 'Start Analysis'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <Card className="shield-bg-surface shield-border border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Transaction Pattern Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 shield-bg-surface-light rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {analysisResult.analysis.totalAnalyzed.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">Transactions Analyzed</div>
              </div>
              <div className="text-center p-4 shield-bg-surface-light rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">
                  {analysisResult.analysis.suspiciousCount}
                </div>
                <div className="text-gray-400 text-sm">Suspicious Patterns</div>
              </div>
              <div className="text-center p-4 shield-bg-surface-light rounded-lg">
                <div className="text-2xl font-bold text-red-400">
                  {analysisResult.analysis.highRiskCount}
                </div>
                <div className="text-gray-400 text-sm">High Risk Cases</div>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid #374151',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="count" fill="#1E3A8A" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Flagged Transactions Table */}
      <Card className="shield-bg-surface shield-border border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Flagged Transactions
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select defaultValue="all-risk">
                <SelectTrigger className="w-40 shield-bg-surface-light shield-border border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-risk">All Risk Levels</SelectItem>
                  <SelectItem value="high-risk">High Risk Only</SelectItem>
                  <SelectItem value="medium-risk">Medium Risk</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="shield-bg-primary hover:bg-blue-700">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="shield-border border-b">
                  <th className="text-left py-3 text-gray-400 font-medium">Time</th>
                  <th className="text-left py-3 text-gray-400 font-medium">From</th>
                  <th className="text-left py-3 text-gray-400 font-medium">To</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Amount</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Pattern</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Risk Score</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {transactions && transactions.filter((tx: any) => (tx.riskScore || 0) > 40).length > 0 ? 
                  transactions.filter((tx: any) => (tx.riskScore || 0) > 40).slice(0, 10).map((tx: any) => (
                    <tr key={tx.id}>
                      <td className="py-3 text-white text-sm">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 text-white text-sm">{tx.senderId}</td>
                      <td className="py-3 text-white text-sm">{tx.receiverId}</td>
                      <td className="py-3 text-white text-sm">₹{parseFloat(tx.amount).toLocaleString()}</td>
                      <td className="py-3">
                        <Badge variant={tx.patternType === 'smurfing' ? "default" : "destructive"}>
                          {tx.patternType || 'suspicious'}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge variant={(tx.riskScore || 0) > 80 ? "destructive" : "secondary"}>
                          {tx.riskScore || 0}%
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary hover:text-blue-400"
                          onClick={() => handleFlagAccount(tx)}
                          disabled={flagAccountMutation.isPending}
                        >
                          <Flag className="h-4 w-4 mr-1" />
                          Flag
                        </Button>
                      </td>
                    </tr>
                  )) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      No flagged transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
