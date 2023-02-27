import { toast } from "@fuel-ui/react";
import { useMutation } from "@tanstack/react-query";
import { ContractFactory, JsonAbi } from "fuels";
import { panicError } from "../../utils/queryClient";
import { useWallet } from "./useWallet";

export const useDeployContract = (
    abi: string,
    bytecode: string,
    setContractId: React.Dispatch<React.SetStateAction<string>>,
    setDeployState: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const { wallet } = useWallet();

    const mutation = useMutation(
        async () => {
            if (!wallet) {
                throw new Error("Cannot deploy without wallet");
            }

            const contractFactory = new ContractFactory(
                bytecode,
                JSON.parse(abi) as JsonAbi,
                wallet
            );

            const contract = await contractFactory.deployContract({
                storageSlots: [],
            });

            return contract.id.toB256();
        },
        {
            onSuccess: (data) => {
                handleSuccess(data);
            },
            onError: handleError,
        }
    );

    function handleError(error: any) {
        setDeployState(false);
        const msg = error?.message;
        toast.error(msg?.includes("Panic") ? panicError(msg) : msg, {
            duration: 100000000,
            id: msg,
        });
    }

    function handleSuccess(data: any) {
        setDeployState(true);
        setContractId(data);
    }

    return mutation;
};
