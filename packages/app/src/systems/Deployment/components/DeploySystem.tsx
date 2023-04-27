import { Copyable, Text } from "@fuel-ui/react";
import { DeployButton, DeployingButton, UseDeployedContractButton, UseDeployedContractForm } from ".";
import { DeployState } from "../utils";

interface DeploySystemProps {
    abi: string,
    bytecode: string,
    contractId: string,
    setContractId: React.Dispatch<React.SetStateAction<string>>,
    deployState: DeployState,
    setDeployState: React.Dispatch<React.SetStateAction<DeployState>>
}

export function DeploySystem({
    abi,
    bytecode,
    contractId,
    setContractId,
    deployState,
    setDeployState
}: DeploySystemProps) {
    return (
        <>

            {
                deployState === DeployState.NOT_DEPLOYED ?
                    <>
                        <DeployButton
                            abi={abi}
                            bytecode={bytecode}
                            setContractId={setContractId}
                            setDeployState={setDeployState}
                        />
                        <Text> or </Text>
                        <UseDeployedContractForm />
                        <UseDeployedContractButton
                            abi={abi}
                            bytecode={bytecode}
                            setContractId={setContractId}
                            setDeployState={setDeployState}
                        />
                    </>
                    : deployState === DeployState.DEPLOYING ?
                        <DeployingButton />
                        :
                        <>
                            <Text>Contract with address </Text>
                            <Copyable value={contractId}>{contractId}</Copyable>
                        </>
            }
        </>
    );
};
