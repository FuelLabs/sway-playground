import React from "react";
import ReactMarkdown from "react-markdown";
import { Box, Typography, Paper } from "@mui/material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface MarkdownRendererProps {
  content: string;
  borderColor?: string;
}

const markdownComponents: Components = {
  code: ({ inline, className, children }: CodeProps) => {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter
        style={vs}
        language={match[1]}
        PreTag="div"
        customStyle={{ margin: "1em 0", borderRadius: "8px" }}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <Box
        component="code"
        sx={{
          backgroundColor: "#f0f0f0",
          color: "#d73a49",
          padding: "2px 6px",
          borderRadius: "4px",
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          fontSize: "0.875em",
          fontWeight: 600,
          display: "inline",
        }}
      >
        {children}
      </Box>
    );
  },
  p: ({ children }) => (
    <Typography component="p" variant="body2" sx={{ mb: 1, lineHeight: 1.6 }}>
      {children}
    </Typography>
  ),
  h1: ({ children }) => (
    <Typography
      component="h1"
      variant="h5"
      sx={{ mt: 2, mb: 1, fontWeight: 600 }}
    >
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography
      component="h2"
      variant="h6"
      sx={{ mt: 2, mb: 1, fontWeight: 600 }}
    >
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography
      component="h3"
      variant="subtitle1"
      sx={{ mt: 2, mb: 1, fontWeight: 600 }}
    >
      {children}
    </Typography>
  ),
  ul: ({ children }) => (
    <Box component="ul" sx={{ pl: 3, mb: 1 }}>
      {children}
    </Box>
  ),
  ol: ({ children }) => (
    <Box component="ol" sx={{ pl: 3, mb: 1 }}>
      {children}
    </Box>
  ),
  li: ({ children }) => (
    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
      {children}
    </Typography>
  ),
};

export function MarkdownRenderer({
  content,
  borderColor = "#00f58c",
}: MarkdownRendererProps) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        "& blockquote": {
          borderLeft: `4px solid ${borderColor}`,
          pl: 2,
          ml: 0,
          mr: 0,
          fontStyle: "italic",
          color: "text.secondary",
          mb: 1,
        },
      }}
    >
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </Paper>
  );
}
