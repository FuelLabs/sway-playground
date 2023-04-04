import { Box, Stack } from "@fuel-ui/react";
import { useContractFunctions } from "../hooks";
import { FunctionInterface } from ".";
import { cssObj } from "@fuel-ui/css";

interface ContractInterfaceProps {
    contractId: string;
}

export function ContractInterface({ contractId }: ContractInterfaceProps) {
    const { contract, functionNames } = useContractFunctions(contractId);

    // this limit exists so that the number of hook calls remain constant throughout the render
    const functionCountLimit = 1000;
    let functionInterfaces: JSX.Element[] = new Array(functionCountLimit);

    for (let index = 0; index < functionCountLimit; index++) {
        functionInterfaces[index] = index < functionNames.length
            ? FunctionInterface(contract, contract?.interface.functions[functionNames[index]])
            : FunctionInterface(undefined, undefined);
    }

    return (
        <Box key={contractId} css={styles.functionInterfaces} >
            {
                functionNames && contract &&
                <Stack gap="$7">{functionInterfaces}</Stack>
            }
        </Box>
    );
};

const styles = {
    functionInterfaces: cssObj({
        width: "80%",
    })
}
