import { aiService, SwayCodeGenerationRequest, SwayCodeGenerationResponse } from '../../../services/aiService';
import { useAIService } from './useAIService';

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

export function useAIGeneration(): UseAIGenerationReturn {
  const { state, execute, clearResult, isAvailable } = useAIService(
    aiService.generateSwayCode.bind(aiService)
  );

  const transformedState: AIGenerationState = {
    isGenerating: state.isLoading,
    result: state.result,
    error: state.error
  };

  return {
    state: transformedState,
    generateCode: execute,
    clearResult,
    isAvailable
  };
}