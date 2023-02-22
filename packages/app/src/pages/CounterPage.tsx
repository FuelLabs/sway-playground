import { BoxCentered, Stack } from "@fuel-ui/react";
import { useState } from "react";
import { CountInfo, IncrementButton, LocalFaucetButton, NetworkButton } from "../components";
import useNetwork from "../hooks/wallet/useNetwork";
import { NetworkState } from "../utils";

export function CounterPage() {
    const [counter, setCounter] = useState(0);
    const [network, setNetwork] = useState("");
    const [networkState, setNetworkState] = useState(NetworkState.CAN_CONNECT);

    useNetwork(network, setNetwork);

    return (
        <>
            <BoxCentered minHS>
                <Stack align={"center"}>
                    <NetworkButton
                        networkState={networkState}
                        setNetworkState={setNetworkState}
                    />
                    {
                        (networkState === NetworkState.CAN_DISCONNECT || networkState === NetworkState.DISCONNECTING)
                        &&
                        <>
                            <CountInfo />
                            <IncrementButton amount={1} setCounter={setCounter} />
                            {network.includes("localhost") && <LocalFaucetButton />}
                        </>
                    }
                </Stack>
            </BoxCentered>
        </>
    );
}
