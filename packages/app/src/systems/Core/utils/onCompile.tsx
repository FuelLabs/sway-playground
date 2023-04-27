import { DeployState } from "../../Deployment";
import { Swaypad } from "./interface";
import { saveAbi, saveBytecode } from "./localStorage";

const abiElement = "<b>ABI</b>"
const bytecodeElement = "<b>Bytecode</b>:"

export function onCompile(
    setAbi: React.Dispatch<React.SetStateAction<string>>,
    setBytecode: React.Dispatch<React.SetStateAction<string>>,
    setDeployState: React.Dispatch<React.SetStateAction<DeployState>>,
) {
    let editorHTML = document.getElementById("result")?.innerHTML;
    if (editorHTML === undefined) {
        return false;
    }

    let bytecodeIndex = editorHTML.indexOf(bytecodeElement);
    let bytecodeStartIndex = bytecodeIndex + bytecodeElement.length + 1;
    let abiIndex = editorHTML.indexOf(abiElement);
    let abiStartIndex = abiIndex + abiElement.length + 1;
    let bytecodeEndIndex = abiIndex - 2;

    let abi = editorHTML.substring(abiStartIndex);
    let bytecode = editorHTML.substring(bytecodeStartIndex, bytecodeEndIndex);

    setAbi(abi);
    setBytecode(bytecode);
    setDeployState(DeployState.NOT_DEPLOYED);

    saveAbi(abi);
    saveBytecode(bytecode);

    Swaypad.contract = new Swaypad(abi);
}
