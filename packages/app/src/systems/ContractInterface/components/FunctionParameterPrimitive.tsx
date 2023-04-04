import { cssObj } from "@fuel-ui/css";
import { Box, Flex, Text, Input, Checkbox } from "@fuel-ui/react";
import { FieldValues, UseFormRegister, UseFormSetValue } from "react-hook-form";

interface FunctionParameterPrimitiveProps {
    name: string;
    input: any;
    register: UseFormRegister<FieldValues>;
    setValue: UseFormSetValue<FieldValues>;
}

export function FunctionParameterPrimitive({
    name,
    input,
    register,
    setValue }: FunctionParameterPrimitiveProps) {
    return (
        <Flex gap="$5" css={styles.primitiveParameterFlex}>
            <Box css={styles.primitiveParameterBox}>
                <Text> {input.name} </Text>
            </Box>
            {input.type.type === "number" &&
                <Input css={styles.numberInput}>
                    <Input.Field
                        id={input.name}
                        type={input.type.type}
                        css={styles.numberInputField}
                        {...register(name, { required: true })} />
                </Input>
            }
            {input.type.type === "bool" &&
                <Input css={styles.checkbox}>
                    <Checkbox
                        id={input.name}
                        defaultChecked={false}
                        onCheckedChange={(e) => {
                            setValue(name, (e) as boolean);
                        }}
                        {...register(name, { required: true })} />
                </Input>
            }
        </Flex>
    );
}

const styles = {
    primitiveParameterFlex: cssObj({
        width: "100%",
        align: "left",
    }),
    primitiveParameterBox: cssObj({
        alignSelf: "center",
    }),
    numberInput: cssObj({
        width: "100%",
    }),
    numberInputField: cssObj({
        alignContent: "center",
        justifyContent: "center",
    }),
    checkbox: cssObj({
        height: "min-content",
    }),
}