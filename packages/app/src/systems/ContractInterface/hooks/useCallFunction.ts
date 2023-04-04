import { toast } from "@fuel-ui/react";
import { useMutation } from "@tanstack/react-query";
import { FieldValues, UseFormWatch } from "react-hook-form";
import { useContract } from ".";
import { panicError } from "../../Core";
import { getFunctionParameters, modifyJsonStringify } from "../utils";

interface CallFunctionProps {
    inputInstances: { [k: string]: any }[];
    contractId: string;
    functionName: string;
    type: "call" | "simulate";
    functionValue: any;
    setFunctionValue: any;
    watch: UseFormWatch<FieldValues>;
}

export function useCallFunction({
    inputInstances,
    contractId,
    functionName,
    type,
    functionValue,
    setFunctionValue,
    watch,
}: CallFunctionProps) {
    const { contract } = useContract(contractId);

    const mutation = useMutation(
        async () => {
            if (!contract) throw new Error("Contract not connected");

            const functionParameters = getFunctionParameters(
                inputInstances,
                watch,
                functionName
            );

            const transactionResult = await contract["functions"]
                [functionName](...functionParameters)
                [type === "simulate" ? "get" : "call"]();
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
        setFunctionValue({
            ...functionValue,
            [contractId + functionName]: `error: ${JSON.stringify(
                error?.message
            )}`,
        });
    }

    function handleSuccess(data: any) {
        setFunctionValue({
            [contractId + functionName]: JSON.stringify(
                data.value,
                modifyJsonStringify,
                2
            ),
        });
    }

    return mutation;
}
