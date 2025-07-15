import { SERVER_URI } from '../constants';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  timeout?: number;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = SERVER_URI;
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
      const response = await fetch(`${this.baseURL}${endpoint}`, {
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

  // Add other non-AI/MCP API methods here as needed
}

export const apiService = new ApiService();