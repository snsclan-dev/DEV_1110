import { Paging } from '@/types/app';
import Link from 'next/link';

// link page [url: `/board/list/${menu}/${category}`]
export const Pagination_Link = ({url, paging}: { url: string, paging: Paging}) => {
    if (!paging.linkBlock || paging.linkBlock.length < 2) return null;
    const { nowPage, totalLink, linkPrev, linkNext, linkBlock } = paging;
    
    return (
        <div className="layout_paging">
            <div className="page_list">
                {linkBlock.map( e =>
                    e === nowPage ? <li key={e} className="page_now">{e}</li> : <Link key={e} href={`${url}/${e}`}><li className="page">{e}</li></Link>
                )}
            </div>
            <div className="page_left">
                {nowPage > 1 && <Link href={`${url}/1`}><li className="page" >처음</li></Link>}
                {linkPrev > 1 && <Link href={`${url}/${linkPrev}`}><li className="page">이전</li></Link>}
            </div>
            <div className="page_right">
                {linkBlock[linkBlock.length - 1] < totalLink && (<Link href={`${url}/${linkNext}`}><li className="page">다음</li></Link>)}
                {nowPage < totalLink && <Link href={`${url}/${totalLink}`}><li className="page" >마지막</li></Link>}
            </div>
        </div>
    );
};
// click page [useEffect]
export const Pagination_Click = ({ paging, page }: { paging: Paging | null, page: (n: number)=> void }) => {
    if(!paging) return null;
    const { nowPage, totalLink, linkPrev, linkNext, linkBlock } = paging;
    if (linkBlock.length < 2) return null;
    
    return (
        <div className="layout_paging">
            <div className="page_list">
                {linkBlock.map(e => 
                    e === nowPage ? <li  key={e} className="page_now">{e}</li> : <li  key={e} className="page" onClick={()=>page(e)}>{e}</li>
                )}
            </div>
            <div className="page_left">
                {nowPage > 1 && <li className="page" onClick={()=>page(1)}>처음</li>}
                {linkPrev > 1 && <li className="page" onClick={()=>page(linkPrev)}>이전</li>}
            </div>
            <div className="page_right">
                {linkBlock[linkBlock.length - 1] < totalLink && (<li className="page" onClick={() => page(linkNext)}>다음</li>)}
                {nowPage < totalLink && <li className="page" onClick={()=>page(totalLink)}>마지막</li>}
            </div>
        </div>
    );
};