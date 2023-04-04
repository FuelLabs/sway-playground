import { Button } from "@fuel-ui/react";

export function ConnectingButton() {
    return (
        <Button
            type="button"
            variant="outlined"
            size="lg"
            color="gray"
            isDisabled
        > Connecting...
        </Button>
    );
}
