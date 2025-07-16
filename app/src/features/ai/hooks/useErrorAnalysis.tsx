import { useCallback } from "react";
import {
  aiService,
  ErrorAnalysisRequest,
  ErrorAnalysisResponse,
  RateLimitError,
} from "../../../services/aiService";
import { useAIService } from "./useAIService";

export interface ErrorAnalysisState {
  isAnalyzing: boolean;
  result: ErrorAnalysisResponse | null;
  error: string | null;
}

export interface UseErrorAnalysisReturn {
  state: ErrorAnalysisState;
  analyzeError: (request: ErrorAnalysisRequest) => Promise<void>;
  applyFix: (fixedCode: string) => void;
  clearResult: () => void;
  isAvailable: boolean;
}

export interface UseErrorAnalysisOptions {
  onRateLimitError?: (error: RateLimitError) => void;
}

export function useErrorAnalysis(
  onCodeFixed?: (code: string) => void,
  options: UseErrorAnalysisOptions = {},
): UseErrorAnalysisReturn {
  const { state, execute, apply, clearResult, isAvailable } = useAIService(
    aiService.analyzeError.bind(aiService),
    {
      onApply: (result: ErrorAnalysisResponse) => {
        if (result.fixedCode && onCodeFixed) {
          onCodeFixed(result.fixedCode);
        }
      },
      onRateLimitError: options.onRateLimitError,
    },
  );

  // Transform the generic state to match the expected interface
  const transformedState: ErrorAnalysisState = {
    isAnalyzing: state.isLoading,
    result: state.result,
    error: state.error,
  };

  const applyFix = useCallback(
    (fixedCode: string) => {
      if (onCodeFixed) {
        onCodeFixed(fixedCode);
      }
      clearResult();
    },
    [onCodeFixed, clearResult],
  );

  return {
    state: transformedState,
    analyzeError: execute,
    applyFix,
    clearResult,
    isAvailable,
  };
}
