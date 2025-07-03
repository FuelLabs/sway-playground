import { apiService } from './apiService';

export interface MCPRequest {
  method: string;
  params?: any;
}

export interface MCPResponse {
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

export interface SearchDocsRequest {
  query: string;
  maxResults?: number;
}

export interface SearchDocsResponse {
  results: Array<{
    title: string;
    content: string;
    url?: string;
    relevance?: number;
  }>;
}

class MCPService {
  async searchDocs(request: SearchDocsRequest): Promise<SearchDocsResponse> {
    return apiService.searchDocs(request);
  }

  async getRelevantDocs(swayQuery: string): Promise<string> {
    return apiService.getRelevantDocs(swayQuery);
  }

  async isAvailable(): Promise<boolean> {
    return apiService.isDocsAvailable();
  }
}

export const mcpService = new MCPService();