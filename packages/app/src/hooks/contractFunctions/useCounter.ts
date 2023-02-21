import { useQuery } from "@tanstack/react-query";
import { COUNTER_CONTRACT_ID } from "../../config";
import { CounterContractAbi__factory } from "../../contracts";
import { useContract } from "../wallet";

export const useCounter = () => {
    const { contract } = useContract(
        COUNTER_CONTRACT_ID,
        CounterContractAbi__factory
    );

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
