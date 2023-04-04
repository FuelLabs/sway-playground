import { Card } from "@fuel-ui/react";

interface FunctionReturnInfoProps {
    functionValue: string;
}

export function FunctionReturnInfo({ functionValue }: FunctionReturnInfoProps) {
    return (
        <Card>
            <Card.Body>{functionValue || ""}</Card.Body>
        </Card>
    );
}
