import { toast } from "@fuel-ui/react";
import { useMutation } from "@tanstack/react-query";
import { NetworkState } from "../../utils";
import { panicError } from "../../utils/queryClient";
import { useFuel } from ".";

export const useConnection = (connect: boolean, setNetworkState: any) => {
    const [fuel] = useFuel();
    if (!fuel) toast.error("Error fuelWeb3 instance is not defined");

    const mutation = useMutation(
        async () => {
            const isConnected = await fuel.isConnected();
            if (!connect && isConnected) {
                setNetworkState(NetworkState.DISCONNECTING);
                await fuel.disconnect();
            } else if (connect && !isConnected) {
                setNetworkState(NetworkState.CONNECTING);
                await fuel.connect();
            }
            return connect;
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
    }

    function handleSuccess(data: any) {
        if (data) {
            setNetworkState(NetworkState.CAN_DISCONNECT);
        } else {
            setNetworkState(NetworkState.CAN_CONNECT);
        }
    }

    return mutation;
};
