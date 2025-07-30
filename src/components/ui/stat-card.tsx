import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  variant = 'default',
  className 
}: StatCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-success/20 bg-gradient-to-br from-success/5 to-success/10';
      case 'warning':
        return 'border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10';
      case 'danger':
        return 'border-danger/20 bg-gradient-to-br from-danger/5 to-danger/10';
      default:
        return 'border-border bg-gradient-card';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'danger':
        return 'text-danger';
      default:
        return 'text-primary';
    }
  };

  return (
    <Card className={cn(
      'shadow-soft hover:shadow-medium transition-all duration-300',
      getVariantStyles(),
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className={cn('h-5 w-5', getIconColor())} />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {typeof value === 'number' 
            ? value.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              })
            : value
          }
        </div>
        {change && (
          <p className={cn(
            'text-xs flex items-center gap-1',
            change.type === 'increase' ? 'text-success' : 'text-danger'
          )}>
            <span className={cn(
              'inline-block w-0 h-0 border-l-[3px] border-r-[3px] border-l-transparent border-r-transparent',
              change.type === 'increase' 
                ? 'border-b-[5px] border-b-success' 
                : 'border-t-[5px] border-t-danger'
            )} />
            {Math.abs(change.value)}% em relação ao {change.period}
          </p>
        )}
      </CardContent>
    </Card>
  );
}