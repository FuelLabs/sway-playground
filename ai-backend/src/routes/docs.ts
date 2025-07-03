import { Router, Request, Response } from 'express';
import { MCPService } from '../services/mcpService';
import { handleRouteError, handleValidationError, handleServiceUnavailable } from '../utils/errorHandler';

export function createDocsRouter(mcpService: MCPService): Router {
  const router = Router();

  router.post('/search', async (req: Request, res: Response) => {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return handleValidationError(res, 'Missing or invalid query');
    }

    if (!mcpService.isAvailable()) {
      return handleServiceUnavailable(res, 'Documentation');
    }

    try {
      const result = await mcpService.searchDocs({ query, maxResults: req.body.maxResults });
      res.json(result);
    } catch (error) {
      handleRouteError(res, error, 'Documentation search');
    }
  });

  router.post('/relevant', async (req: Request, res: Response) => {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return handleValidationError(res, 'Missing or invalid query');
    }

    if (!mcpService.isAvailable()) {
      return handleServiceUnavailable(res, 'Documentation');
    }

    try {
      const result = await mcpService.getRelevantDocs(query);
      res.json(result);
    } catch (error) {
      handleRouteError(res, error, 'Relevant documentation');
    }
  });

  router.get('/std-context', async (_req: Request, res: Response) => {
    if (!mcpService.isAvailable()) {
      return handleServiceUnavailable(res, 'Documentation');
    }

    try {
      const context = await mcpService.getStdContext();
      res.json({ context });
    } catch (error) {
      handleRouteError(res, error, 'Standard library context');
    }
  });

  router.get('/health', (_req: Request, res: Response) => {
    res.json({ 
      available: mcpService.isAvailable(),
      status: mcpService.isAvailable() ? 'connected' : 'disconnected'
    });
  });

  return router;
}