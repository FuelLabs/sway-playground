import {
    AbstractAddress,
    BaseWalletLocked,
    Contract,
    Interface,
    Provider,
} from "fuels";

export class Swaypad {
    static contract: Swaypad;
    readonly abi: Interface;

    constructor(abi: string) {
        this.abi = JSON.parse(abi);
    }

    connect(
        id: string | AbstractAddress,
        walletOrProvider: BaseWalletLocked | Provider
    ): Contract {
        return new Contract(id, this.abi, walletOrProvider);
    }
}
