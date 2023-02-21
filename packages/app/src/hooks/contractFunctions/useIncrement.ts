import { toast } from "@fuel-ui/react";
import { useMutation } from "@tanstack/react-query";
import { COUNTER_CONTRACT_ID } from "../../config";
import { CounterContractAbi__factory } from "../../contracts";
import { panicError, queryClient } from "../../utils/queryClient";
import { useContract } from "../wallet";

export const useIncrement = (amount: number, setCounter: any) => {
    const { contract } = useContract(
        COUNTER_CONTRACT_ID,
        CounterContractAbi__factory
    );

    const mutation = useMutation(
        async () => {
            if (!contract) throw new Error("Contract not connected");

            const transactionResult = await contract.functions
                .increment(amount)
                .call();
            return transactionResult;
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
        queryClient.refetchQueries(["counter"], { exact: true });
        setCounter(Number(data.value));
    }

    return mutation;
};
