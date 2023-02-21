function save_contract(contract) {
    localStorage.setItem("playground_contract", contract);
}

function load_contract() {
    return localStorage.getItem("playground_contract") || "";
}

window.addEventListener("load", function () {
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/chrome");
    editor.session.setMode("ace/mode/rust");
    document.getElementById("editor").style.fontSize = "14px";

    const default_contract = `contract;

abi TestContract {
#[storage(write)]
fn initialize_counter(value: u64) -> u64;

#[storage(read, write)]
fn increment_counter(amount: u64) -> u64;
}

storage {
counter: u64 = 0,
}

impl TestContract for Contract {
#[storage(write)]
fn initialize_counter(value: u64) -> u64 {
storage.counter = value;
value
}

#[storage(read, write)]
fn increment_counter(amount: u64) -> u64 {
let incremented = storage.counter + amount;
storage.counter = incremented;
incremented
}
}`;

    const loaded_contract =
        load_contract().length == 0 ? default_contract : load_contract();

    editor.getSession().on("change", function () {
        save_contract(editor.getValue());
    });

    editor.setValue(loaded_contract, 1);

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const gist = urlParams.get("gist");

    if (gist) {
        let url = `https://api.github.com/gists/${gist}`;
        fetch(url)
            .then((res) => res.json())
            .then((out) => {
                const keys = Object.keys(out.files);
                const first_key = keys[0];
                const contents = out.files[first_key].content;

                save_contract(contents);
                editor.setValue(contents, 1);
            })
            .catch((err) => {
                throw err;
            });
    }

    function compile() {
        let code = editor.getValue();

        // const server_uri =
        //     "https://api.sway-playground.org/compile";
        const server_uri = "https://127.0.0.1/compile";
        const request = new Request(server_uri, {
            method: "POST",
            body: JSON.stringify({
                contents: code,
            }),
        });

        fetch(request)
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    result = "Something went wrong on API server!";
                }
            })
            .then((response) => {
                const error = response.error;
                let result = "";

                if (error.length) {
                    var ansi_up = new AnsiUp();
                    var html = ansi_up.ansi_to_html(error);
                    result = html;
                } else {
                    result = `
<b>Bytecode</b>:
0x${response.bytecode}

<b>ABI</b>
${response.abi}`;
                }

                document.getElementById("result").innerHTML = result;
            })
            .catch((error) => {
                result = error;
            });
    }

    document.getElementById("compile").addEventListener("click", compile);

    document.getElementById("reset").addEventListener("click", () => {
        editor.setValue(default_contract, 1);
    });
});
