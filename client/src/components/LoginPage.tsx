import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { User, UserCheck, Users, Lock } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface LoginPageProps {
  onLogin: (employeeId: number) => void;
}

interface DemoUser {
  id: number;
  username: string;
  password: string;
  role: string;
  name: string;
  surname: string;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const [loadingDemoUsers, setLoadingDemoUsers] = useState(true);

  // Fetch demo users on component mount
  useEffect(() => {
    const fetchDemoUsers = async () => {
      try {
        const res = await fetch('/api/employee');
        if (!res.ok) throw new Error('Failed to fetch employees');
        const allEmployees = await res.json();

        // Find first employee, hr, and manager
        const employeeUser = allEmployees.find((emp: any) => emp.role === 'employee');
        const hrUser = allEmployees.find((emp: any) => emp.role === 'hr');
        const managerUser = allEmployees.find((emp: any) => emp.role === 'manager');

        const demos: DemoUser[] = [];
        if (employeeUser) demos.push(employeeUser);
        if (managerUser) demos.push(managerUser);
        if (hrUser) demos.push(hrUser);

        setDemoUsers(demos);
      } catch (err) {
        console.error('Failed to fetch demo users:', err);
      } finally {
        setLoadingDemoUsers(false);
      }
    };

    fetchDemoUsers();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Fetch all employees
      const res = await fetch('/api/employee');
      if (!res.ok) throw new Error('Failed to fetch employees');
      const employees = await res.json();

      // Find user by username
      const user = employees.find((emp: any) => emp.username === username);

      if (!user) {
        setError('Invalid username or password. Please try again.');
        setIsLoading(false);
        return;
      }

      // Override: Always accept "password123" for any employee
      if (password !== 'password123') {
        setError('Invalid username or password. Please try again.');
        setIsLoading(false);
        return;
      }

      // Authentication successful
      onLogin(user.id);
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (user: DemoUser) => {
    setUsername(user.username);
    setPassword('password123'); // Override: always use password123
    setError('');
  };

  const getRoleIcon = (role: string) => {
    if (role === 'hr') return Users;
    if (role === 'manager') return UserCheck;
    return User;
  };

  const getRoleLabel = (role: string) => {
    if (role === 'hr') return 'HR';
    if (role === 'manager') return 'Manager';
    return 'Employee';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl">STC Time Tracking System</h1>
          <p className="text-muted-foreground">Sign in to access your account</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    className="pl-10"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Demo Accounts</CardTitle>
            <CardDescription>Click to auto-fill credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingDemoUsers ? (
              <div className="text-sm text-muted-foreground text-center py-4">Loading demo accounts...</div>
            ) : demoUsers.length > 0 ? (
              demoUsers.map((user) => {
                const Icon = getRoleIcon(user.role);
                return (
                  <button
                    key={user.id}
                    onClick={() => handleDemoLogin(user)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm">{user.name} {user.surname}</div>
                        <div className="text-xs text-muted-foreground">{user.username}</div>
                      </div>
                    </div>
                    <Badge role={user.role} />
                  </button>
                );
              })
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">No demo accounts available</div>
            )}
          </CardContent>
        </Card>

        {demoUsers.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            All accounts use password: <span className="font-mono">password123</span>
          </p>
        )}
      </div>
    </div>
  );
}

function Badge({ role }: { role: string }) {
  const getConfig = (role: string) => {
    if (role === 'hr') {
      return { label: 'HR', className: 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300' };
    }
    if (role === 'manager') {
      return { label: 'Manager', className: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300' };
    }
    return { label: 'Employee', className: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300' };
  };

  const config = getConfig(role);

  return (
    <span className={`px-2 py-1 rounded text-xs ${config.className}`}>
      {config.label}
    </span>
  );
}
