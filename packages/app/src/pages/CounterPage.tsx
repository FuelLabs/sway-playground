import { BoxCentered, Stack } from "@fuel-ui/react";
import { useState } from "react";
import { CountInfo, DeployButton, IncrementButton, LocalFaucetButton, NetworkButton } from "../components";
import useNetwork from "../hooks/wallet/useNetwork";
import { NetworkState } from "../utils";
import { onCompile } from "../utils/onCompile";

export function save_abi(abi: string) {
    localStorage.setItem("playground_abi", abi);
}

export function load_abi() {
    return localStorage.getItem("playground_abi") || "";
}

export function save_bytecode(bytecode: string) {
    localStorage.setItem("playground_bytecode", bytecode);
}

export function load_bytecode() {
    return localStorage.getItem("playground_bytecode") || "";
}

export function CounterPage() {
    const [counter, setCounter] = useState(0);
    const [abi, setAbi] = useState(load_abi());
    const [bytecode, setBytecode] = useState(load_bytecode());
    const [contractId, setContractId] = useState("");
    const [network, setNetwork] = useState("");
    const [networkState, setNetworkState] = useState(NetworkState.CAN_CONNECT);
    const [deployState, setDeployState] = useState(false);

    useNetwork(network, setNetwork, setDeployState, setCounter);

    return (
        <div>
            <div
                className="ui"
                onClick={() => {
                    let program = onCompile(setAbi, setBytecode, setDeployState);
                    if (!program) {
                        return <></>;
                    }
                }}></div>
            <a id="types" ></a>
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
