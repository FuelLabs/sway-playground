import { BoxCentered, Stack } from "@fuel-ui/react";
import { useState } from "react";
import { CountInfo, DeployButton, IncrementButton, LocalFaucetButton, NetworkButton } from "../components";
import useNetwork from "../hooks/wallet/useNetwork";
import { NetworkState } from "../utils";

export function CounterPage() {
    const [counter, setCounter] = useState(0);
    const [abi, setAbi] = useState("");
    const [bytecode, setBytecode] = useState("");
    const [contractId, setContractId] = useState("");
    const [network, setNetwork] = useState("");
    const [networkState, setNetworkState] = useState(NetworkState.CAN_CONNECT);
    const [deployState, setDeployState] = useState(false);
    const abiElement = "<b>ABI</b>"
    const bytecodeElement = "<b>Bytecode</b>:"

    useNetwork(network, setNetwork, setDeployState, setCounter);

    return (
        <div className="ui" onClick={() => {
            let editorHTML = document.getElementById("result")?.innerHTML;
            if (editorHTML === undefined) {
                return <></>;
            }
            let bytecodeIndex = editorHTML.indexOf(bytecodeElement);
            let bytecodeStartIndex = bytecodeIndex + bytecodeElement.length + 1;
            let abiIndex = editorHTML.indexOf(abiElement);
            let abiStartIndex = abiIndex + abiElement.length + 1;
            let bytecodeEndIndex = abiIndex - 2;

            setAbi(editorHTML.substring(abiStartIndex));
            setBytecode(editorHTML.substring(bytecodeStartIndex, bytecodeEndIndex));
        }}>
            <BoxCentered minHS>
                <Stack align={"center"}>
                    {
                        <NetworkButton
                            setNetwork={setNetwork}
                            networkState={networkState}
                            setNetworkState={setNetworkState}
                        />
                    }
                    {
                        !deployState
                        &&
                        (networkState === NetworkState.CAN_DISCONNECT || networkState === NetworkState.DISCONNECTING)
                        &&
                        <>
                            <DeployButton abi={abi} bytecode={bytecode} setContractId={setContractId} setDeployState={setDeployState} />
                        </>
                    }
                    {
                        network.includes("localhost")
                        &&
                        (networkState === NetworkState.CAN_DISCONNECT || networkState === NetworkState.CONNECTING)
                        &&
                        <LocalFaucetButton />
                    }
                    {
                        deployState
                        &&
                        (networkState === NetworkState.CAN_DISCONNECT || networkState === NetworkState.DISCONNECTING)
                        &&
                        <>
                            <CountInfo contractId={contractId} counter={counter} />
                            <IncrementButton amount={1} setCounter={setCounter} contractId={contractId} />
                        </>
                    }
                </Stack>
            </BoxCentered>
        </div>
    );
}
