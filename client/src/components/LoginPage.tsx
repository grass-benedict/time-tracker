import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { User, UserCheck, Users, Lock, Mail } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

type UserRole = 'employee' | 'supervisor' | 'hr';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

const demoUsers = [
  { email: 'sophie@stc.com', password: 'demo123', role: 'employee' as UserRole, name: 'Sophie Meier', icon: User },
  { email: 'harald@stc.com', password: 'demo123', role: 'supervisor' as UserRole, name: 'Harald Schmidt', icon: UserCheck },
  { email: 'julia@stc.com', password: 'demo123', role: 'hr' as UserRole, name: 'Julia Weber', icon: Users },
];

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a small delay for authentication
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = demoUsers.find(u => u.email === email && u.password === password);

    if (user) {
      onLogin(user.role);
    } else {
      setError('Invalid email or password. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (user: typeof demoUsers[0]) => {
    setEmail(user.email);
    setPassword(user.password);
    setError('');
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
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@stc.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
            {demoUsers.map((user) => {
              const Icon = user.icon;
              return (
                <button
                  key={user.email}
                  onClick={() => handleDemoLogin(user)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <Badge role={user.role} />
                </button>
              );
            })}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          All demo accounts use password: <span className="font-mono">demo123</span>
        </p>
      </div>
    </div>
  );
}

function Badge({ role }: { role: UserRole }) {
  const config = {
    employee: { label: 'Employee', className: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300' },
    supervisor: { label: 'Supervisor', className: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300' },
    hr: { label: 'HR', className: 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300' },
  };

  return (
    <span className={`px-2 py-1 rounded text-xs ${config[role].className}`}>
      {config[role].label}
    </span>
  );
}
