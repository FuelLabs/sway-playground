import { Button } from "@fuel-ui/react";
import { useDeployContract } from "../hooks";

interface DeployButtonProps {
    abi: string,
    bytecode: string,
    setContractId: React.Dispatch<React.SetStateAction<string>>,
    setDeployState: React.Dispatch<React.SetStateAction<boolean>>
}

export function DeployButton({
    abi,
    bytecode,
    setContractId,
    setDeployState
}: DeployButtonProps) {
    const deployContractMutation = useDeployContract(abi, bytecode, setContractId, setDeployState);

    function onDeployButtonPress() {
        deployContractMutation.mutate();
    }

    return (
        <Button
            onPress={onDeployButtonPress}
            type="button"
            size="md"
            color="accent"
            isDisabled={!abi || !bytecode}
        >
            Deploy
        </Button>
    );
};
