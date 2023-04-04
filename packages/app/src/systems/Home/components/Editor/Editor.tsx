import { cssObj } from "@fuel-ui/css";
import { Box, Flex } from "@fuel-ui/react";
import { AceEditor, CompilationResult, CompileButton, ResetButton } from "../../../CodeEditor";

export function Editor() {
    return (
        <Box css={styles.contentWrapper}>
            <Flex css={styles.buttons}>
                <CompileButton />
                <ResetButton />
            </Flex>
            <AceEditor />
            <CompilationResult />
        </Box>
    );
}

const styles = {
    contentWrapper: cssObj({
        height: "100%",
        width: "50%",
        left: "0",
        position: "fixed",
        overflow: "scroll",
        paddingLeft: "$3",
        paddingTop: "$1",
        paddingRight: "$1",
    }),
    buttons: cssObj({
        justifyContent: "space-between",
        marginBottom: "10px",
    }),
}