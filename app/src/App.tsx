import React, { useCallback, useEffect, useState } from 'react';
import ActionToolbar from './features/toolbar/components/ActionToolbar';
import LogView from './features/editor/components/LogView';
import { useCompile } from './features/editor/hooks/useCompile';
import { DeployState } from './utils/types';
import {
  loadSolidityCode,
  loadSwayCode,
  saveSolidityCode,
  saveSwayCode,
} from './utils/localStorage';
import InteractionDrawer from './features/interact/components/InteractionDrawer';
import { useLog } from './features/editor/hooks/useLog';
import { Toolchain } from './features/editor/components/ToolchainDropdown';
import { useTranspile } from './features/editor/hooks/useTranspile';
import EditorView from './features/editor/components/EditorView';
import { Analytics, track } from '@vercel/analytics/react';
import { APPROVED_EXTERNAL_DOMAIN } from './constants';

const DRAWER_WIDTH = '40vw';

function App() {
  // The current sway code in the editor.
  const [swayCode, setSwayCode] = useState(loadSwayCode());

  // The current solidity code in the editor.
  const [solidityCode, setSolidityCode] = useState(loadSolidityCode());

  // An error message to display to the user.
  const [showSolidity, setShowSolidity] = useState(false);

  // The most recent code that the user has requested to compile.
  const [codeToCompile, setCodeToCompile] = useState<string | undefined>(
    undefined
  );

  // The most recent code that the user has requested to transpile.
  const [codeToTranspile, setCodeToTranspile] = useState<string | undefined>(
    undefined
  );

  // Whether or not the current code in the editor has been compiled.
  const [isCompiled, setIsCompiled] = useState(false);

  // The toolchain to use for compilation.
  const [toolchain, setToolchain] = useState<Toolchain>('beta-5');

  // The deployment state
  const [deployState, setDeployState] = useState(DeployState.NOT_DEPLOYED);

  // Functions for reading and writing to the log output.
  const [log, updateLog] = useLog();

  // The contract ID of the deployed contract.
  const [contractId, setContractId] = useState('');

  // An error message to display to the user.
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    function setLocalStorageFromExternalDomain(message: MessageEvent) {
      if (message.origin !== APPROVED_EXTERNAL_DOMAIN) {
        return;
      }

      const data = JSON.parse(message.data);
      const { swayCode } = data;
      // I'm only expecting us to set sway code from the docs hub.
      // If users want to see the corresponding solidity they can use the built-in transpiler.
      if (swayCode) {
        onSwayCodeChange(swayCode);
      }
    }

    window.addEventListener('message', setLocalStorageFromExternalDomain);

    return () => {
      window.removeEventListener('message', setLocalStorageFromExternalDomain);
    };
  });

  useEffect(() => {
    if (showSolidity) {
      setIsCompiled(false);
    }
  }, [showSolidity]);

  const onSwayCodeChange = useCallback(
    (code: string) => {
      saveSwayCode(code);
      setSwayCode(code);
      setIsCompiled(false);
    },
    [setSwayCode]
  );

  const onSolidityCodeChange = useCallback(
    (code: string) => {
      saveSolidityCode(code);
      setSolidityCode(code);
      setIsCompiled(false);
    },
    [setSolidityCode]
  );

  const setError = useCallback(
    (error: string | undefined) => {
      updateLog(error);
    },
    [updateLog]
  );

  const onCompileClick = useCallback(() => {
    track('Compile Click', { toolchain });
    if (showSolidity) {
      // Transpile the Solidity code before compiling.
      track('Transpile');
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

  useTranspile(
    codeToTranspile,
    setCodeToCompile,
    onSwayCodeChange,
    setError,
    updateLog
  );
  useCompile(codeToCompile, setError, setIsCompiled, updateLog, toolchain);

  return (
    <div
      style={{
        padding: '15px',
        margin: '0px',
        background: '#F1F1F1',
      }}>
      <ActionToolbar
        deployState={deployState}
        setContractId={setContractId}
        onCompile={onCompileClick}
        isCompiled={isCompiled}
        setDeployState={setDeployState}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        showSolidity={showSolidity}
        setShowSolidity={setShowSolidity}
        updateLog={updateLog}
      />
      <div
        style={{
          marginRight: drawerOpen ? DRAWER_WIDTH : 0,
          transition: 'margin 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
          height: 'calc(100vh - 95px)',
          display: 'flex',
          flexDirection: 'column',
        }}>
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
      <Analytics />
    </div>
  );
}

export default App;
