import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import StatsCard from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeftRight, 
  AlertTriangle, 
  Ban, 
  QrCode,
  TrendingUp,
  Clock
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000,
  });

  const { data: alerts } = useQuery({
    queryKey: ['/api/alerts/active'],
  });

  // Mock chart data (in production, this would come from the API)
  const riskTrendsData = [
    { time: '00:00', riskScore: 12, transactions: 45 },
    { time: '04:00', riskScore: 19, transactions: 32 },
    { time: '08:00', riskScore: 15, transactions: 78 },
    { time: '12:00', riskScore: 25, transactions: 156 },
    { time: '16:00', riskScore: 32, transactions: 234 },
    { time: '20:00', riskScore: 28, transactions: 189 },
  ];

  const fraudDistributionData = [
    { name: 'Clean', value: 75, color: '#10B981' },
    { name: 'Suspicious', value: 18, color: '#F59E0B' },
    { name: 'High Risk', value: 7, color: '#EF4444' },
  ];

  const recentAlerts = alerts?.slice(0, 5) || [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Transactions"
          value={stats?.totalTransactions || 0}
          change="+12.5%"
          changeType="positive"
          icon={ArrowLeftRight}
          iconColor="bg-blue-500"
        />
        <StatsCard
          title="Suspicious Activity"
          value={stats?.suspiciousCount || 0}
          change="+3.2%"
          changeType="neutral"
          icon={AlertTriangle}
          iconColor="bg-yellow-500"
        />
        <StatsCard
          title="High Risk Cases"
          value={stats?.highRiskCount || 0}
          change="+1.8%"
          changeType="negative"
          icon={Ban}
          iconColor="bg-red-500"
        />
        <StatsCard
          title="QR Codes Scanned"
          value={stats?.qrScanned || 0}
          change="+8.1%"
          changeType="positive"
          icon={QrCode}
          iconColor="bg-green-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shield-bg-surface shield-border border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Transaction Risk Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={riskTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid #374151',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="riskScore" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Risk Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#1E3A8A" 
                  strokeWidth={2}
                  name="Transactions"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shield-bg-surface shield-border border">
          <CardHeader>
            <CardTitle className="text-white">Fraud Detection Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fraudDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {fraudDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid #374151',
                    borderRadius: '6px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="shield-bg-surface shield-border border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent High-Risk Alerts
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-blue-400">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="shield-border border-b">
                  <th className="text-left py-3 text-gray-400 font-medium">Time</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Type</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Account</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Risk Score</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {recentAlerts.length > 0 ? recentAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td className="py-3 text-white text-sm">
                      <Clock className="inline h-4 w-4 mr-1" />
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 text-white">{alert.type}</td>
                    <td className="py-3 text-white">{alert.accountId}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        (alert.riskScore || 0) > 80 
                          ? 'bg-red-600 text-white' 
                          : 'bg-yellow-600 text-white'
                      }`}>
                        {alert.riskScore}%
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        alert.status === 'active' 
                          ? 'bg-red-900 text-red-200' 
                          : 'bg-yellow-900 text-yellow-200'
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No recent alerts
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
