import { QueryClient } from "react-query";
import { handleError } from ".";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            onError: handleError,
            retry: false,
            refetchOnWindowFocus: false,
            structuralSharing: false,
        },
        mutations: {
            onError: handleError,
        },
    },
});
