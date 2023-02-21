import { BoxCentered, Stack } from "@fuel-ui/react";
import { useState } from "react";
import { CountInfo, IncrementButton, LocalFaucetButton, NetworkButton } from "../components";
import { NetworkState } from "../utils";

export function CounterPage() {
    const [counter, setCounter] = useState(0);
    const [networkState, setNetworkState] = useState(NetworkState.CAN_CONNECT);

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
                            <LocalFaucetButton />
                        </>
                    }
                </Stack>
            </BoxCentered>
        </>
    );
}
