import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Sparkles, Loader2, CheckCircle2, XCircle, Clock, ChevronDown } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getRunDetails, analyzeRun, RunDetails as RunDetailsType, TestCase } from '@/services/api';
import { format, parseISO } from 'date-fns';
import { toast } from '@/hooks/use-toast';

// Mock data for preview
const mockRunDetails: RunDetailsType = {
  id: 1,
  executionDate: '2024-01-07T14:30:00Z',
  totalTests: 83,
  passCount: 78,
  failCount: 5,
  skipCount: 0,
  status: 'PASSED',
  aiAnalysis: null,
  testCases: [
    { id: 1, testName: 'testUserLogin', className: 'AuthenticationTest', status: 'PASSED', duration: 1.2 },
    { id: 2, testName: 'testUserLogout', className: 'AuthenticationTest', status: 'PASSED', duration: 0.8 },
    { id: 3, testName: 'testPasswordReset', className: 'AuthenticationTest', status: 'FAILED', duration: 2.5, testFailure:{failureHash: "abcdef123", id: 1, message: 'Expected email to be sent but no email was received', stackTrace: 'at AuthenticationTest.testPasswordReset(AuthenticationTest.java:45)\nat sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)\nat org.junit.runners.model.FrameworkMethod.invokeExplosively(FrameworkMethod.java:47)'}},
    { id: 4, testName: 'testCheckoutFlow', className: 'E2ETest', status: 'PASSED', duration: 5.4 },
    { id: 5, testName: 'testPaymentProcessing', className: 'PaymentTest', status: 'FAILED', duration: 3.2, testFailure:{failureHash: "ghijkl456", id: 1, message: 'Connection timeout to payment gateway', stackTrace: 'at PaymentTest.testPaymentProcessing(PaymentTest.java:78)\nat java.net.SocketInputStream.read(SocketInputStream.java:141)' }},
    { id: 6, testName: 'testProductSearch', className: 'SearchTest', status: 'PASSED', duration: 1.8 },
    { id: 7, testName: 'testAddToCart', className: 'CartTest', status: 'PASSED', duration: 1.1 },
    { id: 8, testName: 'testRemoveFromCart', className: 'CartTest', status: 'PASSED', duration: 0.9 },
    { id: 9, testName: 'testInventoryUpdate', className: 'InventoryTest', status: 'SKIPPED', duration: 0 },
    { id: 10, testName: 'testOrderConfirmation', className: 'OrderTest', status: 'PASSED', duration: 2.3 },
  ],
};

