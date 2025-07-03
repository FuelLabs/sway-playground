import { useState, useCallback } from 'react';
import { AI_FEATURES_ENABLED } from '../../../constants';

export interface AIServiceState<TResult> {
  isLoading: boolean;
  result: TResult | null;
  error: string | null;
}

export interface UseAIServiceOptions<TResult> {
  onApply?: (result: TResult) => void;
}

export interface UseAIServiceReturn<TRequest, TResult> {
  state: AIServiceState<TResult>;
  execute: (request: TRequest) => Promise<void>;
  apply?: (result: TResult) => void;
  clearResult: () => void;
  isAvailable: boolean;
}

export function useAIService<TRequest, TResult>(
  serviceFunction: (request: TRequest) => Promise<TResult>,
  options: UseAIServiceOptions<TResult> = {}
): UseAIServiceReturn<TRequest, TResult> {
  const [state, setState] = useState<AIServiceState<TResult>>({
    isLoading: false,
    result: null,
    error: null
  });

  const isAvailable = AI_FEATURES_ENABLED;

  const execute = useCallback(async (request: TRequest) => {
    if (!isAvailable) {
      setState(prev => ({ 
        ...prev, 
        error: 'AI features are not enabled. Please configure your API key.' 
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      result: null
    }));

    try {
      const result = await serviceFunction(request);

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        result 
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
    }
  }, [serviceFunction, isAvailable]);

  const apply = useCallback((result: TResult) => {
    if (options.onApply) {
      options.onApply(result);
    }
    clearResult();
  }, [options.onApply]);

  const clearResult = useCallback(() => {
    setState({
      isLoading: false,
      result: null,
      error: null
    });
  }, []);

  return {
    state,
    execute,
    apply: options.onApply ? apply : undefined,
    clearResult,
    isAvailable
  };
}