import { ExampleMenuItem } from "../../components/ExampleDropdown";
import { EXAMPLE_SWAY_CONTRACT_COUNTER } from "./counter";
import { EXAMPLE_SWAY_CONTRACT_SINGLEASSET } from "./src20";

export const EXAMPLE_SWAY_CONTRACTS: ExampleMenuItem[] = [
    { label: 'Counter.sw', code: EXAMPLE_SWAY_CONTRACT_COUNTER },
    { label: 'SingleAsset.sw', code: EXAMPLE_SWAY_CONTRACT_SINGLEASSET },
    { label: 'MultiAsset.sw', code: EXAMPLE_SWAY_CONTRACT_MULTIASSET },
  ];
  
