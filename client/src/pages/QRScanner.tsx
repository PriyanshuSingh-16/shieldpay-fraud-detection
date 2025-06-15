import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import FileUpload from "@/components/FileUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, CheckCircle, AlertTriangle, XCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRAnalysisResult {
  success: boolean;
  analysis: {
    riskScore: number;
    classification: 'clean' | 'suspicious' | 'high-risk';
    steganographyDetected: boolean;
    confidence: number;
    upiId?: string;
    merchantName?: string;
    amount?: number;
    details: {
      lsbDetection: string;
      cnnClassification: string;
      phishingCheck: string;
    };
  };
  qrCodeId: number;
}

export default function QRScanner() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [analysisResult, setAnalysisResult] = useState<QRAnalysisResult | null>(null);

  const { data: qrCodes } = useQuery({
    queryKey: ['/api/qr-codes'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('qrImage', file);
      return apiClient.postFormData('/upload-qr', formData);
    },
    onSuccess: (data: QRAnalysisResult) => {
      setAnalysisResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/qr-codes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: "QR Code Analyzed",
        description: `Risk Score: ${data.analysis.riskScore}% - ${data.analysis.classification}`,
        variant: data.analysis.riskScore > 70 ? "destructive" : "default",
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze QR code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    uploadMutation.mutate(file);
  };

  const getStatusColor = (classification: string) => {
    switch (classification) {
      case 'clean':
        return 'bg-green-500';
      case 'suspicious':
        return 'bg-yellow-500';
      case 'high-risk':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (classification: string) => {
    switch (classification) {
      case 'clean':
        return CheckCircle;
      case 'suspicious':
        return AlertTriangle;
      case 'high-risk':
        return XCircle;
      default:
        return QrCode;
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="shield-bg-surface shield-border border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Upload QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileSelect={handleFileSelect}
              acceptedTypes="image/*"
              title="Upload QR Code Image"
              description="Drag and drop QR code image here or click to browse"
              icon="image"
            />
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card className="shield-bg-surface shield-border border">
          <CardHeader>
            <CardTitle className="text-white">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {uploadMutation.isPending && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-300">Analyzing QR Code...</span>
              </div>
            )}

            {analysisResult && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${
                  analysisResult.analysis.classification === 'clean' 
                    ? 'bg-green-900/20 border-green-700'
                    : analysisResult.analysis.classification === 'suspicious'
                    ? 'bg-yellow-900/20 border-yellow-700'
                    : 'bg-red-900/20 border-red-700'
                }`}>
                  <div className="flex items-center mb-2">
                    {(() => {
                      const Icon = getStatusIcon(analysisResult.analysis.classification);
                      return <Icon className={`mr-2 h-5 w-5 ${
                        analysisResult.analysis.classification === 'clean' ? 'text-green-400' :
                        analysisResult.analysis.classification === 'suspicious' ? 'text-yellow-400' :
                        'text-red-400'
                      }`} />;
                    })()}
                    <span className="font-semibold text-white capitalize">
                      {analysisResult.analysis.classification.replace('-', ' ')} QR Code
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    {analysisResult.analysis.steganographyDetected 
                      ? 'Steganographic content detected' 
                      : 'No steganographic content detected'}
                  </p>
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-xs text-gray-400">Risk Score: </span>
                      <Badge variant={analysisResult.analysis.riskScore > 70 ? "destructive" : "secondary"}>
                        {analysisResult.analysis.riskScore}%
                      </Badge>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Confidence: </span>
                      <span className="text-green-400 font-medium">
                        {analysisResult.analysis.confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* QR Code Details */}
                <div className="space-y-2">
                  <h4 className="font-medium text-white">QR Code Details</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    {analysisResult.analysis.upiId && (
                      <p><span className="text-gray-400">UPI ID:</span> {analysisResult.analysis.upiId}</p>
                    )}
                    {analysisResult.analysis.merchantName && (
                      <p><span className="text-gray-400">Merchant:</span> {analysisResult.analysis.merchantName}</p>
                    )}
                    {analysisResult.analysis.amount && (
                      <p><span className="text-gray-400">Amount:</span> ₹{analysisResult.analysis.amount.toLocaleString()}</p>
                    )}
                  </div>
                </div>

                {/* Analysis Details */}
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Steganography Analysis</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>
                      <span className="text-gray-400">LSB Detection:</span>{' '}
                      <span className={analysisResult.analysis.details.lsbDetection === 'Clean' ? 'text-green-400' : 'text-red-400'}>
                        {analysisResult.analysis.details.lsbDetection}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-400">CNN Classification:</span>{' '}
                      <span className={analysisResult.analysis.details.cnnClassification === 'Normal' ? 'text-green-400' : 'text-yellow-400'}>
                        {analysisResult.analysis.details.cnnClassification}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-400">Phishing Check:</span>{' '}
                      <span className={analysisResult.analysis.details.phishingCheck === 'Clean' ? 'text-green-400' : 'text-red-400'}>
                        {analysisResult.analysis.details.phishingCheck}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!analysisResult && !uploadMutation.isPending && (
              <div className="text-center py-8 text-gray-400">
                Upload a QR code image to see analysis results
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent QR Scans */}
      <Card className="shield-bg-surface shield-border border">
        <CardHeader>
          <CardTitle className="text-white">Recent QR Code Scans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="shield-border border-b">
                  <th className="text-left py-3 text-gray-400 font-medium">Scan Time</th>
                  <th className="text-left py-3 text-gray-400 font-medium">UPI ID</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Risk Level</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Stego Detection</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {qrCodes && qrCodes.length > 0 ? qrCodes.slice(0, 10).map((qr: any) => (
                  <tr key={qr.id}>
                    <td className="py-3 text-white text-sm">
                      {new Date(qr.scannedAt).toLocaleString()}
                    </td>
                    <td className="py-3 text-white">{qr.upiId || 'N/A'}</td>
                    <td className="py-3">
                      <Badge className={getStatusColor(qr.classification)}>
                        {qr.classification}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={qr.steganographyDetected ? "destructive" : "secondary"}>
                        {qr.steganographyDetected ? 'LSB Detected' : 'Clean'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-blue-400">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No QR codes scanned yet
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
