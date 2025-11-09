import { Paging } from '@/types/app';
import Link from 'next/link';

// link page [url: `/board/list/${menu}/${category}`]
export const Pagination_Link = ({url, paging}: { url: string, paging: Paging}) => {
    const linkBlock = [];
    for (let i = paging.linkStart; i <= paging.linkEnd; i++) {
        linkBlock.push(i);
    }
    if(linkBlock.length < 2) return null;
    return (
        <div className="layout_paging">
            <div className="page_list">
                {linkBlock.map( e =>
                    e === paging.nowPage ? <li key={e} className="page_now">{e}</li> : 
                    <Link key={e} href={`${url}/${e}`}><li className="page">{e}</li></Link>
                )}
            </div>
            <div className="page_left">
                {paging.nowPage > 1 && <Link href={`${url}/1`}><li className="page" >처음</li></Link>}
                {paging.linkPrev > 1 && <Link href={`${url}/${paging.linkPrev}`}><li className="page">이전</li></Link>}
            </div>
            <div className="page_right">
                {paging.linkEnd < paging.totalLink && <Link href={`${url}/${paging.linkNext}`}><li className="page">다음</li></Link>}
                {paging.nowPage < paging.totalLink && <Link href={`${url}/${paging.totalLink}`}><li className="page" >마지막</li></Link>}
            </div>
        </div>
    );
};
// click page [useEffect]
export const Pagination_Click = ({paging, page}: { paging: Paging, page: number}) => {
    const linkBlock = [];
    // for (let i = paging.linkStart; i <= paging.linkEnd; i++) {
    //     linkBlock.push(i);
    // }
    const linkBlock = Array.from({ length: paging.linkEnd - paging.linkStart + 1 }, (_, i) => i + paging.linkStart);

    if(linkBlock.length < 2) return null;
    return (
        <div className="layout_paging">
            <div className="page_list">
                {linkBlock.map( e =>
                    e === paging.nowPage ? <li  key={e} className="page_now">{e}</li> : 
                    <li  key={e} className="page" onClick={()=>page(e)}>{e}</li>
                )}
            </div>
            <div className="page_left">
                {paging.nowPage > 1 && <li className="page" onClick={()=>page(1)}>처음</li>}
                {paging.linkPrev > 1 && <li className="page" onClick={()=>page(paging.linkPrev)}>이전</li>}
            </div>
            <div className="page_right">
                {paging.linkEnd < paging.totalLink && <li className="page" onClick={()=>page(paging.linkNext)}>다음</li>}
                {paging.nowPage < paging.totalLink && <li className="page" onClick={()=>page(paging.totalLink)}>마지막</li>}
            </div>
        </div>
    );
};