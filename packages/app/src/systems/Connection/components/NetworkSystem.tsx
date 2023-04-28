import { NetworkState } from "../utils";
import { ConnectButton, ConnectingButton, DisconnectButton, DisconnectingButton } from ".";
import { DeployState } from "../../Deployment";

interface NetworkButtonProps {
    setDeployState: React.Dispatch<React.SetStateAction<DeployState>>;
    setNetwork: React.Dispatch<React.SetStateAction<string>>;
    networkState: NetworkState;
    setNetworkState: React.Dispatch<React.SetStateAction<NetworkState>>;
}

export function NetworkSystem({
    setDeployState,
    setNetwork,
    networkState,
    setNetworkState
}: NetworkButtonProps) {

    return (
        <>
            {
                networkState === NetworkState.CAN_CONNECT ?
                    <ConnectButton
                        setDeployState={setDeployState}
                        setNetwork={setNetwork}
                        setNetworkState={setNetworkState}
                    />
                    : networkState === NetworkState.CONNECTING ?
                        <ConnectingButton />
                        : networkState === NetworkState.CAN_DISCONNECT ?
                            <DisconnectButton
                                setDeployState={setDeployState}
                                setNetwork={setNetwork}
                                setNetworkState={setNetworkState}
                            />
                            : <DisconnectingButton />
            }
        </>
    );
};
