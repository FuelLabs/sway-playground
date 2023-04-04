import { Copyable, Text } from "@fuel-ui/react";
import { DeployButton, UseDeployedContractButton, UseDeployedContractForm } from ".";

interface DeploySystemProps {
    abi: string,
    bytecode: string,
    contractId: string,
    setContractId: React.Dispatch<React.SetStateAction<string>>,
    deployState: boolean,
    setDeployState: React.Dispatch<React.SetStateAction<boolean>>
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
                !deployState &&
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
            }
            {
                deployState &&
                <>
                    <Text>Contract with address </Text>
                    <Copyable value={contractId}>{contractId}</Copyable>
                </>
            }
        </>
    );
};
