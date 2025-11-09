import { useEffect, useState } from "react";
import { useFetch } from "./fetch";
import type { Paging } from "types";

type List = { url: string, room: string, menu: string, category: string }
export const useListPage = ({ url, room, menu, category }: List) => {
    const [list, setList] = useState<any[]>([]);
    const [paging, setPaging] = useState<Paging | null>(null);
    const [page, setPage] = useState(1);

    const fetchData = async () => {
        const $DATA = await useFetch.get(url, { room, menu, category, page });
        if($DATA){
            setList(Array.isArray($DATA.list) ? $DATA.list : [])
            setPaging($DATA.paging as Paging ?? null)
        }
    };
    
    useEffect(() => {
        fetchData();
    }, [url, room, menu, category, page]);

    const refresh = () => {
        fetchData();
    };

    return { params: { room, menu, category }, list, paging, setPage, refresh };
};
