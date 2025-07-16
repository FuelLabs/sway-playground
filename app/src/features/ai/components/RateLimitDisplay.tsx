import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { RateLimitStatus } from '../../../services/aiService';

interface RateLimitDisplayProps {
  status: RateLimitStatus | null;
  isLoading?: boolean;
}

export function RateLimitDisplay({ status, isLoading }: RateLimitDisplayProps) {
  if (isLoading) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
        Loading...
      </Typography>
    );
  }

  if (!status) {
    return null;
  }

  const isAtLimit = status.requestsRemaining === 0;
  const isNearLimit = status.requestsRemaining <= 5;

  const getTextColor = () => {
    if (isAtLimit) return 'error.main';
    if (isNearLimit) return 'warning.main';
    return 'text.secondary';
  };

  const formatResetTime = (resetTime: string) => {
    const resetDate = new Date(resetTime);
    return resetDate.toLocaleString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      month: 'short',
      day: 'numeric'
    });
  };

  if (isAtLimit && status.resetTime) {
    return (
      <Typography 
        variant="caption" 
        color={getTextColor()}
        sx={{ fontSize: '0.75rem' }}
      >
        Limit reached - resets at {formatResetTime(status.resetTime)}
      </Typography>
    );
  }

  return (
    <Typography 
      variant="caption" 
      color={getTextColor()}
      sx={{ fontSize: '0.75rem' }}
    >
      {status.requestsRemaining}/{status.requestsLimit} remaining today
    </Typography>
  );
}