import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { MCPService } from './services/mcpService';
import { AIService } from './services/aiService';
import { createAIRouter } from './routes/ai';
import { createDocsRouter } from './routes/docs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const mcpService = new MCPService(
  process.env.FUEL_DOCS_MCP_PATH || '',
  process.env.FUEL_DOCS_VECTRA_INDEX_PATH || ''
);

const aiService = new AIService(
  process.env.GEMINI_API_KEY || '', 
  mcpService
);

app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

async function startServer() {
  try {
    console.log('Starting AI backend server...');

    if (process.env.FUEL_DOCS_MCP_PATH && process.env.FUEL_DOCS_VECTRA_INDEX_PATH) {
      try {
        console.log('Initializing MCP service...');
        await mcpService.initialize();
        console.log('MCP service initialized successfully');
      } catch (error) {
        console.warn('Failed to initialize MCP service:', error);
        console.warn('MCP-dependent features will be unavailable');
      }
    } else {
      console.warn('MCP configuration missing, documentation search will be unavailable');
    }

    app.use('/api/ai', createAIRouter(aiService));
    app.use('/api/docs', createDocsRouter(mcpService));

    app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('Unhandled error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    });

    app.all('*', (req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });

    app.listen(PORT, () => {
      console.log(`🚀 Sway Playground AI Backend running on port ${PORT}`);
      console.log(`📚 API endpoints:`);
      console.log(`   POST /api/ai/generate - Generate Sway code`);
      console.log(`   POST /api/ai/analyze-error - Analyze compilation errors`);
      console.log(`   POST /api/docs/search - Search documentation`);
      console.log(`   POST /api/docs/relevant - Get relevant docs`);
      console.log(`   GET  /api/docs/health - MCP service health`);
      console.log(`   GET  /health - Server health check`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      mcpService.destroy();
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully...');
      mcpService.destroy();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();