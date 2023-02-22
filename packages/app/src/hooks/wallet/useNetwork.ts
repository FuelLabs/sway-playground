import { useEffect } from "react";
import { useFuel } from "./useFuel";
import { toast } from "@fuel-ui/react";

function useNetwork(
    network: string,
    setNetwork: React.Dispatch<React.SetStateAction<string>>,
    setDeployState: React.Dispatch<React.SetStateAction<boolean>>,
    setCounter: React.Dispatch<React.SetStateAction<number>>
) {
    const [fuel] = useFuel();

    if (!fuel) toast.error("Error fuelWeb3 instance is not defined");

    const handleNetworkChange = async (network: any) => {
        setNetwork(network.url);
        setDeployState(false);
        setCounter(0);
    };

    useEffect(() => {
        fuel?.on("network", handleNetworkChange);

        return () => {
            fuel?.off("network", handleNetworkChange);
        };
    }, [fuel]);
}

export default useNetwork;
