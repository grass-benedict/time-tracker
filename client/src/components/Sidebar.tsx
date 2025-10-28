import { Clock, LayoutDashboard, Users, FileText, Briefcase, Plane, BarChart3, Settings, User } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ThemeToggle } from './ThemeToggle';

type MenuItem = {
  icon: React.ReactNode;
  label: string;
  id: string;
};

type SidebarProps = {
  activeView: string;
  onViewChange: (view: string) => void;
  userName: string;
  userEmail: string;
  userRole: 'employee' | 'supervisor' | 'hr';
};

export function Sidebar({ activeView, onViewChange, userName, userEmail, userRole }: SidebarProps) {
  const employeeMenuItems: MenuItem[] = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', id: 'dashboard' },
    { icon: <Clock className="h-5 w-5" />, label: 'Time Entries', id: 'time-entries' },
    { icon: <Briefcase className="h-5 w-5" />, label: 'Projects', id: 'projects' },
    { icon: <Plane className="h-5 w-5" />, label: 'Vacation Requests', id: 'vacation' },
    { icon: <BarChart3 className="h-5 w-5" />, label: 'Reports', id: 'reports' },
    { icon: <Settings className="h-5 w-5" />, label: 'Settings', id: 'settings' },
  ];

  const supervisorMenuItems: MenuItem[] = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', id: 'dashboard' },
    { icon: <Users className="h-5 w-5" />, label: 'Team Overview', id: 'team' },
    { icon: <FileText className="h-5 w-5" />, label: 'Approvals', id: 'approvals' },
    { icon: <BarChart3 className="h-5 w-5" />, label: 'Reports', id: 'reports' },
    { icon: <Settings className="h-5 w-5" />, label: 'Settings', id: 'settings' },
  ];

  const hrMenuItems: MenuItem[] = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', id: 'dashboard' },
    { icon: <Users className="h-5 w-5" />, label: 'Employees', id: 'employees' },
    { icon: <FileText className="h-5 w-5" />, label: 'Master Data', id: 'master-data' },
    { icon: <BarChart3 className="h-5 w-5" />, label: 'Statistics', id: 'statistics' },
    { icon: <Settings className="h-5 w-5" />, label: 'Settings', id: 'settings' },
  ];

  const menuItems = userRole === 'employee' ? employeeMenuItems : 
                    userRole === 'supervisor' ? supervisorMenuItems : 
                    hrMenuItems;

  const roleColor = userRole === 'employee' ? 'bg-blue-600' : 
                    userRole === 'supervisor' ? 'bg-emerald-600' : 
                    'bg-purple-600';

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo/App Name */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${roleColor} rounded-lg flex items-center justify-center`}>
            <Clock className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl">TimeTracker</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeView === item.id
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar>
            <AvatarFallback className={roleColor}>
              {userName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">{userName}</div>
            <div className="text-xs text-muted-foreground truncate">{userEmail}</div>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
