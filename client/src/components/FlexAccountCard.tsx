import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface FlexAccountCardProps {
  balance: number; // in hours
}

export function FlexAccountCard({ balance }: FlexAccountCardProps) {
  const isPositive = balance >= 0;
  const hours = Math.floor(Math.abs(balance));
  const minutes = Math.round((Math.abs(balance) - hours) * 60);

  return (
    <Card>
      <CardHeader className={isPositive ? 'bg-green-600 dark:bg-green-700 text-white' : 'bg-red-600 dark:bg-red-700 text-white'}>
        <CardTitle>Flex Account Balance</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-4xl ${isPositive ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {isPositive ? '+' : '-'}{hours}h {minutes}m
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {isPositive ? 'Overtime accumulated' : 'Undertime'}
            </div>
          </div>
          {isPositive ? (
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
