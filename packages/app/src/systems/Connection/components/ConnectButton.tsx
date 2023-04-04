import { Button } from "@fuel-ui/react";
import { NetworkState } from "../utils";
import { useConnection } from "../hooks";

interface ConnectButtonProps {
    setNetwork: React.Dispatch<React.SetStateAction<string>>;
    setNetworkState: React.Dispatch<React.SetStateAction<NetworkState>>;
}

export function ConnectButton({ setNetwork, setNetworkState }: ConnectButtonProps) {
    const connectMutation = useConnection(true, setNetwork, setNetworkState);

    function onConnectButtonPress() {
        setNetworkState(NetworkState.CONNECTING);
        connectMutation.mutate();
    }

    return (
        <Button
            onPress={onConnectButtonPress}
            type="button"
            variant="outlined"
            size="lg"
            color="green"
        > Connect
        </Button>
    );
}
