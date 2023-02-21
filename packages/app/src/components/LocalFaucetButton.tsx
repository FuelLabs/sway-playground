import { Button } from "@fuel-ui/react";

export const LocalFaucetButton = () => {

    return (
        <>
            <Button
                type="button"
                variant="outlined"
                size="xs"
                color="yellow"
                isDisabled
            > Faucet
            </Button>
        </>
    );
};
