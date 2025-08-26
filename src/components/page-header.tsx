import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  action?: ReactNode;
};

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      {action && <div>{action}</div>}
    </div>
  );
}
