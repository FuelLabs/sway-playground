import { useState, useCallback } from "react";
import { aiService, RateLimitError } from "../../../services/aiService";

export interface AIServiceState<TResult> {
  isLoading: boolean;
  result: TResult | null;
  error: string | null;
  rateLimitError?: RateLimitError;
}

export interface UseAIServiceOptions<TResult> {
  onApply?: (result: TResult) => void;
  onRateLimitError?: (error: RateLimitError) => void;
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
  options: UseAIServiceOptions<TResult> = {},
): UseAIServiceReturn<TRequest, TResult> {
  const [state, setState] = useState<AIServiceState<TResult>>({
    isLoading: false,
    result: null,
    error: null,
    rateLimitError: undefined,
  });

  const isAvailable = aiService.isAvailable();

  const execute = useCallback(
    async (request: TRequest) => {
      if (!isAvailable) {
        setState((prev) => ({
          ...prev,
          error: "AI features are not enabled. Please configure your API key.",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        result: null,
        rateLimitError: undefined,
      }));

      try {
        const result = await serviceFunction(request);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          result,
        }));
      } catch (error) {
        if (error instanceof RateLimitError) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: error.message,
            rateLimitError: error,
          }));
          
          if (options.onRateLimitError) {
            options.onRateLimitError(error);
          }
        } else {
          const errorMessage =
            error instanceof Error ? error.message : "Operation failed";
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: errorMessage,
          }));
        }
      }
    },
    [serviceFunction, isAvailable],
  );

  const apply = useCallback(
    (result: TResult) => {
      if (options.onApply) {
        options.onApply(result);
      }
      clearResult();
    },
    [options.onApply],
  );

  const clearResult = useCallback(() => {
    setState({
      isLoading: false,
      result: null,
      error: null,
      rateLimitError: undefined,
    });
  }, []);

  return {
    state,
    execute,
    apply: options.onApply ? apply : undefined,
    clearResult,
    isAvailable,
  };
}
