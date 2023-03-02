import { useContractFunctions } from "../hooks/contractFunctions";
import { ContractFunctionButtons } from "./ContractFunctionButtons";

interface ContractFunctionsProps {
    contractId: string;
}

export function ContractFunctions({ contractId }: ContractFunctionsProps) {
    const { contract, functionNames } = useContractFunctions(contractId);

    return (
        <div key={contractId}>
            {
                contract &&
                <ContractFunctionButtons contract={contract} functionNames={functionNames} />
            }
        </div>
    );
};
