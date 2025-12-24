import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlakyTest } from '@/services/api';

interface FlakyTestsAlertProps {
  data: FlakyTest[];
  isLoading?: boolean;
}

export function FlakyTestsAlert({ data, isLoading }: FlakyTestsAlertProps) {
  if (isLoading) {
    return null;
  }

  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-warning/20">
          <AlertTriangle className="w-6 h-6 text-warning" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            Flaky Tests Detected
            <Badge variant="outline" className="border-warning/40 text-warning">
              {data.length} tests
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            These tests have inconsistent results and may need attention
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.slice(0, 6).map((test, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-card/50 border border-border hover:border-warning/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium text-foreground truncate">
                    {test.testName}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    {test.passCount} passed
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    {test.failCount} failed
                  </span>
                </div>
                <div className="mt-2">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-success to-warning"
                      style={{
                        width: `${(test.passCount / (test.passCount + test.failCount)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
