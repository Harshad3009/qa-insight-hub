import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { 
  Bug, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingDown,
  Filter
} from 'lucide-react';
import {getFlakyTests, updateFlakyTestStatus, FlakyTest, FlakyMetrics} from '@/services/api';
import { toast } from 'sonner';

type ResolutionStatus = 'unresolved' | 'investigating' | 'in-progress' | 'resolved';

interface ManagedFlakyTest extends FlakyTest {
  id: string;
  acknowledged: boolean;
  resolutionStatus: ResolutionStatus;
}

// Mock data matching backend response structure
const mockFlakyTests: FlakyTest[] = [
  { testName: 'testUserLogin', className: 'AuthenticationTest', flakinessScore: 0.45, passCount: 55, failCount: 45, acknowledged: false, resolutionStatus: 'unresolved' },
  { testName: 'testPaymentProcessing', className: 'PaymentTest', flakinessScore: 0.30, passCount: 70, failCount: 30, acknowledged: true, resolutionStatus: 'investigating' },
  { testName: 'testDatabaseConnection', className: 'DatabaseTest', flakinessScore: 0.25, passCount: 75, failCount: 25, acknowledged: false, resolutionStatus: 'unresolved' },
  { testName: 'testAPITimeout', className: 'IntegrationTest', flakinessScore: 0.20, passCount: 80, failCount: 20, acknowledged: true, resolutionStatus: 'in-progress' },
  { testName: 'testFileUpload', className: 'FileHandlingTest', flakinessScore: 0.15, passCount: 85, failCount: 15, acknowledged: false, resolutionStatus: 'unresolved' },
  { testName: 'testCacheInvalidation', className: 'CacheTest', flakinessScore: 0.12, passCount: 88, failCount: 12, acknowledged: true, resolutionStatus: 'resolved' },
];

const statusConfig: Record<ResolutionStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  unresolved: { label: 'Unresolved', color: 'bg-destructive/20 text-destructive border-destructive/30', icon: AlertTriangle },
  investigating: { label: 'Investigating', color: 'bg-warning/20 text-warning border-warning/30', icon: Search },
  'in-progress': { label: 'In Progress', color: 'bg-primary/20 text-primary border-primary/30', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-accent/20 text-accent border-accent/30', icon: CheckCircle2 },
};

