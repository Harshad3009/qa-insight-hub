import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Project {
    id: number;
    name: string;
    description: string;
}

export interface TrendData {
  date: string;
  passRate: number;
  failCount: number;
  totalTests: number;
  avgDuration?: number;
  maxDuration?: number;
  minDuration?: number;
}

export interface DashboardMetrics {
    totalRuns: number;
    avgPassRate: number;
    latestPassRate: number;
    passRateTrend: number;
    totalUniqueFailures: number;
    avgExecutionTime: number;
}

export interface TrendsResponse {
    metrics: DashboardMetrics;
    dailyTrends: TrendData[];
}

export interface TopFailure {
  errorMessage: string;
  count: number;
  testName?: string;
}

export interface FlakyTest {
  id?: string; // Backend provides an ID or we construct one
  testName: string;
  className: string;
  flakinessScore: number;
  passCount: number;
  failCount: number;
  // Management Fields
  acknowledged?: boolean;
  resolutionStatus?: 'unresolved' | 'investigating' | 'in-progress' | 'resolved';
}

export interface FlakyMetrics {
    totalFlakyTests: number;
    acknowledgedCount: number;
    inProgressCount: number;
    resolvedCount: number;
    investigatingCount: number;
    unresolvedCount: number;
}

export interface FlakyTestsResponse {
    metrics: FlakyMetrics;
    tests: FlakyTest[];
}

export interface FailurePattern {
  category: string;
  count: number;
  trend: string;
}

export interface FailureAnalysisItem {
  rootCause: string;
  count: number;
  affectedFeatures: string[];
  suggestedFix: string;
}

export interface AIAnalysis {
  executiveSummary: string;
  failureAnalysis: FailureAnalysisItem[];
  flakinessCheck: string;
}

export interface TestRun {
  id: number;
  executionDate: string;
  totalTests: number;
  passCount: number;
  failCount: number;
  skipCount: number;
  status: 'Healthy' | 'Unhealthy';
  aiAnalysis?: AIAnalysis | string | null;
}

export interface TestCase {
  id: number;
  testName: string;
  className: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  duration: number;
  testFailure?: TestFailure
}

export interface TestFailure {
  failureHash: string;
  id: number;
  message: string;
  stackTrace: string;
}

export interface RunDetails extends TestRun {
  testCases: TestCase[];
}

// Fetch all projects
export const getProjects = async (): Promise<Project[]> => {
    // Ensure your backend has a ProjectController exposing this endpoint
    const response = await api.get('/api/projects');
    return response.data;
};

// Dashboard endpoints
export const getTrends = async (days: number = 30): Promise<TrendsResponse> => {
  const response = await api.get(`/api/dashboard/trends?days=${days}`);
  return response.data;
};

export const getTopFailures = async (limit: number = 5, days: number = 30): Promise<TopFailure[]> => {
  const response = await api.get(`/api/dashboard/top-failures?limit=${limit}&days=${days}`);
  return response.data;
};

export const getFlakyTests = async (days: number = 30, threshold: number = 0): Promise<FlakyTestsResponse> => {
  const response = await api.get(`/api/dashboard/flaky-tests?days=${days}&flakyThreshold=${threshold}`);
  return response.data;
};

// Runs endpoints
export const getRuns = async (params?: { limit?: number; days?: number }): Promise<TestRun[]> => {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.days) queryParams.append('days', params.days.toString());
  const queryString = queryParams.toString();
  const response = await api.get(`/api/runs${queryString ? `?${queryString}` : ''}`);
  return response.data;
};

export const getRunDetails = async (id: number): Promise<RunDetails> => {
  const response = await api.get(`/api/runs/${id}`);
  return response.data;
};

export const deleteRun = async (id: number): Promise<void> => {
    await api.delete(`/api/runs/${id}`);
};

export const analyzeRun = async (id: number): Promise<{ analysis: AIAnalysis }> => {
  const response = await api.post(`/api/runs/${id}/analyze-run`);
  return response.data;
};

// Trends endpoints
export const getFailurePatterns = async (days: number = 30): Promise<FailurePattern[]> => {
    const response = await api.get(`/api/dashboard/failure-patterns?days=${days}`);
    return response.data;
};

// Flaky Tests Management endpoints
export const updateFlakyTestStatus = async (
    className: string,
    testName: string,
    acknowledged: boolean,
    resolutionStatus: string
) => {
    const response = await api.post('/api/dashboard/flaky-tests/update', {
        className,
        testName,
        acknowledged,
        resolutionStatus
    });
    return response.data;
};

// Upload endpoint - supports multiple files, returns array of run IDs
export const uploadReports = async (files: File[], projectId: number): Promise<number[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  // Append the projectId
  formData.append('projectId', projectId.toString());
  const response = await api.post('/upload-report', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default api;
