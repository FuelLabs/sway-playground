import { Router, Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { handleRouteError, handleValidationError } from '../utils/errorHandler';

export function createAIRouter(aiService: AIService): Router {
  const router = Router();

  router.post('/generate', async (req: Request, res: Response) => {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return handleValidationError(res, 'Missing or invalid prompt');
    }

    try {
      const result = await aiService.generateSwayCode({ prompt });
      res.json(result);
    } catch (error) {
      handleRouteError(res, error, 'Code generation');
    }
  });

  router.post('/analyze-error', async (req: Request, res: Response) => {
    const { errorMessage, sourceCode, lineNumber } = req.body;
    
    if (!errorMessage || !sourceCode) {
      return handleValidationError(res, 'Missing errorMessage or sourceCode');
    }

    try {
      const result = await aiService.analyzeError({ errorMessage, sourceCode, lineNumber });
      res.json(result);
    } catch (error) {
      handleRouteError(res, error, 'Error analysis');
    }
  });


  return router;
}

