import { toast } from "@fuel-ui/react";
import { useMutation } from "@tanstack/react-query";
import { panicError, useWallet } from "../../Core";

export function useFaucet() {
    const { wallet } = useWallet();

    const mutation = useMutation(
        async () => {
            if (wallet?.address) {
                const faucet_uri = "http://127.0.0.1:4040/dispense";
                if (!wallet.provider.url.includes("4000")) {
                    throw new Error(
                        "Switch network to http://localhost:4000/graphql"
                    );
                }
                const request = new Request(faucet_uri, {
                    method: "POST",
                    body: JSON.stringify({
                        address: wallet.address.toString(),
                        captcha: "",
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                fetch(request)
                    .then((response) => {
                        if (response.status === 201) {
                            return true;
                        } else {
                            throw new Error(
                                "Something went wrong on API server!"
                            );
                        }
                    })
                    .catch((error) => {
                        throw new Error(error);
                    });
                return true;
            } else {
                return false;
            }
        },
        {
            onSuccess: (data) => {
                handleSuccess(data);
            },
            onError: handleError,
        }
    );

    function handleError(error: any) {
        const msg = error?.message;
        toast.error(msg?.includes("Panic") ? panicError(msg) : msg, {
            duration: 100000000,
            id: msg,
        });
    }

    function handleSuccess(data: boolean) {
        if (data) toast.success("Faucet request successful");
    }

    return mutation;
}
