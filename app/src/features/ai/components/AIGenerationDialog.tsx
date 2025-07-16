import { useState, useEffect } from "react";
import { useCopyToClipboard } from "../../../hooks/useCopyToClipboard";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import ContentCopy from "@mui/icons-material/ContentCopy";
import CheckCircle from "@mui/icons-material/CheckCircle";
import { useAIGeneration } from "../hooks/useAIGeneration";
import { SwayCodeGenerationRequest } from "../../../services/aiService";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { removeCodeBlocks } from "../../../utils/aiHelpers";
import { RateLimitDisplay } from "./RateLimitDisplay";
import { useRateLimitStatus } from "../hooks/useRateLimitStatus";

const StyledDialog = styled(Dialog)(() => ({
  "& .MuiPaper-root": {
    borderRadius: "12px",
    minWidth: "600px",
    maxWidth: "800px",
  },
}));

const CodePreview = styled(Paper)(() => ({
  backgroundColor: "#1e1e1e",
  color: "#d4d4d4",
  padding: "16px",
  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
  fontSize: "14px",
  maxHeight: "400px",
  overflow: "auto",
  border: "1px solid #333",
  borderRadius: "8px",
}));

const GenerateButton = styled(Button)(() => ({
  background: "linear-gradient(45deg, #00f58c, #00d4aa)",
  color: "#000",
  fontWeight: 600,
  "&:hover": {
    background: "linear-gradient(45deg, #00d4aa, #00b894)",
  },
  "&:disabled": {
    background: "#333",
    color: "#666",
  },
}));

export interface AIGenerationDialogProps {
  open: boolean;
  onClose: () => void;
  onCodeGenerated: (code: string) => void;
}

export function AIGenerationDialog({
  open,
  onClose,
  onCodeGenerated,
}: AIGenerationDialogProps) {
  const {
    status: rateLimitStatus,
    fetchStatus: fetchRateLimitStatus,
    updateStatusAfterError,
  } = useRateLimitStatus();
  const { state, generateCode, clearResult, isAvailable } = useAIGeneration({
    onRateLimitError: (error) => {
      updateStatusAfterError(error);
    },
  });
  const [prompt, setPrompt] = useState("");
  const { copied, copyToClipboard, resetCopied } = useCopyToClipboard();

  // Fetch rate limit status when modal opens
  useEffect(() => {
    if (open) {
      fetchRateLimitStatus();
    }
  }, [open, fetchRateLimitStatus]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const request: SwayCodeGenerationRequest = {
      prompt: prompt.trim(),
    };

    await generateCode(request);
    // Refresh rate limit status after making a request
    await fetchRateLimitStatus();
  };

  const handleCopyCode = async () => {
    if (state.result?.code) {
      await copyToClipboard(state.result.code);
    }
  };

  const handleUseCode = () => {
    if (state.result?.code) {
      onCodeGenerated(state.result.code);
      handleClose();
    }
  };

  const handleClose = () => {
    setPrompt("");
    resetCopied();
    clearResult();
    onClose();
  };

  const isGenerating = state.isGenerating;
  const hasResult = Boolean(state.result);
  const hasError = Boolean(state.error);

  if (!isAvailable) {
    return (
      <StyledDialog open={open} onClose={onClose}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AutoAwesome color="primary" />
            AI Assistant
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            AI features are not available. Please configure your Gemini API key
            in the environment variables.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </StyledDialog>
    );
  }

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoAwesome color="primary" />
          AI Code Generation
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Input Form */}
          <Box sx={{ position: "relative" }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
              <RateLimitDisplay status={rateLimitStatus} />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Describe your smart contract"
              placeholder="e.g., Create a token contract with minting functionality and transfer capabilities"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={
                isGenerating || rateLimitStatus?.requestsRemaining === 0
              }
              variant="outlined"
            />
          </Box>

          {/* Error Display */}
          {hasError && <Alert severity="error">{state.error}</Alert>}

          {/* Loading State */}
          {isGenerating && (
            <Box display="flex" alignItems="center" gap={2} py={2}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Generating Sway contract... This may take a few moments.
              </Typography>
            </Box>
          )}

          {/* Generated Code */}
          {hasResult && state.result && (
            <Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6" color="primary">
                    Generated Contract
                  </Typography>
                </Box>
                <Button
                  size="small"
                  startIcon={copied ? <CheckCircle /> : <ContentCopy />}
                  onClick={handleCopyCode}
                  color={copied ? "success" : "primary"}
                >
                  {copied ? "Copied!" : "Copy Code"}
                </Button>
              </Box>

              <CodePreview>
                <pre>{state.result.code}</pre>
              </CodePreview>

              {state.result.explanation && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Explanation:
                  </Typography>
                  <MarkdownRenderer
                    content={removeCodeBlocks(state.result.explanation)}
                  />
                </Box>
              )}

              {state.result.suggestions &&
                state.result.suggestions.length > 0 && (
                  <Box mt={1}>
                    <Typography variant="subtitle2" gutterBottom>
                      Suggestions:
                    </Typography>
                    <Box component="ul" sx={{ mt: 0, pl: 2 }}>
                      {state.result.suggestions.map((suggestion, index) => (
                        <Typography
                          key={index}
                          component="li"
                          variant="body2"
                          color="text.secondary"
                        >
                          {suggestion}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={isGenerating}>
          Cancel
        </Button>

        {!hasResult && (
          <GenerateButton
            onClick={handleGenerate}
            disabled={
              !prompt.trim() ||
              isGenerating ||
              rateLimitStatus?.requestsRemaining === 0
            }
            startIcon={
              isGenerating ? <CircularProgress size={16} /> : <AutoAwesome />
            }
            variant="contained"
          >
            {rateLimitStatus?.requestsRemaining === 0
              ? "Limit Reached"
              : "Generate Contract"}
          </GenerateButton>
        )}

        {hasResult && (
          <GenerateButton
            onClick={handleUseCode}
            variant="contained"
            startIcon={<CheckCircle />}
          >
            Use This Code
          </GenerateButton>
        )}
      </DialogActions>
    </StyledDialog>
  );
}
