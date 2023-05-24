import { toast } from "@fuel-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useFuel } from "./useFuel";

export function useWallet() {
    const [fuel] = useFuel();

    if (!fuel) toast.error("Fuel wallet could not be found");

    const {
        data: wallet,
        isLoading,
        isError,
    } = useQuery(
        ["wallet"],
        async () => {
            const isConnected = await fuel.isConnected();
            if (!isConnected) {
                await fuel.connect();
            }
            const selectedAccount = (await fuel.currentAccount()) as string;
            const selectedWallet = await fuel.getWallet(selectedAccount);
            return selectedWallet;
        },
        {
            enabled: !!fuel,
        }
    );

    return { wallet, isLoading, isError };
}