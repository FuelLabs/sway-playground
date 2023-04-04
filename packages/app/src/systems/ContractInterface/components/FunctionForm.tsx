import { cssObj } from "@fuel-ui/css";
import { Form, Box, Heading, Flex } from "@fuel-ui/react";
import { useForm } from "react-hook-form";
import { FunctionButtons, FunctionParameters } from ".";

interface FunctionFormProps {
    contractId: string;
    functionName: string;
    functionValue: {
        [key: string]: string;
    };
    setFunctionValue: React.Dispatch<React.SetStateAction<{
        [key: string]: string;
    }>>;
    inputInstances: { [k: string]: any; }[];
}

export function FunctionForm({
    contractId,
    functionValue,
    setFunctionValue,
    functionName,
    inputInstances
}: FunctionFormProps) {
    const { register, handleSubmit, watch, setValue } = useForm();

    // TODO: handle submit
    function onSubmit(data: any) {
    }

    return (
        <Box as="form" onSubmit={(handleSubmit(onSubmit))}>
            <Form.Control className={contractId + functionName} >
                <Form.Label htmlFor={functionName} css={styles.functionLabel}>
                    <Heading as="h3" css={styles.functionHeading}>{functionName}</Heading>
                </Form.Label>
                <Flex justify="right" gap={"$5"}>
                    <FunctionParameters
                        inputInstances={inputInstances}
                        functionName={functionName}
                        register={register}
                        setValue={setValue}
                    />
                    <FunctionButtons
                        inputInstances={inputInstances}
                        contractId={contractId}
                        functionName={functionName}
                        functionValue={functionValue}
                        setFunctionValue={setFunctionValue}
                        watch={watch}
                    />
                </Flex>
            </Form.Control>
        </Box>
    );
}

const styles = {
    functionLabel: cssObj({
        justifyContent: "center",
    }),
    functionHeading: cssObj({
        color: "gray",
    })
}