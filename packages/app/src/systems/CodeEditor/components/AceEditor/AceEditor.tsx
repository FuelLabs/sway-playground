export function AceEditor() {
    return (
        <div id="editor" style={styles.editor}></div>
    );
}

const styles = {
    editor: {
        height: "75%",
        border: "4px solid lightgrey",
        borderRadius: "5px",
    }
}
