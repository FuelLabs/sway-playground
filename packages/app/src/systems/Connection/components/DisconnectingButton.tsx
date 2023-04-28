import { Button } from "@fuel-ui/react";

export function DisconnectingButton() {
    return (
        <Button
            type="button"
            color="gray"
            isDisabled
        > DISCONNECTING...
        </Button>
    );
}
