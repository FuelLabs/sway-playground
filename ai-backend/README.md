# Sway Playground AI Backend

A lightweight Node.js backend service that provides AI-powered code generation and documentation search for the Sway Playground. This service bridges the browser frontend with the fuel-docs MCP server and Gemini AI.

## Features

- **AI Code Generation**: Generate Sway smart contracts from user prompts
- **Documentation Search**: Search and retrieve relevant Fuel/Sway documentation
- **Error Analysis**: Analyze compilation errors and provide fix suggestions
- **MCP Integration**: Connects to fuel-docs MCP server for documentation context

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:
```env
GEMINI_API_KEY=your_gemini_api_key_here
FUEL_DOCS_MCP_PATH=/path/to/fuel-mcp-server/src/mcp-server.ts
FUEL_DOCS_VECTRA_INDEX_PATH=/path/to/fuel-mcp-server/vectra_index
```

### 3. Start Development Server
```bash
pnpm dev
```

The server will start on `http://localhost:3001`

## API Endpoints

### AI Endpoints

#### Generate Sway Code
```http
POST /api/ai/generate
Content-Type: application/json

{
  "prompt": "Create a token contract with minting functionality"
}
```

#### Analyze Compilation Error
```http
POST /api/ai/analyze-error
Content-Type: application/json

{
  "errorMessage": "cannot find function `transfer` in scope",
  "sourceCode": "contract MyToken { ... }"
}
```

### Documentation Endpoints

#### Search Documentation
```http
POST /api/docs/search
Content-Type: application/json

{
  "query": "storage read write",
  "maxResults": 5
}
```

#### Get Relevant Documentation
```http
POST /api/docs/relevant
Content-Type: application/json

{
  "query": "token contract implementation"
}
```

#### Health Check
```http
GET /api/docs/health
```

### Services

- **AIService**: Handles Gemini AI integration for code generation and analysis
- **MCPService**: Manages fuel-docs MCP server communication via child process
- **Routes**: Express.js API endpoints for AI and documentation operations

### MCP Integration

The backend spawns the fuel-docs MCP server as a child process and communicates via JSON-RPC over stdio:

```typescript
// MCP server is spawned with:
bun run /path/to/fuel-mcp-server/src/mcp-server.ts

// Environment passed:
VECTRA_INDEX_PATH=/path/to/vectra_index
```

> TODO: Convert docs server into a remote MCP server


## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3001) | No |
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `FUEL_DOCS_MCP_PATH` | Path to MCP server TypeScript file | No* |
| `FUEL_DOCS_VECTRA_INDEX_PATH` | Path to Vectra index directory | No* |
| `NODE_ENV` | Environment (development/production) | No |

*Required for documentation feature