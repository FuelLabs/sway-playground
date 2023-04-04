import { Button } from "@fuel-ui/react";

export function DisconnectingButton() {
    return (
        <Button
            type="button"
            variant="outlined"
            size="lg"
            color="gray"
            isDisabled
        > Disconnecting...
        </Button>
    );
}
