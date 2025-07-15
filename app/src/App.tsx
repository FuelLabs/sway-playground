import { useCallback, useEffect, useState } from "react";
import ActionToolbar from "./features/toolbar/components/ActionToolbar";
import LogView from "./features/editor/components/LogView";
import { useCompile } from "./features/editor/hooks/useCompile";
import { DeployState } from "./utils/types";
import {
  loadSolidityCode,
  loadSwayCode,
  saveSolidityCode,
  saveSwayCode,
} from "./utils/localStorage";
import InteractionDrawer from "./features/interact/components/InteractionDrawer";
import { useLog } from "./features/editor/hooks/useLog";
import {
  Toolchain,
  isToolchain,
} from "./features/editor/components/ToolchainDropdown";
import { useTranspile } from "./features/editor/hooks/useTranspile";
import EditorView from "./features/editor/components/EditorView";
import { Analytics, track } from "@vercel/analytics/react";
import { useGist } from "./features/editor/hooks/useGist";
import { useSearchParams } from "react-router-dom";
import Copyable from "./components/Copyable";
import useTheme from "./context/theme";
import { AIGenerationDialog } from "./features/ai/components/AIGenerationDialog";
import { aiService } from "./services/aiService";

const DRAWER_WIDTH = "40vw";

function App() {
  const [swayCode, setSwayCode] = useState<string>(loadSwayCode());
  const [solidityCode, setSolidityCode] = useState<string>(loadSolidityCode());
  const [showSolidity, setShowSolidity] = useState(false);
  const [codeToCompile, setCodeToCompile] = useState<string | undefined>(
    undefined,
  );
  const [codeToTranspile, setCodeToTranspile] = useState<string | undefined>(
    undefined,
  );
  const [isCompiled, setIsCompiled] = useState(false);
  const [toolchain, setToolchain] = useState<Toolchain>("testnet");
  const [deployState, setDeployState] = useState(DeployState.NOT_DEPLOYED);
  const [log, updateLog] = useLog();
  const [contractId, setContractId] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const { themeColor } = useTheme();
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  useEffect(() => {
    if (showSolidity) {
      setIsCompiled(false);
    }
  }, [showSolidity]);

  useEffect(() => {
    if (searchParams.get("transpile") === "true") {
      setShowSolidity(true);
    }
    const toolchainParam = searchParams.get("toolchain");

    if (isToolchain(toolchainParam)) {
      setToolchain(toolchainParam);
    }
  }, [searchParams, setShowSolidity, setToolchain]);

  const onSwayCodeChange = useCallback(
    (code: string) => {
      saveSwayCode(code);
      setSwayCode(code);
      setIsCompiled(false);
      setCodeToCompile(undefined); // Clear previous compilation state
    },
    [setSwayCode],
  );

  const onSolidityCodeChange = useCallback(
    (code: string) => {
      saveSolidityCode(code);
      setSolidityCode(code);
      setIsCompiled(false);
    },
    [setSolidityCode],
  );

  const { newGist } = useGist(onSwayCodeChange, onSolidityCodeChange);

  const setError = useCallback(
    (error: string | undefined) => {
      updateLog(error);
    },
    [updateLog],
  );

  const onShareClick = useCallback(async () => {
    track("Share Click", { toolchain });
    const response = await newGist(swayCode, {
      contract: solidityCode,
      language: "solidity",
    });
    if (response) {
      const permalink = `${window.location.origin}/?toolchain=${toolchain}&transpile=${showSolidity}&gist=${response.id}`;
      updateLog([
        <Copyable
          href
          value={permalink}
          tooltip="permalink to your code"
          label="Permalink to Playground"
        />,
        <Copyable
          href
          value={response?.url}
          tooltip="link to gist"
          label="Link to Gist"
        />,
      ]);
    }
  }, [newGist, swayCode, solidityCode, updateLog, toolchain, showSolidity]);

  const onCompileClick = useCallback(() => {
    track("Compile Click", { toolchain });
    if (showSolidity) {
      track("Transpile");
      setCodeToTranspile(solidityCode);
    } else {
      setCodeToCompile(swayCode);
    }
  }, [
    showSolidity,
    swayCode,
    solidityCode,
    setCodeToCompile,
    setCodeToTranspile,
    toolchain,
  ]);

  const onAIAssistClick = useCallback(() => {
    track("AI Assist Click");
    setAiDialogOpen(true);
  }, []);

  const onAICodeGenerated = useCallback((code: string) => {
    track("AI Code Generated");
    onSwayCodeChange(code);
    setAiDialogOpen(false);
  }, [onSwayCodeChange]);

  const onAICodeFixed = useCallback((fixedCode: string) => {
    track("AI Code Fixed");
    onSwayCodeChange(fixedCode);
  }, [onSwayCodeChange]);

  useTranspile(
    codeToTranspile,
    setCodeToCompile,
    onSwayCodeChange,
    setError,
    updateLog,
  );
  useCompile(codeToCompile, setError, setIsCompiled, updateLog, toolchain, onAICodeFixed);

  return (
    <div
      style={{
        padding: "15px",
        margin: "0px",
        background: themeColor("white4"),
      }}
    >
      <ActionToolbar
        deployState={deployState}
        setContractId={setContractId}
        onShareClick={onShareClick}
        onCompile={onCompileClick}
        isCompiled={isCompiled}
        setDeployState={setDeployState}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        showSolidity={showSolidity}
        setShowSolidity={setShowSolidity}
        updateLog={updateLog}
        onAIAssistClick={aiService.isAvailable() ? onAIAssistClick : undefined}
      />
      <div
        style={{
          marginRight: drawerOpen ? DRAWER_WIDTH : 0,
          transition: "margin 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
          height: "calc(100vh - 95px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <EditorView
          swayCode={swayCode}
          onSwayCodeChange={onSwayCodeChange}
          solidityCode={solidityCode}
          onSolidityCodeChange={onSolidityCodeChange}
          toolchain={toolchain}
          setToolchain={setToolchain}
          showSolidity={showSolidity}
        />
        <LogView results={log} />
      </div>
      <InteractionDrawer
        isOpen={drawerOpen}
        width={DRAWER_WIDTH}
        contractId={contractId}
        updateLog={updateLog}
      />
      {aiService.isAvailable() && (
        <AIGenerationDialog
          open={aiDialogOpen}
          onClose={() => setAiDialogOpen(false)}
          onCodeGenerated={onAICodeGenerated}
        />
      )}
      <Analytics />
    </div>
  );
}

export default App;
