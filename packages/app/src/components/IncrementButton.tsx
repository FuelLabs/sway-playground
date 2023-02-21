import { Button } from "@fuel-ui/react";
import { useIncrement } from "../hooks/contractFunctions";

interface IncrementButtonProps {
    amount: number;
    setCounter: any;
}

export const IncrementButton = ({ amount, setCounter }: IncrementButtonProps) => {
    const incrementMutation = useIncrement(amount, setCounter);

    return (
        <>
            {
                <Button onPress={() => incrementMutation.mutate()} type="button">
                    Increment
                </Button>
            }
        </>
    );
};
