import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { useProject } from '@/contexts/ProjectContext';
import {
    Bug,
    Search,
    CheckCircle2,
    Clock,
    AlertTriangle,
    TrendingDown,
    Filter, SlidersHorizontal
} from 'lucide-react';
import {getFlakyTests, updateFlakyTestStatus, FlakyTest, FlakyMetrics} from '@/services/api';
import { toast } from 'sonner';
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Separator} from '@/components/ui/separator';
import {Label} from '@/components/ui/label';

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
  const { currentProject } = useProject();
  const [flakyTests, setFlakyTests] = useState<ManagedFlakyTest[]>([]);
  const [metrics, setMetrics] = useState<FlakyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [acknowledgedFilter, setAcknowledgedFilter] = useState<string>('all');
  const [threshold, setThreshold] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>(''); // Local input state
  const [isThresholdOpen, setIsThresholdOpen] = useState(false);

  // Sync Input field when Threshold changes (e.g. via Presets)
  useEffect(() => {
      setInputValue(threshold > 0 ? threshold.toString() : '');
  }, [threshold]);

  useEffect(() => {
    if (!currentProject) return;
    const fetchFlakyTests = async () => {
      setLoading(true);
      try {
        const flakyTests = await getFlakyTests(daysNumber, threshold, currentProject.id);
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
        setMetrics({
            totalFlakyTests: managedTests.length,
            acknowledgedCount: managedTests.filter(t => t.acknowledged).length,
            resolvedCount: managedTests.filter(t => t.resolutionStatus === 'resolved').length,
            inProgressCount: managedTests.filter(t => t.resolutionStatus === 'in-progress').length,
            investigatingCount: managedTests.filter(t => t.resolutionStatus === 'investigating').length,
            unresolvedCount: managedTests.filter(t => t.resolutionStatus === 'unresolved').length
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFlakyTests();
  }, [daysNumber, threshold, currentProject]);

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

  const handleThresholdKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          const val = Number(inputValue);
          if (!isNaN(val) && val >= 0 && val <= 100) {
              setThreshold(val);
              // Optional: setIsThresholdOpen(false); // Uncomment if you want it to close on Enter
          }
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

  const presets = [25, 35, 50, 65, 70, 85];
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">Flaky Tests Management</h1>
              <p className="text-muted-foreground">Track and resolve flaky tests across your test suite</p>
            </div>
            {/* Threshold Filter */}
            <Popover open={isThresholdOpen} onOpenChange={setIsThresholdOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[180px] justify-between shadow-sm bg-card">
                <span className="flex items-center gap-2">
                   <SlidersHorizontal className="w-4 h-4" />
                   Threshold: {threshold > 0 ? `${threshold}%` : 'All'}
                </span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Flakiness Threshold</h4>
                            <p className="text-sm text-muted-foreground">
                                Show tests with flakiness score above:
                            </p>
                        </div>

                        {/* Presets Grid */}
                        <div className="grid grid-cols-3 gap-2">
                            {presets.map((val) => (
                                <Button
                                    key={val}
                                    variant={threshold === val ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        setThreshold(val);
                                        setIsThresholdOpen(false);
                                    }}
                                    className="w-full"
                                >
                                    {val}%
                                </Button>
                            ))}
                            <Button
                                variant={threshold === 0 ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    setThreshold(0);
                                    setIsThresholdOpen(false);
                                }}
                                className="w-full col-span-3"
                            >
                                Show All (0%)
                            </Button>
                        </div>

                        <Separator />

                        {/* Custom Input */}
                        <div className="space-y-2">
                            <Label htmlFor="custom-threshold">Custom Threshold (%)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="custom-threshold"
                                    type="number"
                                    placeholder="0-100"
                                    min={0}
                                    max={100}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleThresholdKeyDown}
                                    className="h-9"
                                />
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
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
                      <div className="flex items-start gap-4 flex-1 min-w-0 overflow-hidden">
                        <Checkbox
                          checked={test.acknowledged}
                          onCheckedChange={() => handleAcknowledge(test.id)}
                          className="mt-1 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground break-words whitespace-normal">{test.testName}</h3>
                            {test.acknowledged && (
                              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-xs shrink-0">
                                Acknowledged
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground break-words">{test.className}</p>
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
