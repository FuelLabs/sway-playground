import { useState } from 'react';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import AutoFixHigh from '@mui/icons-material/AutoFixHigh';
import ContentCopy from '@mui/icons-material/ContentCopy';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Close from '@mui/icons-material/Close';
import { useErrorAnalysis } from '../hooks/useErrorAnalysis';
import { ErrorAnalysisRequest } from '../../../services/aiService';
import { MarkdownRenderer } from './MarkdownRenderer';
import { removeCodeBlocks } from '../../../utils/aiHelpers';



export interface FixWithAIButtonProps {
  errorMessage: string;
  sourceCode: string;
  onCodeFixed: (fixedCode: string) => void;
  disabled?: boolean;
}

export function FixWithAIButton({
  errorMessage,
  sourceCode,
  onCodeFixed,
  disabled = false,
}: FixWithAIButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { copied, copyToClipboard, resetCopied } = useCopyToClipboard();
  
  const { state, analyzeError, applyFix, clearResult, isAvailable } = useErrorAnalysis(
    (fixedCode: string) => {
      onCodeFixed(fixedCode);
      setDialogOpen(false);
    }
  );

  const handleFixClick = async () => {
    if (!isAvailable) {
      return;
    }

    // Clear any previous results before starting new analysis
    clearResult();
    resetCopied();
    
    // Only open dialog if it's not already open (for initial click)
    if (!dialogOpen) {
      setDialogOpen(true);
    }
    
    const request: ErrorAnalysisRequest = {
      errorMessage,
      sourceCode
    };

    await analyzeError(request);
  };

  const handleCopyFixed = async () => {
    if (state.result?.fixedCode) {
      await copyToClipboard(state.result.fixedCode);
    }
  };

  const handleApplyFix = () => {
    if (state.result?.fixedCode) {
      applyFix(state.result.fixedCode);
    }
  };

  const handleClose = () => {
    setDialogOpen(false);
    clearResult();
    resetCopied();
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <>
      <Button
        size="small"
        onClick={handleFixClick}
        disabled={disabled || !errorMessage.trim()}
        startIcon={<AutoFixHigh />}
        variant="contained"
        color="error"
        sx={{ ml: 1 }}
      >
        Fix with AI
      </Button>

      <Dialog 
        open={dialogOpen} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <AutoFixHigh color="error" />
              AI Error Analysis & Fix
            </Box>
            <Button onClick={handleClose} size="small">
              <Close />
            </Button>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Error Display */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Compilation Error:
              </Typography>
              <Paper 
                sx={{ 
                  p: 2, 
                  bgcolor: '#2d1b2e', 
                  color: '#f8f8f2', 
                  fontFamily: 'monospace',
                  border: '1px solid #ff6b6b'
                }}
              >
                <pre>{errorMessage}</pre>
              </Paper>
            </Box>

            {/* Loading State */}
            {state.isAnalyzing && (
              <Box display="flex" alignItems="center" gap={2} py={2}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Analyzing error and generating fix... This may take a few moments.
                </Typography>
              </Box>
            )}

            {/* Error Display */}
            {state.error && (
              <Alert severity="error">
                {state.error}
              </Alert>
            )}

            {/* Analysis Results */}
            {state.result && (
              <Box>
                <Typography variant="h6" color="primary" gutterBottom>
                  AI Analysis & Solution
                </Typography>
                
                <Box mb={2}>
                  <MarkdownRenderer content={removeCodeBlocks(state.result.analysis)} borderColor="#ff6b6b" />
                </Box>

                {/* Suggestions */}
                {state.result.suggestions && state.result.suggestions.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Recommendations:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {state.result.suggestions.map((suggestion, index) => (
                        <Chip 
                          key={index} 
                          label={suggestion} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Fixed Code */}
                {state.result.fixedCode && (
                  <Box>
                    <Box display="flex" alignItems="center" justifyContent="between" mb={1}>
                      <Typography variant="subtitle2">
                        Suggested Fix:
                      </Typography>
                      <Button
                        size="small"
                        startIcon={copied ? <CheckCircle /> : <ContentCopy />}
                        onClick={handleCopyFixed}
                        color={copied ? "success" : "primary"}
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    </Box>
                    
                    <Paper sx={{ p: 2, bgcolor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', maxHeight: 400, overflow: 'auto' }}>
                      <pre>{state.result.fixedCode}</pre>
                    </Paper>
                  </Box>
                )}

                {/* Retry button if no fixed code found */}
                {state.result && !state.result.fixedCode && !state.isAnalyzing && (
                  <Box mt={2}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      The AI response didn't include fixed code. This might be due to response truncation.
                    </Alert>
                    <Button
                      onClick={async () => {
                        // Force clear state and add small delay to ensure clean state
                        clearResult();
                        resetCopied();
                        await new Promise(resolve => setTimeout(resolve, 100));
                        await handleFixClick();
                      }}
                      variant="outlined"
                      color="warning"
                      size="small"
                      startIcon={<AutoFixHigh />}
                    >
                      Retry Analysis
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={state.isAnalyzing}>
            Close
          </Button>
          
          {state.result?.fixedCode && (
            <Button
              onClick={handleApplyFix}
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
            >
              Apply Fix
            </Button>
          )}
          
          {state.result && !state.result.fixedCode && (
            <Button
              disabled
              variant="contained"
              color="inherit"
            >
              No Fix Available
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}