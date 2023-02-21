export function EditorPage() {
    return (<>
        <div className="nav">
            <button id="compile" className="nav_button">
                COMPILE
                <svg
                    style={{ fill: "white" }}
                    height="14"
                    viewBox="8 4 10 16"
                    width="12"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M8 5v14l11-7z"></path>
                </svg>
            </button>

            <div className="nav_right">
                {/* <button id="share" class="nav_button">
                    SHARE
                </button> */}
                <button id="reset" className="nav_button">RESET</button>
            </div>
        </div>

        <div id="editor"></div>

        <pre id="result"></pre>
    </>
    );
}
