import { Button } from "@fuel-ui/react";
import { parseAddress } from "../../Core";

interface UseDeployedContractButtonProps {
    abi: string,
    bytecode: string,
    setContractId: React.Dispatch<React.SetStateAction<string>>,
    setDeployState: React.Dispatch<React.SetStateAction<boolean>>
}

export function UseDeployedContractButton({
    abi,
    bytecode,
    setContractId,
    setDeployState
}: UseDeployedContractButtonProps) {

    function onAlreadyDeployedContractButtonPress() {
        const id = document.querySelector<HTMLInputElement>("#deployedContractId")?.value;
        if (id && parseAddress(id)) {
            setContractId(id);
            setDeployState(true);
        }
    }

    return (
        <Button
            onPress={onAlreadyDeployedContractButtonPress}
            type="button"
            size="md"
            color="accent"
            isDisabled={!abi || !bytecode}
        >
            Use Deployed Contract
        </Button>
    );
};
