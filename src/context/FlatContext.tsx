import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import type { ReactNode } from "react";

interface FlatStatus {
    number: string;
    status: "available" | "hold" | "booked";
}

interface FlatContextType {
    flatStatuses: FlatStatus[];

    updateFlatStatus: (
        number: string,
        status: "available" | "hold" | "booked"
    ) => void;
}

const FlatContext = createContext<
    FlatContextType | undefined
>(undefined);

export function FlatProvider({
    children,
}: {
    children: ReactNode;
}) {

    const [flatStatuses, setFlatStatuses] =
        useState<FlatStatus[]>(() => {

            const saved =
                localStorage.getItem("flatStatuses");

            return saved
                ? JSON.parse(saved)
                : [];
        });

    const updateFlatStatus = (
        number: string,
        status: "available" | "hold" | "booked"
    ) => {

        setFlatStatuses((prev) => {

            const exists = prev.find(
                (flat) => flat.number === number
            );

            if (exists) {

                return prev.map((flat) =>
                    flat.number === number
                        ? {
                            ...flat,
                            status,
                        }
                        : flat
                );
            }

            return [
                ...prev,
                {
                    number,
                    status,
                },
            ];
        });
    };

    useEffect(() => {

        localStorage.setItem(
            "flatStatuses",
            JSON.stringify(flatStatuses)
        );

    }, [flatStatuses]);

    return (

        <FlatContext.Provider
            value={{
                flatStatuses,
                updateFlatStatus,
            }}
        >
            {children}
        </FlatContext.Provider>

    );
}

export function useFlat() {

    const context = useContext(FlatContext);

    if (!context) {

        throw new Error(
            "useFlat must be used inside FlatProvider"
        );

    }

    return context;
}