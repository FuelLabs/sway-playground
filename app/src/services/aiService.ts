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

  isAvailable(): boolean {
    return true; // Backend handles availability checks
  }
}

export const aiService = new AIService();
