import { cssObj } from "@fuel-ui/css";
import { Stack } from "@fuel-ui/react";
import { FieldValues, UseFormWatch } from "react-hook-form";
import { FunctionButton } from ".";

interface FunctionButtonsProps {
    inputInstances: { [k: string]: any; }[];
    contractId: string;
    functionName: string;
    functionValue: {
        [key: string]: string;
    };
    setFunctionValue: React.Dispatch<React.SetStateAction<{
        [key: string]: string;
    }>>;
    watch: UseFormWatch<FieldValues>;
}

export function FunctionButtons({
    inputInstances,
    contractId,
    functionName,
    functionValue,
    setFunctionValue,
    watch
}: FunctionButtonsProps) {
    return (
        <Stack css={styles.functionButtons}>
            <FunctionButton
                inputInstances={inputInstances}
                contractId={contractId}
                functionName={functionName}
                type="call"
                functionValue={functionValue}
                setFunctionValue={setFunctionValue}
                watch={watch}
            />
            <FunctionButton
                inputInstances={inputInstances}
                contractId={contractId}
                functionName={functionName}
                type="simulate"
                functionValue={functionValue}
                setFunctionValue={setFunctionValue}
                watch={watch}
            />
        </Stack>
    );
}

const styles = {
    functionButtons: cssObj({
        width: "80%",
        alignSelf: "center",
    })
}