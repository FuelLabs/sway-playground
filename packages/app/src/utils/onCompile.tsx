import { save_abi, save_bytecode } from "../pages/CounterPage";
import { Swaypad } from "./interface";

const abiElement = "<b>ABI</b>"
const bytecodeElement = "<b>Bytecode</b>:"

export const onCompile = (
    setAbi: React.Dispatch<React.SetStateAction<string>>,
    setBytecode: React.Dispatch<React.SetStateAction<string>>,
    setDeployState: React.Dispatch<React.SetStateAction<boolean>>,
) => {
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
    setDeployState(false);

    save_abi(abi);
    save_bytecode(bytecode);

    Swaypad.contract = new Swaypad(abi);
}
