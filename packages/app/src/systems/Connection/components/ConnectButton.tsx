import { Button } from "@fuel-ui/react";
import { NetworkState } from "../utils";
import { useConnection } from "../hooks";
import { DeployState } from "../../Deployment";

interface ConnectButtonProps {
    setDeployState: React.Dispatch<React.SetStateAction<DeployState>>;
    setNetwork: React.Dispatch<React.SetStateAction<string>>;
    setNetworkState: React.Dispatch<React.SetStateAction<NetworkState>>;
}

export function ConnectButton({ setNetwork, setNetworkState, setDeployState }: ConnectButtonProps) {
    const connectMutation = useConnection(true, setNetwork, setNetworkState, setDeployState);

    function onConnectButtonPress() {
        setNetworkState(NetworkState.CONNECTING);
        connectMutation.mutate();
    }

    return (
        <Button
            onPress={onConnectButtonPress}
            type="button"
            color="green"
        > CONNECT
        </Button>
    );
}
