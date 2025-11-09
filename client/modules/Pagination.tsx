import { Paging } from 'types';

export const Pagination = ({ paging, setPage }: { paging: Paging | null, setPage: (n: number)=> void }) => {
    if(!paging) return null;
    const { nowPage, totalLink, linkPrev, linkNext, linkBlock } = paging;
    if (linkBlock.length < 2) return null;
    
    return (
        <div className="layout_paging">
            <div className="page_list">
                {linkBlock.map(e => 
                    e === nowPage ? <li  key={e} className="page_now">{e}</li> : <li  key={e} className="page" onClick={()=>setPage(e)}>{e}</li>
                )}
            </div>
            <div className="page_left">
                {nowPage > 1 && <li className="page" onClick={()=>setPage(1)}>처음</li>}
                {linkPrev > 1 && <li className="page" onClick={()=>setPage(linkPrev)}>이전</li>}
            </div>
            <div className="page_right">
                {linkBlock[linkBlock.length - 1] < totalLink && (<li className="page" onClick={() => setPage(linkNext)}>다음</li>)}
                {nowPage < totalLink && <li className="page" onClick={()=>setPage(totalLink)}>마지막</li>}
            </div>
        </div>
    );
};