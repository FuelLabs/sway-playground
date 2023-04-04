export function CompilationResult() {
    return (
        <pre id="result" style={styles.result}></pre>
    );
}

const styles = {
    result: {
        fontSize: "14px",
        whitespace: "pre",
        overflow: "scroll",
        tabSize: "4",
        background: "#f9ffff",
        border: "4px solid lightgrey",
        minHeight: "50px",
        padding: "15px",
    }
}
