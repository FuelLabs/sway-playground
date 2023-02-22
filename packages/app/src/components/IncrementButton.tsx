import { Button } from "@fuel-ui/react";
import { useIncrement } from "../hooks/contractFunctions";

interface IncrementButtonProps {
    amount: number;
    setCounter: React.Dispatch<React.SetStateAction<number>>;
    contractId: string;
}

export const IncrementButton = ({ amount, setCounter, contractId }: IncrementButtonProps) => {
    const incrementMutation = useIncrement(amount, setCounter, contractId);

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
