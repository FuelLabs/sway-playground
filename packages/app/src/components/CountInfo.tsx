import { Spinner, Text, Flex } from "@fuel-ui/react";
import { useCounter } from "../hooks/contractFunctions";

export const CountInfo = () => {
    // let count = useCounter();

    return (
        <>
            <Flex gap="$1">
                <Text>Counter: </Text>
                {/* {count === undefined ? (<Spinner></Spinner>) : (<Text>{count}</Text>)} */}
            </Flex>
        </>
    );
};
