import { useQuery } from "@tanstack/react-query";
import { Swaypad, useWallet } from "../../Core";

export function useContract(contractId: string) {
    const { wallet, isLoading, isError } = useWallet();

    const {
        data: contract,
        isLoading: isContractLoading,
        isError: isContractError,
    } = useQuery(
        ["contract", contractId],
        async () => {
            return Swaypad.contract.connect(contractId, wallet!);
        },
        {
            enabled: !isLoading && !isError && !!wallet,
        }
    );

    return { contract, isLoading: isContractLoading, isError: isContractError };
}
