import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { TopFailure } from '@/services/api';

interface TopFailuresCardProps {
  data: TopFailure[];
  isLoading?: boolean;
}

export function TopFailuresCard({ data, isLoading }: TopFailuresCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading failures...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border flex-1 min-h-[400px] flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Top Failures</h3>
        <p className="text-sm text-muted-foreground">Most common error messages</p>
      </div>

      <div className="flex-1 overflow-auto space-y-3 scrollbar-thin">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
            <p>No failures recorded</p>
          </div>
        ) : (
          data.map((failure, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 hover:border-destructive/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium truncate">
                    {failure.testName || 'Unknown Test'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {failure.errorMessage}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-destructive/20 text-destructive">
                    {failure.count}×
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
