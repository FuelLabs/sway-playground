
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

export interface SwayCodeGenerationRequest {
  prompt: string;
}

export interface SwayCodeGenerationResponse {
  code: string;
  explanation: string;
  suggestions: string[];
}

export interface ErrorAnalysisRequest {
  errorMessage: string;
  sourceCode: string;
  lineNumber?: number;
}

export interface ErrorAnalysisResponse {
  analysis: string;
  suggestions: string[];
  fixedCode?: string;
}

