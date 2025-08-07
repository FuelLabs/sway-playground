import {
  aiService,
  SwayCodeGenerationRequest,
  SwayCodeGenerationResponse,
  RateLimitError,
} from "../../../services/aiService";
import { useAIService } from "./useAIService";

export interface AIGenerationState {
  isGenerating: boolean;
  result: SwayCodeGenerationResponse | null;
  error: string | null;
}

export interface UseAIGenerationReturn {
  state: AIGenerationState;
  generateCode: (request: SwayCodeGenerationRequest) => Promise<void>;
  clearResult: () => void;
  isAvailable: boolean;
}

export interface UseAIGenerationOptions {
  onRateLimitError?: (error: RateLimitError) => void;
}

export function useAIGeneration(
  options: UseAIGenerationOptions = {},
): UseAIGenerationReturn {
  const { state, execute, clearResult, isAvailable } = useAIService(
    aiService.generateSwayCode.bind(aiService),
    {
      onRateLimitError: options.onRateLimitError,
    },
  );

  const transformedState: AIGenerationState = {
    isGenerating: state.isLoading,
    result: state.result,
    error: state.error,
  };

  return {
    state: transformedState,
    generateCode: execute,
    clearResult,
    isAvailable,
  };
}
