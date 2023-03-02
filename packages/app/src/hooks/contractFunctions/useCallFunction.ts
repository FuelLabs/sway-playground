import { toast } from "@fuel-ui/react";
import { useMutation } from "@tanstack/react-query";
import { panicError } from "../../utils";
import { useContract } from "../wallet";

interface CallFunctionProps {
    contractId: string;
    name: string;
    type: "call" | "get";
    getParams: any;
    formId: string;
    value: any;
    setValue: any;
}

export const useCallFunction = ({
    contractId,
    name,
    type,
    getParams,
    formId,
    value,
    setValue,
}: CallFunctionProps) => {
    const { contract } = useContract(contractId);

    const mutation = useMutation(
        async () => {
            if (!contract) throw new Error("Contract not connected");
            const params = getParams();

            const transactionResult = await contract["functions"]
                [name](...params)
                [type]();
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
        setValue({
            ...value,
            [formId]: `error: ${JSON.stringify(error?.message)}`,
        });
    }

    function handleSuccess(data: any) {
        setValue({ [formId]: String(data.value) });
    }

    return mutation;
};
