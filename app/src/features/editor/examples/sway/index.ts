import { ExampleMenuItem } from "../../components/ExampleDropdown";
import { EXAMPLE_SWAY_CONTRACT_COUNTER } from "./counter";
import { EXAMPLE_SWAY_CONTRACT_LIQUIDITY_POOL } from "./liquiditypool";
import { EXAMPLE_SWAY_CONTRACT_SINGLEASSET } from "./singleasset";
import { EXAMPLE_SWAY_CONTRACT_MULTIASSET } from "./multiasset";

export const EXAMPLE_SWAY_CONTRACTS: ExampleMenuItem[] = [
  { label: "Counter.sw", code: EXAMPLE_SWAY_CONTRACT_COUNTER },
  { label: "LiquidityPool.sw", code: EXAMPLE_SWAY_CONTRACT_LIQUIDITY_POOL },
  { label: "SingleAsset.sw", code: EXAMPLE_SWAY_CONTRACT_SINGLEASSET },
  { label: "MultiAsset.sw", code: EXAMPLE_SWAY_CONTRACT_MULTIASSET },
];
