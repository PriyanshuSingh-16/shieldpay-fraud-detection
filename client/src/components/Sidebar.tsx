import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { 
  Shield, 
  BarChart3, 
  QrCode, 
  ArrowLeftRight, 
  AlertTriangle, 
  Flag, 
  User,
  LogOut
} from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3, active: location === '/' },
    { name: 'QR Scanner', href: '/qr-scanner', icon: QrCode, active: location === '/qr-scanner' },
    { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight, active: location === '/transactions' },
    { 
      name: 'Alerts', 
      href: '/alerts', 
      icon: AlertTriangle, 
      active: location === '/alerts',
      badge: stats?.activeAlerts || 0
    },
    { name: 'Flagged Accounts', href: '/flagged', icon: Flag, active: location === '/flagged' },
  ];

  return (
    <div className="w-64 shield-bg-surface shield-border border-r flex flex-col">
      {/* Logo */}
      <div className="p-6 shield-border border-b">
        <div className="flex items-center">
          <Shield className="text-2xl text-primary mr-3" />
          <div>
            <h1 className="text-xl font-bold text-white">ShieldPay</h1>
            <p className="text-xs text-gray-400">Fraud Detection System</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link href={item.href}>
                <a className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? 'shield-bg-primary text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}>
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User Profile */}
      <div className="p-4 shield-border border-t">
        <div className="flex items-center">
          <div className="w-8 h-8 shield-bg-primary rounded-full flex items-center justify-center mr-3">
            <User className="text-white text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{user?.username || 'Admin User'}</p>
            <p className="text-xs text-gray-400">Security Analyst</p>
          </div>
          <button 
            onClick={logout}
            className="text-gray-400 hover:text-white p-1 rounded"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
