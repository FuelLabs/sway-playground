import { useState } from "react";
import { Form, Input, Stack, Box, Card, Text, Heading, Flex } from "@fuel-ui/react";
import { Contract, FunctionFragment } from "fuels";
import { getInstantiableType } from "../utils";
import { ContractFunctionButton } from ".";

function contractFunctionButtons(
    contract: Contract,
    fnFragment: FunctionFragment
) {
    const [value, setValue] = useState<{
        [key: string]: string;
    }>({});

    let functionName = fnFragment.name;
    let inputs = fnFragment.inputs;

    const inputInstances = inputs.map((input) => {
        return {
            name: input.name,
            type: getInstantiableType(input.type),
        };
    }
    );
    const formId = `${functionName}ContractForm`;

    function getParams() {
        const params = inputInstances.map((inputInst: any, index: any) => {
            const input = document.querySelector<HTMLInputElement>(
                `.${formId} [name="${index}"]`
            )!;
            return getInstantiableType(inputInst).create(input.value);
        });
        return params;
    }

    return (
        <Stack key={functionName} className={functionName}>
            <Form.Control className={formId}>
                <Form.Label htmlFor={functionName}>
                    <Heading as="h3" css={{ color: "gray" }}>{functionName}</Heading>
                </Form.Label>
                <Flex justify="center" align="center" gap={"$5"}>
                    {inputInstances.map((input, index) => (
                        <Flex key={input.name} justify="center" align="center">
                            <Text css={{ width: "30%" }}>{input.name}</Text>
                            <Input key={index} css={{ width: "50%" }}>
                                <Input.Field
                                    id={inputs.at(index)?.name}
                                    type={input.type.type}
                                    name={String(index)}
                                />
                            </Input>
                        </Flex>
                    ))}
                    <Stack css={{ width: "20%", marginRight: "$0" }}>
                        <ContractFunctionButton
                            contractId={contract.id.toString()}
                            name={functionName}
                            type="call"
                            getParams={getParams}
                            formId={formId}
                            value={value}
                            setValue={setValue}
                        />
                        <ContractFunctionButton
                            contractId={contract.id.toString()}
                            name={functionName}
                            type="get"
                            getParams={getParams}
                            formId={formId}
                            value={value}
                            setValue={setValue}
                        />
                    </Stack>
                </Flex>
            </Form.Control>
            <Box>
                <Card>
                    <Card.Body>{value[formId] || ""}</Card.Body>
                </Card>
            </Box>
        </Stack>
    );
}

interface ContractFunctionButtonsProps {
    contract: Contract;
    functionNames: string[];
}


export function ContractFunctionButtons({ contract, functionNames }: ContractFunctionButtonsProps) {
    let contractComponents: JSX.Element[] = [];

    functionNames.forEach((name) => {
        contractComponents.push(
            contractFunctionButtons(contract!, contract?.interface.functions[name])
        );
    });

    return <Stack gap="$7">{contractComponents}</Stack>;
}
