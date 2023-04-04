import { Stack } from "@fuel-ui/react";
import { Contract, FunctionFragment } from "fuels";
import { useState } from "react";
import { FunctionForm, FunctionReturnInfo } from ".";
import { getInstantiableType, isFunctionPrimitive } from "../utils";

export function FunctionInterface(
    contract: Contract | undefined,
    functionFragment: FunctionFragment | undefined
) {
    const [functionValue, setFunctionValue] = useState<{ [key: string]: string; }>({});
    const [inputInstances, setInputInstances] = useState<{ [k: string]: any; }[]>([]);
    const [initialized, setInitialized] = useState<boolean>(false);

    let functionName = functionFragment?.name;

    function nestedType(input: any) {
        if (isFunctionPrimitive(input)) {
            return { name: input.name, type: getInstantiableType(input.type) };
        }

        return {
            name: input.name,
            components: input.components.map((nested: any) => {
                return nestedType(nested);
            })
        };
    }

    if (!initialized && functionFragment) {
        const mappedInputs = functionFragment.inputs.map((input) => {
            return nestedType(input);
        });
        setInputInstances(mappedInputs);
        setInitialized(true);
    }

    return (
        <>
            {
                contract !== undefined && functionName !== undefined &&
                <Stack key={functionName} className={functionName}>
                    <FunctionForm
                        contractId={contract.id.toString()}
                        functionName={functionName}
                        inputInstances={inputInstances}
                        functionValue={functionValue}
                        setFunctionValue={setFunctionValue}
                    />
                    <FunctionReturnInfo functionValue={functionValue[contract.id + functionName]} />
                </Stack >
            }
        </>
    );
}
