import { apiService } from './apiService';

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
  async generateSwayCode(request: SwayCodeGenerationRequest): Promise<SwayCodeGenerationResponse> {
    return apiService.generateSwayCode(request);
  }

  async analyzeError(request: ErrorAnalysisRequest): Promise<ErrorAnalysisResponse> {
    return apiService.analyzeError(request);
  }
}

export const aiService = new AIService();