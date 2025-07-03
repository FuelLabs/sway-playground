import { AI_BACKEND_URL } from '../constants';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  timeout?: number;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = AI_BACKEND_URL;
  }

  private async makeRequest(
    endpoint: string, 
    data?: any, 
    options: ApiRequestOptions = {}
  ): Promise<any> {
    const { 
      method = data ? 'POST' : 'GET',
      headers = {},
      timeout = 30000
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseURL}/api${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  isAvailable(): boolean {
    return Boolean(this.baseURL);
  }

  // AI Service methods
  async generateSwayCode(request: any): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('AI service not available. Please check backend configuration.');
    }

    try {
      return await this.makeRequest('/ai/generate', request);
    } catch (error) {
      throw new Error('Failed to generate Sway code. Please try again.');
    }
  }

  async analyzeError(request: any): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('AI service not available. Please check backend configuration.');
    }

    try {
      return await this.makeRequest('/ai/analyze-error', request);
    } catch (error) {
      throw new Error('Failed to analyze error. Please try again.');
    }
  }

  // MCP Service methods
  async searchDocs(request: any): Promise<any> {
    try {
      return await this.makeRequest('/docs/search', request);
    } catch (error) {
      console.error('MCP searchDocs error:', error);
      return { results: [] };
    }
  }

  async getRelevantDocs(swayQuery: string): Promise<string> {
    try {
      const result = await this.makeRequest('/docs/relevant', { query: swayQuery });
      return result.context || '';
    } catch (error) {
      console.error('Error getting relevant docs:', error);
      return '';
    }
  }

  async isDocsAvailable(): Promise<boolean> {
    try {
      const result = await this.makeRequest('/docs/health');
      return result.available;
    } catch (error) {
      return false;
    }
  }
}

export const apiService = new ApiService();