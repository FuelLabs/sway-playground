import { Response } from 'express';

export function handleRouteError(res: Response, error: unknown, context: string): void {
  console.error(`${context} error:`, error);
  res.status(500).json({ 
    error: error instanceof Error ? error.message : `Failed to ${context.toLowerCase()}` 
  });
}

export function handleValidationError(res: Response, message: string): boolean {
  res.status(400).json({ error: message });
  return false;
}

export function handleServiceUnavailable(res: Response, service: string): boolean {
  res.status(503).json({ error: `${service} service not available` });
  return false;
}