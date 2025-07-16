import { SERVER_URI } from "../constants";

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

export interface RateLimitStatus {
  requestsRemaining: number;
  requestsLimit: number;
  resetTime?: string;
  windowDurationSeconds: number;
}

export interface RateLimitErrorResponse {
  error: string;
  requestsLimit: number;
  resetTime: string;
  retryAfterSeconds: number;
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly requestsLimit: number,
    public readonly resetTime: string,
    public readonly retryAfterSeconds: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

class AIService {
  private async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${SERVER_URI}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limit error - parse the enhanced error response
        const errorData = await response
          .json()
          .catch(() => ({ error: "Rate limit exceeded" })) as RateLimitErrorResponse;
        
        throw new RateLimitError(
          errorData.error || "Rate limit exceeded",
          errorData.requestsLimit,
          errorData.resetTime,
          errorData.retryAfterSeconds
        );
      }
      
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return response.json();
  }

  async generateSwayCode(
    request: SwayCodeGenerationRequest,
  ): Promise<SwayCodeGenerationResponse> {
    return this.makeRequest<SwayCodeGenerationResponse>(
      "/ai/generate",
      request,
    );
  }

  async analyzeError(
    request: ErrorAnalysisRequest,
  ): Promise<ErrorAnalysisResponse> {
    return this.makeRequest<ErrorAnalysisResponse>(
      "/ai/analyze-error",
      request,
    );
  }

  async getRateLimitStatus(): Promise<RateLimitStatus> {
    const response = await fetch(`${SERVER_URI}/ai/rate-limit-status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return response.json();
  }

  isAvailable(): boolean {
    return true; // Backend handles availability checks
  }
}

export const aiService = new AIService();
