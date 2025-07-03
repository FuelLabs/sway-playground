import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SearchDocsRequest, SearchDocsResponse } from '../types';
import * as dotenv from 'dotenv';
dotenv.config();

export class MCPService {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(
    private mcpPath: string,
    private vectraIndexPath: string
  ) {}

  async initialize(): Promise<void> {
    if (this.isInitialized || !this.mcpPath) {
      return;
    }

    try {
      
      // Create transport with server configuration
      this.transport = new StdioClientTransport({
        command: 'bun',
        args: ['run', this.mcpPath],
        env: {
          ...process.env,
          VECTRA_INDEX_PATH: this.vectraIndexPath
        }
      });

      // Create MCP client
      this.client = new Client({
        name: "sway-playground-backend",
        version: "1.0.0"
      });

      // Connect with timeout
      const connectPromise = this.client.connect(this.transport);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('MCP connection timeout')), 10000);
      });

      await Promise.race([connectPromise, timeoutPromise]);
      
      this.isInitialized = true;
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }


  async searchDocs(request: SearchDocsRequest): Promise<SearchDocsResponse> {
    try {
      // Ensure service is initialized
      if (this.initializationPromise) {
        await this.initializationPromise;
      } else if (!this.isInitialized) {
        this.initializationPromise = this.initialize();
        await this.initializationPromise;
      }

      if (!this.isAvailable()) {
        throw new Error('MCP service not available');
      }
      const result = await this.client!.callTool({
        name: 'searchFuelDocs',
        arguments: {
          query: request.query,
        }
      });
     

      return {
        results: Array.isArray(result.content) ? result.content : []
      };
    } catch (error) {
      throw new Error('Failed to search documentation');
    }
  }

  async getRelevantDocs(swayQuery: string): Promise<string> {
    try {
      const searchResult = await this.searchDocs({
        query: swayQuery,
        maxResults: 3
      });

      if (searchResult.results.length === 0) {
        return '';
      }

      // Combine relevant documentation into context string
      const context = searchResult.results
        .map(result => `## ${result.title}\n${result.content}`)
        .join('\n\n');

      return context;
    } catch (error) {
      return '';
    }
  }

  async getStdContext(): Promise<string> {
    try {
      // Ensure service is initialized
      if (this.initializationPromise) {
        await this.initializationPromise;
      } else if (!this.isInitialized) {
        this.initializationPromise = this.initialize();
        await this.initializationPromise;
      }

      if (!this.isAvailable()) {
        throw new Error('MCP service not available');
      }

      const result = await this.client!.callTool({
        name: 'provideStdContext',
        arguments: {}
      });

      // Parse the MCP response content
      let contextContent = '';
      if (result.content && Array.isArray(result.content)) {
        contextContent = result.content
          .map((item: any) => item.text || item.content || '')
          .join('\n\n');
      }

      return contextContent;
    } catch (error) {
      return '';
    }
  }

  isAvailable(): boolean {
    return this.isInitialized && 
           this.client !== null && 
           this.transport !== null;
  }

  private cleanup(): void {
    this.isInitialized = false;
    this.initializationPromise = null;
    
    // Close transport if it exists
    if (this.transport) {
      this.transport.close().catch(console.error);
    }
    
    this.client = null;
    this.transport = null;
  }

  destroy(): void {
    this.cleanup();
  }
}