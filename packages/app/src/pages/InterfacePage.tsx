import { BoxCentered, Stack } from "@fuel-ui/react";
import { useState } from "react";
import { ContractFunctions, DeployButton, LocalFaucetButton, NetworkButton } from "../components";
import useNetwork from "../hooks/wallet/useNetwork";
import { loadAbi, loadBytecode, NetworkState } from "../utils";
import { onCompile } from "../utils/onCompile";

export function InterfacePage() {
    const [abi, setAbi] = useState(loadAbi());
    const [bytecode, setBytecode] = useState(loadBytecode());
    const [contractId, setContractId] = useState("");
    const [network, setNetwork] = useState("");
    const [networkState, setNetworkState] = useState(NetworkState.CAN_CONNECT);
    const [deployState, setDeployState] = useState(false);

    useNetwork(network, setNetwork, setDeployState);

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
                        <DeployButton abi={abi} bytecode={bytecode} setContractId={setContractId} setDeployState={setDeployState} />
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
                        <ContractFunctions contractId={contractId}></ContractFunctions>
                    }
                </Stack>
            </BoxCentered>
        </div>
    );
}
