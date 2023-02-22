import { Button } from "@fuel-ui/react";
import { useIncrement } from "../hooks/contractFunctions";
import { useDeployContract } from "../hooks/wallet";

interface DeployButtonProps {
    abi: string,
    bytecode: string,
    setContractId: React.Dispatch<React.SetStateAction<string>>,
    setDeployState: React.Dispatch<React.SetStateAction<boolean>>
}

export const DeployButton = ({ abi, bytecode, setContractId, setDeployState }: DeployButtonProps) => {
    const deployContractMutation = useDeployContract(abi, bytecode, setContractId, setDeployState);

    return (
        <>
            {
                <Button
                    onPress={() => deployContractMutation.mutate()
                    }
                    type="button"
                    size="xs"
                    color="accent"
                    isDisabled={!abi || !bytecode}
                >
                    Deploy
                </Button>
            }
        </>
    );
};
