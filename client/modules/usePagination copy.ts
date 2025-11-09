import { useEffect, useState } from "react";
import { useFetch } from "./fetch";
import type { CodeData, Paging } from "types";

export const usePagination = (url: string, initialPage = 1) => {
    const [data, setData] = useState<CodeData | null>(null);
    const [list, setList] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [paging, setPaging] = useState<Paging | null>(null);
    const [page, setPage] = useState(initialPage);

    useEffect(() => {
        const fetchData = async () => {
            const $DATA = await useFetch.get(`${url}/${page}`);
            // console.log('usePagination :', $DATA); ///
            // if (!$DATA) return;
            // if ($DATA.code === 0){
            if($DATA){
                setData($DATA);
                setList(Array.isArray($DATA.list) ? $DATA.list : [])
                setPaging($DATA.paging as Paging ?? null)
            }
            // }
        };
        fetchData();
    }, [url, page]);

    return { list, paging, page, setPage, data };
};
