import { Button } from "@fuel-ui/react";
import { NetworkState } from "../utils";
import { useConnection } from "../hooks";
import { DeployState } from "../../Deployment";

interface DisconnectButtonProps {
    setDeployState: React.Dispatch<React.SetStateAction<DeployState>>;
    setNetwork: React.Dispatch<React.SetStateAction<string>>;
    setNetworkState: React.Dispatch<React.SetStateAction<NetworkState>>;
}

export function DisconnectButton({ setDeployState, setNetwork, setNetworkState }: DisconnectButtonProps) {
    const disConnectMutation = useConnection(false, setNetwork, setNetworkState, setDeployState);

    function onDisconnectButtonPress() {
        setNetworkState(NetworkState.DISCONNECTING);
        disConnectMutation.mutate();
    }

    return (
        <Button
            onPress={onDisconnectButtonPress}
            type="button"
            variant="outlined"
            size="lg"
            color="red"
        >
            Disconnect
        </Button>
    );
}
