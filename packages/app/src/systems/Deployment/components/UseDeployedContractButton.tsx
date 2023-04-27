import { Button, Spinner } from "@fuel-ui/react";
import { parseAddress } from "../../Core";
import { DeployState } from "../utils";
import { useState } from "react";

interface UseDeployedContractButtonProps {
    abi: string,
    bytecode: string,
    setContractId: React.Dispatch<React.SetStateAction<string>>,
    setDeployState: React.Dispatch<React.SetStateAction<DeployState>>
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
            setDeployState(DeployState.DEPLOYING);
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
