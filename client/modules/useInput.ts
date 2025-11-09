import { useState, useCallback } from "react";

type InputData = Record<string, string | boolean>;
type InputEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
export const useInput = <T extends InputData>(initialInput: T = {} as T) => {
    const [data, setData] = useState<T>(initialInput);
    const onChange = useCallback((e: InputEvent | Partial<T>) => {
        if ("target" in e) {
            const { name, value } = e.target as HTMLInputElement;
            setData((prev) => ({ ...prev, [name]: value.replace(/^[`\s\\]/, "").replace(/[`\\]/g, "") }));
            // setData(prev => ({ ...prev, [name]: value.replace(/^[^ㄱ-ㅎ가-힣\[\]()\w]/, "").replace(/[`:;|\\\/]/g, "") }));

        } else {
            setData((prev) => ({ ...prev, ...e }));
        }
    }, []);

    return [data, onChange] as const;
};
