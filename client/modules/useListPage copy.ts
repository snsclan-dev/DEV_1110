import { useEffect, useState } from "react";
import { useFetch } from "./fetch";
// import type { CodeData, Paging } from "types";
import type { Paging } from "types";

type List = { url: string, room: string, menu: string, category: string }
export const useListPage = ({ url, room, menu, category }: List) => {
    // const [data, setData] = useState<CodeData | null>(null);
    const [list, setList] = useState<any[]>([]);
    const [paging, setPaging] = useState<Paging | null>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            const $DATA = await useFetch.get(url, { room, menu, category, page });
            if($DATA){
                // setData($DATA);
                setList(Array.isArray($DATA.list) ? $DATA.list : [])
                setPaging($DATA.paging as Paging ?? null)
            }
        };
        fetchData();
    }, [url, room, menu, category, page]);

    // return { list, paging, page, setPage, data };
    return { list, paging, setPage };
};
