import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle, Eye, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Alerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['/api/admin/alerts'],
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: number) => {
      return apiClient.patch(`/alerts/${alertId}/acknowledge`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/alerts/active'] });
      toast({
        title: "Alert Acknowledged",
        description: "Alert has been marked as acknowledged",
      });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-600';
      case 'medium':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-700 bg-red-900/20';
      case 'high':
        return 'border-orange-700 bg-orange-900/20';
      case 'medium':
        return 'border-yellow-700 bg-yellow-900/20';
      default:
        return 'border-gray-700 bg-gray-900/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'qr-steganography':
        return '🔍';
      case 'transaction-fraud':
        return '💰';
      case 'account-flagged':
        return '🚩';
      default:
        return '⚠️';
    }
  };

  const activeAlerts = alerts?.filter((alert: any) => alert.status === 'active') || [];
  const criticalAlerts = activeAlerts.filter((alert: any) => alert.severity === 'critical');
  const highAlerts = activeAlerts.filter((alert: any) => alert.severity === 'high');
  const mediumAlerts = activeAlerts.filter((alert: any) => alert.severity === 'medium');
  const resolvedToday = alerts?.filter((alert: any) => 
    alert.status === 'acknowledged' && 
    new Date(alert.createdAt).toDateString() === new Date().toDateString()
  ).length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Alert Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="shield-bg-surface shield-border border text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-400">{criticalAlerts.length}</div>
            <div className="text-gray-400 text-sm">Critical Alerts</div>
          </CardContent>
        </Card>
        <Card className="shield-bg-surface shield-border border text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-400">{highAlerts.length}</div>
            <div className="text-gray-400 text-sm">High Priority</div>
          </CardContent>
        </Card>
        <Card className="shield-bg-surface shield-border border text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-400">{mediumAlerts.length}</div>
            <div className="text-gray-400 text-sm">Medium Priority</div>
          </CardContent>
        </Card>
        <Card className="shield-bg-surface shield-border border text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-400">{resolvedToday}</div>
            <div className="text-gray-400 text-sm">Resolved Today</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card className="shield-bg-surface shield-border border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Security Alerts
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select defaultValue="all-priorities">
                <SelectTrigger className="w-40 shield-bg-surface-light shield-border border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-priorities">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical Only</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                size="sm" 
                className="shield-bg-primary hover:bg-blue-700"
                onClick={() => {
                  activeAlerts.forEach((alert: any) => {
                    if (!alert.acknowledged) {
                      acknowledgeMutation.mutate(alert.id);
                    }
                  });
                }}
                disabled={acknowledgeMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark All Read
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeAlerts.length > 0 ? activeAlerts.map((alert: any) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityBorder(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="text-2xl mr-3 mt-1">
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">{alert.title}</h4>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        {alert.riskScore && (
                          <span>Risk Score: {alert.riskScore}%</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                        <span>Module: {alert.type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-white hover:text-gray-300"
                      onClick={() => acknowledgeMutation.mutate(alert.id)}
                      disabled={acknowledgeMutation.isPending || alert.acknowledged}
                    >
                      {alert.acknowledged ? 'Acknowledged' : 'Acknowledge'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-primary hover:text-blue-400"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
                <h3 className="text-lg font-medium text-white mb-2">No Active Alerts</h3>
                <p>All security alerts have been addressed.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
