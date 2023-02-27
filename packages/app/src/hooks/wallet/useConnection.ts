import { toast } from "@fuel-ui/react";
import { useMutation } from "@tanstack/react-query";
import { NetworkState } from "../../utils";
import { panicError } from "../../utils/queryClient";
import { useFuel } from ".";

export const useConnection = (
    connect: boolean,
    setNetwork: React.Dispatch<React.SetStateAction<string>>,
    setNetworkState: React.Dispatch<React.SetStateAction<NetworkState>>
) => {
    const [fuel] = useFuel();
    if (!fuel) toast.error("Error fuelWeb3 instance is not defined");

    const mutation = useMutation(
        async () => {
            const isConnected = await fuel.isConnected();
            if (connect) {
                if (!isConnected) {
                    setNetworkState(NetworkState.CONNECTING);
                    await fuel.connect();
                }
                let provider = await fuel.getProvider();
                if (provider !== undefined && provider !== null) {
                    return provider.url;
                }
                return "";
            } else {
                if (isConnected) {
                    setNetworkState(NetworkState.DISCONNECTING);
                    await fuel.disconnect();
                }
                return "";
            }
        },
        {
            onSuccess: (data) => {
                handleSuccess(data);
            },
            onError: handleError,
        }
    );

    function handleError(error: any) {
        const msg = error?.message;
        toast.error(msg?.includes("Panic") ? panicError(msg) : msg, {
            duration: 100000000,
            id: msg,
        });
        if (connect) {
            setNetworkState(NetworkState.CAN_CONNECT);
        }
    }

    function handleSuccess(data: any) {
        if (data === "") {
            setNetwork("");
            setNetworkState(NetworkState.CAN_CONNECT);
        } else {
            setNetwork(data);
            setNetworkState(NetworkState.CAN_DISCONNECT);
        }
    }

    return mutation;
};
