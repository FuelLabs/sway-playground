import { useEffect } from "react";
import useProvider from "./useProvider";
import { useFuel } from "./useFuel";

function useNetwork(
    network: string,
    setNetwork: React.Dispatch<React.SetStateAction<string>>
) {
    let { provider } = useProvider();

    if (provider !== undefined && provider !== null && network === "") {
        setNetwork(provider.url);
    }

    const [fuel] = useFuel();

    const handleNetworkChange = async (network: any) => {
        setNetwork(network.url);
    };

    useEffect(() => {
        fuel?.on("network", handleNetworkChange);

        return () => {
            fuel?.off("network", handleNetworkChange);
        };
    }, [fuel]);
}

export default useNetwork;
