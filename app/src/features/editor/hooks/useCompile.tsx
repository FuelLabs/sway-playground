import styled from "@emotion/styled";
import ansicolor from "ansicolor";
import React, { useState, useEffect } from "react";
import {
  saveAbi,
  saveBytecode,
  saveStorageSlots,
} from "../../../utils/localStorage";
import { CopyableHex } from "../../../components/shared";
import { Toolchain } from "../components/ToolchainDropdown";
import { SERVER_URI } from "../../../constants";
import { track } from "@vercel/analytics/react";

function toResults(
  prefixedBytecode: string,
  abi: string,
): React.ReactElement[] {
  return [
    <div key={"bytecode"}>
      <b>Bytecode</b>:<br />
      <CopyableHex hex={prefixedBytecode} slice={true} tooltip="bytecode" />
      <br />
      <br />
    </div>,
    <div key={"abi"}>
      <b>ABI:</b>
      <CopyableHex hex={abi} slice={false} tooltip="ABI" />
      <br />
      {abi}
    </div>,
  ];
}

export function useCompile(
  code: string | undefined,
  onError: (error: string | undefined) => void,
  setIsCompiled: (isCompiled: boolean) => void,
  setResults: (entry: React.ReactElement[]) => void,
  toolchain: Toolchain,
) {
  const [serverError, setServerError] = useState<boolean>(false);
  const [version, setVersion] = useState<string | undefined>();

  useEffect(() => {
    if (!code) {
      setResults([<>Click 'Compile' to build your code.</>]);
      return;
    }
    if (!code?.length) {
      setResults([<>Add some code to compile.</>]);
      return;
    }
    setResults([<>Compiling Sway contract...</>]);

    const request = new Request(`${SERVER_URI}/compile`, {
      method: "POST",
      body: JSON.stringify({
        contract: code,
        toolchain,
      }),
    });

    fetch(request)
      .then((response) => {
        if (response.status < 400) {
          return response.json();
        } else {
          track("Compile Error", {
            source: "network",
            status: response.status,
          });
          setServerError(true);
        }
      })
      .then((response) => {
        const { error, forcVersion } = response;
        if (error) {
          // Preserve the ANSI color codes from the compiler output.
          const parsedAnsi = ansicolor.parse(error);
          const results = parsedAnsi.spans.map((span, i) => {
            const { text, css } = span;
            const Span = styled.span`
              ${css}
            `;
            return <Span key={`${i}-${text}`}>{text}</Span>;
          });
          setResults(results);
          setVersion(forcVersion);
          saveAbi("");
          saveBytecode("");
          saveStorageSlots("");
        } else {
          const { abi, bytecode, storageSlots, forcVersion } = response;
          const prefixedBytecode = `0x${bytecode}`;
          saveAbi(abi);
          saveBytecode(prefixedBytecode);
          saveStorageSlots(storageSlots);
          setResults(toResults(prefixedBytecode, abi));
          setVersion(forcVersion);
        }
      })
      .catch(() => {
        track("Compile Error", { source: "network" });
        setServerError(true);
      });
    setIsCompiled(true);
  }, [code, setIsCompiled, setResults, toolchain]);

  useEffect(() => {
    if (serverError) {
      onError(
        "There was an unexpected error compiling your contract. Please try again.",
      );
    }
  }, [serverError, onError]);

  useEffect(() => {
    if (version) {
      setResults([<div>Compiled with {version}</div>]);
      setVersion(undefined);
    }
  }, [setResults, version]);
}
