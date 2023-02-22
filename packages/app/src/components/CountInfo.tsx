import { Spinner, Text, Flex } from "@fuel-ui/react";
import { useCounter } from "../hooks/contractFunctions";

interface CountInfoProps {
    contractId: string;
    counter: number;
}

export const CountInfo = ({ contractId, counter }: CountInfoProps) => {
    let count = useCounter(contractId);

    if (counter === 0 && count !== undefined) {
        count = 0;
    }

    return (
        <>
            <Flex gap="$1">
                <Text>Counter: </Text>
                {count === undefined ? (<Spinner></Spinner>) : (<Text>{count}</Text>)}
            </Flex>
        </>
    );
};
