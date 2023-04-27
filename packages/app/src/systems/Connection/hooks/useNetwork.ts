import { toast } from "@fuel-ui/react";
import { useEffect } from "react";
import { useFuel } from "../../Core";
import { DeployState } from "../../Deployment";

export function useNetwork(
    setNetwork: React.Dispatch<React.SetStateAction<string>>,
    setDeployState: React.Dispatch<React.SetStateAction<DeployState>>
) {
    const [fuel] = useFuel();

    if (!fuel) toast.error("Fuel wallet could not be found");

    const handleNetworkChange = async (network: any) => {
        setNetwork(network.url);
        setDeployState(DeployState.NOT_DEPLOYED);
    };

    useEffect(() => {
        fuel?.on("network", handleNetworkChange);

        return () => {
            fuel?.off("network", handleNetworkChange);
        };
    }, [fuel]);
}

export default useNetwork;
