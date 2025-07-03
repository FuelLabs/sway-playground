import { useState, useCallback, useEffect } from 'react';
import { mcpService, SearchDocsResponse } from '../../../services/mcpService';

export interface FuelDocsState {
  isSearching: boolean;
  results: SearchDocsResponse | null;
  error: string | null;
}

export interface UseFuelDocsReturn {
  state: FuelDocsState;
  searchDocs: (query: string, maxResults?: number) => Promise<void>;
  getContextForPrompt: (prompt: string) => Promise<string>;
  clearResults: () => void;
  isAvailable: boolean;
}

export function useFuelDocs(): UseFuelDocsReturn {
  const [state, setState] = useState<FuelDocsState>({
    isSearching: false,
    results: null,
    error: null
  });

  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    mcpService.isAvailable()
      .then(setIsAvailable)
      .catch(() => setIsAvailable(false));
  }, []);

  const searchDocs = useCallback(async (query: string, maxResults = 5) => {
    if (!isAvailable) {
      setState(prev => ({ ...prev, error: 'Fuel docs service not available' }));
      return;
    }

    setState(prev => ({ ...prev, isSearching: true, error: null }));

    try {
      const results = await mcpService.searchDocs({ query, maxResults });
      setState(prev => ({ ...prev, isSearching: false, results }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search documentation';
      setState(prev => ({ ...prev, isSearching: false, error: errorMessage }));
    }
  }, []);

  const getContextForPrompt = useCallback(async (prompt: string): Promise<string> => {
    if (!isAvailable) {
      return '';
    }

    try {
      const keywords = extractSwayKeywords(prompt);
      const query = keywords.length > 0 ? keywords.join(' ') + ' sway' : prompt + ' sway';
      return await mcpService.getRelevantDocs(query);
    } catch (error) {
      console.warn('Failed to get context for prompt:', error);
      return '';
    }
  }, [isAvailable]);

  const clearResults = useCallback(() => {
    setState({
      isSearching: false,
      results: null,
      error: null
    });
  }, []);

  return {
    state,
    searchDocs,
    getContextForPrompt,
    clearResults,
    isAvailable,
  };
}

function extractSwayKeywords(prompt: string): string[] {
  const keywords = [
    'contract', 'storage', 'impl', 'abi', 'fn', 'struct', 'enum', 'trait',
    'deposit', 'mint', 'burn', 'transfer', 'balance', 'token', 'asset',
    'identity', 'address', 'b256', 'u64', 'u256', 'bool', 'str',
    'require', 'revert', 'assert', 'log', 'msg_sender', 'msg_amount'
  ];

  return prompt.toLowerCase().split(/\s+/)
    .filter(word => keywords.some(keyword => word.includes(keyword)));
}