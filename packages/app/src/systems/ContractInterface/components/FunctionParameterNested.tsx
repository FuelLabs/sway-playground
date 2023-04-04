import { FieldValues, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { isFunctionPrimitive } from "../utils";
import { Box, Flex, Stack, Text } from "@fuel-ui/react";
import { FunctionParameterPrimitive } from "./FunctionParameterPrimitive";
import { cssObj } from "@fuel-ui/css";

interface FunctionParameterNestedProps {
    name: string;
    input: any;
    index: number;
    register: UseFormRegister<FieldValues>;
    setValue: UseFormSetValue<FieldValues>;
}

export function FunctionParameterNested({
    name,
    input,
    index,
    register,
    setValue
}: FunctionParameterNestedProps) {
    if (isFunctionPrimitive(input)) {
        return (<FunctionParameterPrimitive name={name} input={input} register={register} setValue={setValue} />);
    }
    return (
        <Flex gap="$5" css={styles.functionParameterFlex}>
            <Box css={styles.functionParameterName}>
                <Text> {input.name} </Text>
            </Box>
            <Stack css={styles.functionParametersStack}>
                {input.components.map((field: any, fieldIndex: number) => {
                    let fieldName = input.name + index + field.name + fieldIndex;
                    return <FunctionParameterNested
                        key={fieldName}
                        name={`${name}.${field.name}`}
                        input={field}
                        index={fieldIndex}
                        register={register}
                        setValue={setValue}
                    />;
                })}
            </Stack>
        </Flex>
    );
}

const styles = {
    functionParameterFlex: cssObj({
        width: "100%",
        align: "right"
    }),
    functionParameterName: cssObj({
        alignSelf: "center",
    }),
    functionParametersStack: cssObj({
        width: "100%",
    }),
}