import { useState } from 'react';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { SupervisorDashboard } from './components/SupervisorDashboard';
import { HRDashboard } from './components/HRDashboard';
import { DepartmentCalendarView } from './components/DepartmentCalendarView';
import { APITest } from './components/APITest';
import { LoginPage } from './components/LoginPage';
import { ThemeToggle } from './components/ThemeToggle';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './components/ui/sheet';
import { Button } from './components/ui/button';
import { Menu, User, UserCheck, Users, LogOut, CalendarDays } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

type UserRole = 'employee' | 'supervisor' | 'hr' | 'department-calendar';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>('employee');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentUserID = 2; // Placeholder for current logged-in user ID

  const handleLogin = (role: UserRole) => {
    setActiveRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSidebarOpen(false);
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Toaster />
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  const roleConfig = {
    employee: { icon: User, label: 'Employee', color: 'text-blue-600 dark:text-blue-400' },
    supervisor: { icon: UserCheck, label: 'Supervisor', color: 'text-green-600 dark:text-green-400' },
    hr: { icon: Users, label: 'HR', color: 'text-blue-600 dark:text-blue-400' },
    'department-calendar': { icon: CalendarDays, label: 'Department Calendar', color: 'text-purple-600 dark:text-purple-400' },
  };

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    setSidebarOpen(false);
  };

  const CurrentIcon = roleConfig[activeRole].icon;

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Burger Menu */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                  <SheetHeader>
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-2">
                    {/* Employee */}
                    <button
                      onClick={() => handleRoleChange('employee')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeRole === 'employee'
                          ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-accent text-foreground'
                      }`}
                    >
                      <User className="h-5 w-5" />
                      <span>Employee</span>
                    </button>

                    {/* Supervisor */}
                    <button
                      onClick={() => handleRoleChange('supervisor')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeRole === 'supervisor'
                          ? 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300'
                          : 'hover:bg-accent text-foreground'
                      }`}
                    >
                      <UserCheck className="h-5 w-5" />
                      <span>Supervisor</span>
                    </button>

                    {/* HR */}
                    <button
                      onClick={() => handleRoleChange('hr')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeRole === 'hr'
                          ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-accent text-foreground'
                      }`}
                    >
                      <Users className="h-5 w-5" />
                      <span>HR</span>
                    </button>

                    {/* Department Calendar */}
                    <button
                      onClick={() => handleRoleChange('department-calendar')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeRole === 'department-calendar'
                          ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300'
                          : 'hover:bg-accent text-foreground'
                      }`}
                    >
                      <CalendarDays className="h-5 w-5" />
                      <span>Department Calendar</span>
                    </button>

                    {/* Logout Button */}
                    <div className="pt-4 mt-4 border-t border-border">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-destructive/10 text-destructive"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Title with Active Role Indicator */}
              <div>
                <h1 className="text-3xl text-foreground">
                  STC Time Tracking System
                </h1>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <CurrentIcon className={`h-4 w-4 ${roleConfig[activeRole].color}`} />
                  {roleConfig[activeRole].label} View
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
  {activeRole === 'employee' && <EmployeeDashboard employeeId={currentUserID} />}
  {activeRole === 'supervisor' && <SupervisorDashboard managerId={currentUserID} />}
        {activeRole === 'hr' && <HRDashboard employeeId={currentUserID}/>}
        {activeRole === 'department-calendar' && <DepartmentCalendarView />}
        
        {/* API Testing Interface (only shown in development) */}
        {/* 
        {import.meta.env.DEV && (
          <div className="mt-8 border-t border-border pt-8">
            <APITest />
          </div>
        )} */}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>STC Time Tracking & Absence Management System v3.0</p>
            <p className="mt-1">Designed for up to 1000 employees | Enhanced Break Tracking | Calendar-Based Time Editing</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
