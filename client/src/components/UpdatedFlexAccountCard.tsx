import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Clock, TrendingUp } from 'lucide-react';

interface FlexAccountCardProps {
  flexAccount: number;
  thisMonth?: number; // Optional since we might not have this data yet
  loading?: boolean;
}

export function UpdatedFlexAccountCard({ 
  flexAccount,
  thisMonth = 0, // Default to 0 if not provided
  loading = false
}: FlexAccountCardProps) {
  const balance = flexAccount;
  const isPositive = balance >= 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Flex Account</CardTitle>
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className={`text-3xl ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {loading ? (
              '...'
            ) : (
              <>{isPositive ? '+' : ''}{balance.toFixed(1)}h</>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Overtime balance
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">This month:</span>
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <TrendingUp className="h-3 w-3" />
            {loading ? '...' : `${thisMonth > 0 ? '+' : ''}${thisMonth.toFixed(1)}h`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