export default function FlakyTests() {
  const { daysNumber } = useDateFilter();
  const [flakyTests, setFlakyTests] = useState<ManagedFlakyTest[]>([]);
  const [metrics, setMetrics] = useState<FlakyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [acknowledgedFilter, setAcknowledgedFilter] = useState<string>('all');

  useEffect(() => {
    const fetchFlakyTests = async () => {
      setLoading(true);
      try {
        const flakyTests = await getFlakyTests(daysNumber);
        const managedTests = flakyTests.tests.map((test, index) => ({
          ...test,
          id: test.id ?? `flaky-${index}`,
          acknowledged: test.acknowledged ?? false,
          resolutionStatus: (test.resolutionStatus ?? 'unresolved') as ResolutionStatus,
        }));
        setFlakyTests(managedTests);
        setMetrics(flakyTests.metrics);
      } catch (error) {
        console.log('Using mock data - backend not available');
        const managedTests = mockFlakyTests.map((test, index) => ({
          ...test,
          id: test.id ?? `flaky-${index}`,
          acknowledged: test.acknowledged ?? false,
          resolutionStatus: (test.resolutionStatus ?? 'unresolved') as ResolutionStatus,
        }));
        setFlakyTests(managedTests);
      } finally {
        setLoading(false);
      }
    };

    fetchFlakyTests();
  }, [daysNumber]);

  const handleAcknowledge = async (id: string) => {
    const test = flakyTests.find(t => t.id === id);
    if (!test) return;

    const newAcknowledged = !test.acknowledged;
    
    // Optimistic update
    setFlakyTests(prev => prev.map(t => 
      t.id === id ? { ...t, acknowledged: newAcknowledged } : t
    ));

    try {
      await updateFlakyTestStatus(
        test.className,
        test.testName,
        newAcknowledged,
        test.resolutionStatus
      );
      toast.success(newAcknowledged ? 'Test acknowledged' : 'Test unacknowledged');
    } catch (error) {
      // Revert on error
      setFlakyTests(prev => prev.map(t => 
        t.id === id ? { ...t, acknowledged: !newAcknowledged } : t
      ));
      toast.error('Failed to update acknowledgement status');
    }
  };

  const handleStatusChange = async (id: string, status: ResolutionStatus) => {
    const test = flakyTests.find(t => t.id === id);
    if (!test) return;

    const previousStatus = test.resolutionStatus;
    
    // Optimistic update
    setFlakyTests(prev => prev.map(t => 
      t.id === id ? { ...t, resolutionStatus: status } : t
    ));

    try {
      await updateFlakyTestStatus(
        test.className,
        test.testName,
        test.acknowledged,
        status
      );
      toast.success(`Status updated to ${statusConfig[status].label}`);
    } catch (error) {
      // Revert on error
      setFlakyTests(prev => prev.map(t => 
        t.id === id ? { ...t, resolutionStatus: previousStatus } : t
      ));
      toast.error('Failed to update resolution status');
    }
  };

  const filteredTests = flakyTests.filter(test => {
    const matchesSearch = test.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          test.className.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || test.resolutionStatus === statusFilter;
    const matchesAcknowledged = acknowledgedFilter === 'all' || 
                                 (acknowledgedFilter === 'acknowledged' && test.acknowledged) ||
                                 (acknowledgedFilter === 'unacknowledged' && !test.acknowledged);
    return matchesSearch && matchesStatus && matchesAcknowledged;
  });

  const stats = {
    total: flakyTests.length,
    acknowledged: flakyTests.filter(t => t.acknowledged).length,
    resolved: flakyTests.filter(t => t.resolutionStatus === 'resolved').length,
    inProgress: flakyTests.filter(t => t.resolutionStatus === 'in-progress' || t.resolutionStatus === 'investigating').length,
  };

  const getFlakyScoreColor = (score: number) => {
    if (score >= 0.4) return 'text-destructive';
    if (score >= 0.2) return 'text-warning';
    return 'text-accent';
  };

  const getFlakyScoreBarColor = (score: number) => {
    if (score >= 0.4) return 'bg-destructive';
    if (score >= 0.2) return 'bg-warning';
    return 'bg-accent';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Flaky Tests Management</h1>
          <p className="text-muted-foreground">Track and resolve flaky tests across your test suite</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bug className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{metrics?.totalFlakyTests ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Total Flaky Tests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <CheckCircle2 className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{metrics?.acknowledgedCount ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Acknowledged</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{metrics?.inProgressCount + metrics?.investigatingCount}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <TrendingDown className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{metrics?.resolvedCount}</p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by test name or class..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-border"
                />
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] bg-background/50 border-border">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="unresolved">Unresolved</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={acknowledgedFilter} onValueChange={setAcknowledgedFilter}>
                  <SelectTrigger className="w-[160px] bg-background/50 border-border">
                    <SelectValue placeholder="Acknowledged" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="unacknowledged">Unacknowledged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flaky Tests List */}
        <div className="space-y-3">
          {filteredTests.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardContent className="p-8 text-center">
                <Bug className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No flaky tests found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredTests.map((test) => {
              const StatusIcon = statusConfig[test.resolutionStatus].icon;
              return (
                <Card key={test.id} className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Checkbox & Test Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <Checkbox
                          checked={test.acknowledged}
                          onCheckedChange={() => handleAcknowledge(test.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground truncate break-all">{test.testName}</h3>
                            {test.acknowledged && (
                              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-xs">
                                Acknowledged
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground break-all">{test.className}</p>
                        </div>
                      </div>

                      {/* Flaky Score */}
                      <div className="flex items-center gap-4 lg:w-48">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Flaky Score</span>
                            <span className={`text-sm font-semibold ${getFlakyScoreColor(test.flakinessScore)}`}>
                              {(test.flakinessScore).toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${getFlakyScoreBarColor(test.flakinessScore)}`}
                              style={{ width: `${test.flakinessScore}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Pass/Fail Counts */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-accent">{test.passCount}</p>
                          <p className="text-xs text-muted-foreground">Pass</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-destructive">{test.failCount}</p>
                          <p className="text-xs text-muted-foreground">Fail</p>
                        </div>
                      </div>

                      {/* Status Badge & Selector */}
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline" 
                          className={`${statusConfig[test.resolutionStatus].color} flex items-center gap-1`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[test.resolutionStatus].label}
                        </Badge>
                        <Select 
                          value={test.resolutionStatus} 
                          onValueChange={(value) => handleStatusChange(test.id, value as ResolutionStatus)}
                        >
                          <SelectTrigger className="w-[140px] bg-background/50 border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unresolved">Unresolved</SelectItem>
                            <SelectItem value="investigating">Investigating</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
