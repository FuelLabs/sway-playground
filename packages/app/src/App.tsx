import { Box, Flex, Grid, ThemeProvider } from "@fuel-ui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/queryClient";
import { CounterPage, EditorPage } from "./pages";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Box css={{ height: "100%", width: "50%", left: "0", position: "fixed", overflow: "scroll" }}>
          <EditorPage />
        </Box>
        <Box css={{ height: "100%", width: "50%", right: "0", position: "fixed", overflow: "hidden" }}>
          <CounterPage />
        </Box>
      </ThemeProvider>
    </QueryClientProvider >
  );
}

export default App;
