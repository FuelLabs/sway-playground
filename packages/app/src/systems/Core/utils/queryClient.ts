import { QueryClient } from "react-query";
import { displayError } from ".";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            onError: displayError,
            retry: false,
            refetchOnWindowFocus: false,
            structuralSharing: false,
        },
        mutations: {
            onError: displayError,
        },
    },
});
