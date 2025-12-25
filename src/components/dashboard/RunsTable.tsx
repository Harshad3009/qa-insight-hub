import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TestRun } from '@/services/api';
import { format, parseISO } from 'date-fns';
import { ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

interface RunsTableProps {
  data: TestRun[];
  isLoading?: boolean;
}

export function RunsTable({ data, isLoading }: RunsTableProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Test Run History</h3>
        <p className="text-sm text-muted-foreground">Click on a row to view details</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Run ID</TableHead>
              <TableHead className="text-muted-foreground">Execution Date</TableHead>
              <TableHead className="text-muted-foreground text-center">Total</TableHead>
              <TableHead className="text-muted-foreground text-center">Passed</TableHead>
              <TableHead className="text-muted-foreground text-center">Failed</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No test runs found. Upload a report to get started.
                </TableCell>
              </TableRow>
            ) : (
              data.map((run) => (
                <TableRow
                  key={run.id}
                  className="border-border cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => navigate(`/runs/${run.id}`)}
                >
                  <TableCell className="font-mono text-foreground">#{run.id}</TableCell>
                  <TableCell className="text-foreground">
                    {format(parseISO(run.executionDate), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="text-center font-mono text-foreground">
                    {run.totalTests}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-mono text-success">{run.passCount}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-mono text-destructive">{run.failCount}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={run.status === 'PASSED' ? 'default' : 'destructive'}
                      className={`gap-1 ${
                        run.status === 'PASSED'
                          ? 'bg-success/20 text-success border-success/30 hover:bg-success/30'
                          : 'bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30'
                      }`}
                    >
                      {run.status === 'PASSED' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {run.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
