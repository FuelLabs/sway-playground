import { cssObj } from "@fuel-ui/css";
import { Box, Flex, Stack } from "@fuel-ui/react";
import { FieldValues, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { FunctionParameterNested } from ".";

interface FunctionParametersProps {
    inputInstances: { [k: string]: any; }[];
    functionName: string;
    register: UseFormRegister<FieldValues>;
    setValue: UseFormSetValue<FieldValues>;
}

export function FunctionParameters({
    inputInstances,
    functionName,
    register,
    setValue
}: FunctionParametersProps) {
    function functionParameterElements() {
        return inputInstances.map((input: any, index: number) => (
            <Flex key={input.name + index} justify="left">
                <FunctionParameterNested
                    name={`${functionName}.${input.name}`}
                    input={input}
                    index={index}
                    register={register}
                    setValue={setValue}
                />
            </Flex>
        ));
    }

    return (
        <Box css={styles.parameters}>
            <Stack>
                {functionParameterElements()}
            </Stack>
        </Box>);
}

const styles = {
    parameters: cssObj({
        width: "100%",
        alignSelf: "center",
    })
}