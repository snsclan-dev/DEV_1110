import { useState, useCallback } from "react";

export const useData = <T extends object>(input: T) => {
    const [data, setData] = useState<T>(input);

    const updateData = useCallback((obj: Partial<T>) => {
        setData((save) => ({ ...save, ...obj }));
    }, []);

    return [data, updateData] as const;
};
