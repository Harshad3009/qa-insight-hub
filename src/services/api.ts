import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface TrendData {
  date: string;
  passRate: number;
  failCount: number;
  totalTests: number;
}

export interface TopFailure {
  errorMessage: string;
  count: number;
  testName?: string;
}

export interface FlakyTest {
  testName: string;
  className: string;
  flakyScore: number;
  passCount: number;
  failCount: number;
}

export interface TestRun {
  id: number;
  executionDate: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  status: 'PASSED' | 'FAILED';
  aiAnalysis?: string;
}

export interface TestCase {
  id: number;
  name: string;
  className: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  duration: number;
  errorMessage?: string;
  stackTrace?: string;
}

export interface RunDetails extends TestRun {
  testCases: TestCase[];
}

// Dashboard endpoints
export const getTrends = async (days: number = 30): Promise<TrendData[]> => {
  const response = await api.get(`/api/dashboard/trends?days=${days}`);
  return response.data;
};

export const getTopFailures = async (limit: number = 5): Promise<TopFailure[]> => {
  const response = await api.get(`/api/dashboard/top-failures?limit=${limit}`);
  return response.data;
};

export const getFlakyTests = async (days: number = 30): Promise<FlakyTest[]> => {
  const response = await api.get(`/api/dashboard/flaky-tests?days=${days}`);
  return response.data;
};

// Runs endpoints
export const getRuns = async (): Promise<TestRun[]> => {
  const response = await api.get('/api/runs');
  return response.data;
};

export const getRunDetails = async (id: number): Promise<RunDetails> => {
  const response = await api.get(`/api/runs/${id}`);
  return response.data;
};

export const analyzeRun = async (id: number): Promise<{ analysis: string }> => {
  const response = await api.post(`/api/runs/${id}/analyze`);
  return response.data;
};

// Upload endpoint
export const uploadReport = async (formData: FormData): Promise<{ message: string; runId: number }> => {
  const response = await api.post('/upload-report', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default api;
