import { Spinner, Text, Flex } from "@fuel-ui/react";
import { useCounter } from "../hooks/contractFunctions";

interface CountInfoProps {
    contractId: string;
}

export const CountInfo = ({ contractId }: CountInfoProps) => {
    let count = useCounter(contractId);

    return (
        <>
            <Flex gap="$1">
                <Text>Counter: </Text>
                {count === undefined ? (<Spinner></Spinner>) : (<Text>{count}</Text>)}
            </Flex>
        </>
    );
};
