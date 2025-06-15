import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Flag, Search, Eye, Edit, Calendar, User, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Flagged() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  const { data: flaggedAccounts, isLoading } = useQuery({
    queryKey: ['/api/flagged-accounts'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiClient.patch(`/flagged-accounts/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flagged-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Status Updated",
        description: "Account status has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update account status",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-600';
      case 'under-investigation':
        return 'bg-orange-600';
      case 'resolved':
        return 'bg-green-600';
      case 'false-positive':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'under-investigation':
        return 'Under Investigation';
      case 'resolved':
        return 'Resolved';
      case 'false-positive':
        return 'False Positive';
      default:
        return status;
    }
  };

  const getRiskLevel = (riskScore: number) => {
    if (riskScore >= 80) return { label: 'High', color: 'bg-red-600' };
    if (riskScore >= 50) return { label: 'Medium', color: 'bg-yellow-600' };
    return { label: 'Low', color: 'bg-green-600' };
  };

  const filteredAccounts = flaggedAccounts?.filter((account: any) => {
    const matchesSearch = account.accountId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.flagReason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all-status' || account.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const totalFlagged = flaggedAccounts?.length || 0;
  const pendingReview = flaggedAccounts?.filter((acc: any) => acc.status === 'pending').length || 0;
  const resolved = flaggedAccounts?.filter((acc: any) => acc.status === 'resolved').length || 0;

  const handleStatusUpdate = (accountId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: accountId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shield-bg-surface shield-border border text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-400">{totalFlagged}</div>
            <div className="text-gray-400 text-sm">Total Flagged</div>
          </CardContent>
        </Card>
        <Card className="shield-bg-surface shield-border border text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-400">{pendingReview}</div>
            <div className="text-gray-400 text-sm">Pending Review</div>
          </CardContent>
        </Card>
        <Card className="shield-bg-surface shield-border border text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">{resolved}</div>
            <div className="text-gray-400 text-sm">Resolved</div>
          </CardContent>
        </Card>
      </div>

      {/* Flagged Accounts Table */}
      <Card className="shield-bg-surface shield-border border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Flagged UPI Accounts
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 shield-bg-surface-light shield-border border text-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 shield-bg-surface-light shield-border border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under-investigation">Under Investigation</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="false-positive">False Positive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="shield-border border-b">
                  <th className="text-left py-3 text-gray-400 font-medium">Account ID</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Flag Reason</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Risk Score</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Flagged Date</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredAccounts.length > 0 ? filteredAccounts.map((account: any) => {
                  const riskLevel = getRiskLevel(account.riskScore);
                  return (
                    <tr key={account.id}>
                      <td className="py-3 text-white font-mono text-sm">{account.accountId}</td>
                      <td className="py-3 text-white">{account.flagReason}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Badge className={riskLevel.color}>
                            {account.riskScore}%
                          </Badge>
                          <span className="text-xs text-gray-400">{riskLevel.label}</span>
                        </div>
                      </td>
                      <td className="py-3 text-white text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(account.flaggedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge className={getStatusColor(account.status)}>
                          {getStatusLabel(account.status)}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-primary hover:text-blue-400"
                                onClick={() => setSelectedAccount(account)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="shield-bg-surface shield-border border max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-white flex items-center gap-2">
                                  <User className="h-5 w-5" />
                                  Account Details
                                </DialogTitle>
                                <DialogDescription className="text-gray-400">
                                  Detailed information about the flagged account
                                </DialogDescription>
                              </DialogHeader>
                              {selectedAccount && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-400">Account ID</label>
                                      <p className="text-white font-mono">{selectedAccount.accountId}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-400">Risk Score</label>
                                      <div className="flex items-center gap-2">
                                        <Badge className={getRiskLevel(selectedAccount.riskScore).color}>
                                          {selectedAccount.riskScore}%
                                        </Badge>
                                        <span className="text-sm text-gray-300">
                                          {getRiskLevel(selectedAccount.riskScore).label} Risk
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium text-gray-400">Flag Reason</label>
                                    <p className="text-white">{selectedAccount.flagReason}</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-400">Flagged Date</label>
                                      <p className="text-white">{new Date(selectedAccount.flaggedAt).toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-400">Current Status</label>
                                      <Badge className={getStatusColor(selectedAccount.status)}>
                                        {getStatusLabel(selectedAccount.status)}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  {selectedAccount.reviewedAt && (
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-gray-400">Reviewed Date</label>
                                        <p className="text-white">{new Date(selectedAccount.reviewedAt).toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-400">Reviewed By</label>
                                        <p className="text-white">{selectedAccount.reviewedBy || 'System'}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {account.status !== 'resolved' && (
                            <Select 
                              value={account.status}
                              onValueChange={(value) => handleStatusUpdate(account.id, value)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-32 h-8 shield-bg-surface-light shield-border border text-white text-xs">
                                <Edit className="h-3 w-3 mr-1" />
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="under-investigation">Under Investigation</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="false-positive">False Positive</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="h-12 w-12 text-gray-400" />
                        <div>
                          <h3 className="text-lg font-medium text-white mb-1">No Flagged Accounts</h3>
                          <p className="text-gray-400">
                            {searchQuery || statusFilter !== 'all-status' 
                              ? 'No accounts match your current filters'
                              : 'No accounts have been flagged yet'
                            }
                          </p>
                        </div>
                        {(searchQuery || statusFilter !== 'all-status') && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSearchQuery('');
                              setStatusFilter('all-status');
                            }}
                            className="text-primary hover:text-blue-400"
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {filteredAccounts.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
              <div>
                Showing {filteredAccounts.length} of {totalFlagged} flagged accounts
              </div>
              <div className="flex items-center gap-4">
                <span>Updated: {new Date().toLocaleTimeString()}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
