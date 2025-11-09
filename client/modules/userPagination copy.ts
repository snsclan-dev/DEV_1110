import { useCallback, useEffect, useState } from "react";
import { useFetch } from "./fetch";
import { CodeData } from "@/types";

// 새로고침 useCallback 버전

export const usePagination = (url: string, initialPage = 1) => {
    const [data, setData] = useState<CodeData | null>(null);
    const [list, setList] = useState<unknown[]>([]);
    const [paging, setPaging] = useState<object | null>(null);
    const [page, setPage] = useState(initialPage);

    const fetchData = useCallback(async (targetPage: number) => {
        const $DATA = await useFetch.get<CodeData>(`${url}/${targetPage}`);
        if (!$DATA) return;

        if ($DATA.code === 0) {
        setData($DATA);
        setList(Array.isArray($DATA.list) ? $DATA.list : []);
        setPaging($DATA.paging ?? null);
        }
    }, [url]);

    useEffect(() => {
        fetchData(page);
    }, [fetchData, page]);

    const refresh = () => fetchData(page);

    return { list, paging, page, setPage, refresh, data };
};