export default function RunDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [runDetails, setRunDetails] = useState<RunDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchRunDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await getRunDetails(parseInt(id));
        setRunDetails(data);
      } catch (error) {
        console.log('Using mock data - backend not available');
        setRunDetails(mockRunDetails);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRunDetails();
  }, [id]);

  const handleAnalyze = async () => {
    if (!id || !runDetails) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeRun(parseInt(id));
      setRunDetails({
        ...runDetails,
        aiAnalysis: result.analysis,
      });
      toast({
        title: 'Analysis complete',
        description: 'AI has analyzed the test failures',
      });
    } catch (error) {
      // Mock response for demo
      setRunDetails({
        ...runDetails,
        aiAnalysis: `## Root Cause Analysis

### Critical Findings

1. **Authentication Service Timeout**
   - The password reset test failed due to email delivery timeout
   - Recommendation: Increase SMTP timeout or implement async email verification

2. **Payment Gateway Connection Issues**
   - Connection timeout suggests network instability or gateway overload
   - Consider implementing retry logic with exponential backoff

### Suggested Actions
- Review network configuration for payment service
- Add circuit breaker pattern for external service calls
- Implement email delivery queue with retry mechanism

### Test Health Score: 78%
The overall test suite is healthy, with isolated failures in external integrations.`,
      });
      toast({
        title: 'Analysis complete',
        description: 'AI has analyzed the test failures',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredTests = runDetails?.testCases.filter((test) => {
    const tName = test.testName || "";
    const tStatus = test.status || "UNKNOWN";
    const matchesSearch =
      tName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.className.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tStatus === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'SKIPPED':
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PASSED':
        return 'bg-success/20 text-success border-success/30';
      case 'FAILED':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'SKIPPED':
        return 'bg-warning/20 text-warning border-warning/30';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!runDetails) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Run not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="w-fit gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Run Summary */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              Run #{runDetails.id}
              <Badge
                variant="outline"
                className={getStatusBadgeClass(runDetails.status)}
              >
                {runDetails.status}
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              Executed on {format(parseISO(runDetails.executionDate), 'MMMM dd, yyyy at HH:mm')}
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-card border-border">
            <p className="text-sm text-muted-foreground">Total Tests</p>
            <p className="text-2xl font-bold font-mono text-foreground">{runDetails.totalTests}</p>
          </Card>
          <Card className="p-4 bg-success/5 border-success/20">
            <p className="text-sm text-muted-foreground">Passed</p>
            <p className="text-2xl font-bold font-mono text-success">{runDetails.passCount}</p>
          </Card>
          <Card className="p-4 bg-destructive/5 border-destructive/20">
            <p className="text-sm text-muted-foreground">Failed</p>
            <p className="text-2xl font-bold font-mono text-destructive">{runDetails.failCount}</p>
          </Card>
          <Card className="p-4 bg-warning/5 border-warning/20">
            <p className="text-sm text-muted-foreground">Skipped</p>
            <p className="text-2xl font-bold font-mono text-warning">{runDetails.skipCount}</p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Test Cases List */}
          <Card className="bg-card border-border">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">Test Cases</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-secondary border-border"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36 bg-secondary border-border">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PASSED">Passed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="SKIPPED">Skipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ScrollArea className="h-[500px]">
              <Accordion type="single" collapsible className="px-4">
                {filteredTests.map((test) => (
                  <AccordionItem key={test.id} value={`test-${test.id}`} className="border-border">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3 text-left">
                        {getStatusIcon(test.status)}
                        <div>
                          <p className="font-medium text-foreground">{test.testName}</p>
                          <p className="text-xs text-muted-foreground">{test.className}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-7 pb-4 space-y-3">
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="outline" className={getStatusBadgeClass(test.status)}>
                            {test.status}
                          </Badge>
                          <span className="text-muted-foreground">
                            Duration: {test.duration.toFixed(2)}s
                          </span>
                        </div>
                        {test.testFailure?.message && (
                          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                            <p className="text-sm font-medium text-destructive mb-2">Error Message</p>
                            <p className="text-sm text-foreground">{test.testFailure.message}</p>
                          </div>
                        )}
                        {test.testFailure?.stackTrace && (
                          <div className="p-3 rounded-lg bg-muted">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Stack Trace</p>
                            <pre className="text-xs text-foreground overflow-x-auto font-mono">
                              {test.testFailure.stackTrace}
                            </pre>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </Card>

          {/* AI Analysis */}
          <Card className="bg-card border-border h-fit">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">AI Analysis</h2>
                  <p className="text-sm text-muted-foreground">Root cause analysis powered by AI</p>
                </div>
              </div>

              {runDetails.aiAnalysis ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
                    <div className="whitespace-pre-wrap text-sm text-foreground">
                      {runDetails.aiAnalysis.split('\n').map((line, i) => {
                        if (line.startsWith('## ')) {
                          return (
                            <h2 key={i} className="text-lg font-bold text-gradient mt-4 mb-2 first:mt-0">
                              {line.replace('## ', '')}
                            </h2>
                          );
                        }
                        if (line.startsWith('### ')) {
                          return (
                            <h3 key={i} className="text-base font-semibold text-foreground mt-3 mb-1">
                              {line.replace('### ', '')}
                            </h3>
                          );
                        }
                        if (line.startsWith('- ')) {
                          return (
                            <li key={i} className="text-muted-foreground ml-4">
                              {line.replace('- ', '')}
                            </li>
                          );
                        }
                        if (line.match(/^\d+\./)) {
                          return (
                            <p key={i} className="text-foreground font-medium mt-2">
                              {line}
                            </p>
                          );
                        }
                        return (
                          <p key={i} className="text-muted-foreground">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    AI analysis has not been generated for this run
                  </p>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Analyze with AI
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
