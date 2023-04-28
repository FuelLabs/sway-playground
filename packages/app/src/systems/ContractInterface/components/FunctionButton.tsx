import { Button } from "@fuel-ui/react";
import { FieldValues, UseFormWatch } from "react-hook-form";
import { useCallFunction } from "../hooks";

interface FunctionButtonProps {
    inputInstances: { [k: string]: any; }[];
    contractId: string;
    functionName: string;
    type: "call" | "simulate";
    functionValue: any;
    setFunctionValue: any;
    watch: UseFormWatch<FieldValues>;
}

export function FunctionButton({
    inputInstances,
    contractId,
    functionName,
    type,
    functionValue,
    setFunctionValue,
    watch,
}: FunctionButtonProps) {
    const functionMutation = useCallFunction({
        inputInstances,
        contractId,
        functionName,
        type,
        functionValue,
        setFunctionValue,
        watch,
    });

    function onFunctionButtonPress() {
        functionMutation.mutate();
    }

    return (
        <>
            {
                <Button
                    onPress={onFunctionButtonPress}
                    type="submit"
                    size="xs"
                >
                    {type.toUpperCase()}
                </Button>
            }
        </>
    );
};
