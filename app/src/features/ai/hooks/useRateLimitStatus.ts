import { useState, useEffect, useCallback } from 'react';
import { aiService, RateLimitStatus, RateLimitError } from '../../../services/aiService';

export function useRateLimitStatus() {
  const [status, setStatus] = useState<RateLimitStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const rateLimitStatus = await aiService.getRateLimitStatus();
      setStatus(rateLimitStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rate limit status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStatusAfterError = useCallback((rateLimitError: RateLimitError) => {
    setStatus({
      requestsRemaining: 0,
      requestsLimit: rateLimitError.requestsLimit,
      resetTime: rateLimitError.resetTime,
      windowDurationSeconds: rateLimitError.retryAfterSeconds,
    });
  }, []);

  const resetStatus = useCallback(() => {
    setStatus(null);
    setError(null);
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    isLoading,
    error,
    fetchStatus,
    updateStatusAfterError,
    resetStatus,
  };
}