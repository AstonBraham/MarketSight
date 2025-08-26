
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  change?: string;
  className?: string;
};

export function StatCard({ title, value, icon, change, className }: StatCardProps) {
  const isPositive = change && change.startsWith('+');
  const isNegative = change && change.startsWith('-');

  return (
    <Card className={cn('shadow-sm hover:shadow-md transition-shadow duration-300', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-headline">{value}</div>
        {change && (
          <p
            className={cn(
              'text-xs text-muted-foreground mt-1',
              isPositive && 'text-green-600',
              isNegative && 'text-red-600'
            )}
          >
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
