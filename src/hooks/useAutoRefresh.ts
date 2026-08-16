import {
    useEffect,
    useRef,
} from "react";

type AutoRefreshCallback =
    () => void | Promise<void>;

export function useAutoRefresh(
    callback: AutoRefreshCallback,
    intervalMs = 5000
) {

    const callbackRef =
        useRef(callback);

    // Always keep latest callback
    // without recreating interval.

    useEffect(() => {
        callbackRef.current =
            callback;
    }, [
        callback,
    ]);

    useEffect(() => {

        const timer =
            window.setInterval(
                () => {

                    if (
                        document.visibilityState !==
                        "visible"
                    ) {
                        return;
                    }

                    Promise.resolve(
                        callbackRef.current()
                    ).catch(
                        (
                            error
                        ) => {
                            console.error(
                                "Auto refresh failed:",
                                error
                            );
                        }
                    );

                },
                intervalMs
            );

        return () => {
            window.clearInterval(
                timer
            );
        };

    }, [
        intervalMs,
    ]);
}