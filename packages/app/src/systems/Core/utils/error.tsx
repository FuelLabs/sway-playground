import { toast } from "@fuel-ui/react";

export function panicError(msg: string) {
    <div>Unexpected block execution error: {msg}</div>;
};

export function handleError(error: any) {
    const msg = error?.message;
    toast.error(msg?.includes("Panic") ? panicError(msg) : msg, {
        duration: 100000000,
        id: msg,
    });
}
