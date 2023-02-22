import { Button } from "@fuel-ui/react";
import { useFaucet } from "../hooks/wallet";

export const LocalFaucetButton = () => {
    const faucetMutation = useFaucet();

    return (
        <>
            <Button
                type="button"
                variant="outlined"
                size="xs"
                color="yellow"
                onPress={() => {
                    faucetMutation.mutate();
                }}
            > Faucet
            </Button>
        </>
    );
};
