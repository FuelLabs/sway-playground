import { useQuery } from "@tanstack/react-query";
import { SwaypadAbi__factory } from "../../contracts";
import { useContract } from "../wallet";

export const useCounter = (contractId: string) => {
    const { contract } = useContract(contractId, SwaypadAbi__factory);

    const { data: counter } = useQuery(
        ["counter"],
        async () => {
            if (!contract) throw new Error("Contract not connected");
            const counterResult = await contract.functions.counter().get();
            return counterResult;
        },
        {
            enabled: !!contract,
        }
    );

    return counter ? Number(counter.value) : undefined;
};
