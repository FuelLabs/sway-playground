import { Button } from "@fuel-ui/react";
import { useFaucet } from "../hooks";

export function LocalFaucetButton() {
    const faucetMutation = useFaucet();

    function onFaucetButtonPress() {
        faucetMutation.mutate();
    }

    return (
        <Button
            type="button"
            variant="outlined"
            size="lg"
            color="yellow"
            onPress={onFaucetButtonPress}
        > Faucet
        </Button>
    );
};
