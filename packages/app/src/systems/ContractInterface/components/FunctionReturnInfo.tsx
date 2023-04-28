import { cssObj } from "@fuel-ui/css";
import { Card, Spinner, Text } from "@fuel-ui/react";

interface FunctionReturnInfoProps {
    functionValue: string;
}

export function FunctionReturnInfo({ functionValue }: FunctionReturnInfoProps) {
    return (
        <Card css={styles.textArea}>
            <Card.Body>
                {
                    (
                        functionValue === ""
                        &&
                        <Spinner />
                    )
                    ||
                    (
                        <Text css={styles.text}>
                            {functionValue}
                        </Text>
                    )
                }
            </Card.Body>
        </Card>
    );
}

const styles = {
    textArea: cssObj({
        right: "0",
        left: "0",
        maxHeight: "200px",
        overflowWrap: "anywhere",
        overflowY: "scroll",
        backgroundColor: "lightgrey",
    }),
    text: cssObj({
        color: "$gray7",
        overflowWrap: "anywhere",
    })
}