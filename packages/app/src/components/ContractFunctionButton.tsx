import { Button } from "@fuel-ui/react";
import { useCallFunction } from "../hooks/contractFunctions";

interface FunctionButtonProps {
    contractId: string;
    name: string;
    type: "call" | "get";
    getParams: any;
    formId: string;
    value: any;
    setValue: any;
}

export const ContractFunctionButton = ({
    contractId,
    name,
    type,
    getParams,
    formId,
    value,
    setValue,
}: FunctionButtonProps) => {
    const functionMutation = useCallFunction({
        contractId,
        name,
        type,
        getParams,
        formId,
        value,
        setValue,
    });

    return (
        <>
            {
                <Button onPress={() => functionMutation.mutate()} type="button" size="sm">
                    {type}
                </Button>
            }
        </>
    );
};

