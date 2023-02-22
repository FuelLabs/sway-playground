import { Button } from "@fuel-ui/react";
import { useConnection } from "../hooks/wallet";
import { NetworkState } from "../utils/types";

interface NetworkButtonProps {
    networkState: NetworkState;
    setNetworkState: React.Dispatch<React.SetStateAction<NetworkState>>;
}

export const NetworkButton = ({ networkState, setNetworkState }: NetworkButtonProps) => {
    const connectMutation = useConnection(true, setNetworkState);
    const disConnectMutation = useConnection(false, setNetworkState);

    return (
        <>
            {
                networkState === NetworkState.CAN_CONNECT ?
                    <Button
                        onPress={() => {
                            setNetworkState(NetworkState.CONNECTING);
                            connectMutation.mutate();
                        }}
                        type="button"
                        variant="outlined"
                        size="xs"
                        color="green"
                    > Connect
                    </Button> :
                    networkState === NetworkState.CONNECTING ?
                        <Button
                            type="button"
                            variant="outlined"
                            size="xs"
                            color="gray"
                            isDisabled
                        > Connecting...
                        </Button> :
                        networkState === NetworkState.CAN_DISCONNECT ?
                            <Button onPress={() => {
                                setNetworkState(NetworkState.DISCONNECTING);
                                disConnectMutation.mutate();
                            }} type="button" variant="outlined" size="xs" color="red">
                                Disconnect
                            </Button> :
                            <Button
                                type="button"
                                variant="outlined"
                                size="xs"
                                color="gray"
                                isDisabled
                            > Disconnecting...
                            </Button>
            }
        </>
    );
};
