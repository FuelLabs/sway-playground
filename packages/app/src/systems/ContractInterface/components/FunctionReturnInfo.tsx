import { Card, Spinner } from "@fuel-ui/react";

interface FunctionReturnInfoProps {
    functionValue: string;
}

export function FunctionReturnInfo({ functionValue }: FunctionReturnInfoProps) {
    return (
        <Card>
            <Card.Body>
                {(functionValue === ""
                    &&
                    <Spinner />
                )
                    || functionValue
                }
            </Card.Body>
        </Card>
    );
}
