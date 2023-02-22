import { Box, Flex, ThemeProvider } from "@fuel-ui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/queryClient";
import { CounterPage, EditorPage } from "./pages";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Flex justify={"space-evenly"}>
          <Box css={{ width: '100%' }}>
            <EditorPage />
          </Box>
          <Box css={{ width: '100%' }}>
            <CounterPage />
          </Box>
        </ Flex>
      </ThemeProvider>
    </QueryClientProvider >
  );
}

export default App;
