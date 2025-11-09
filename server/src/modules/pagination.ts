// totalCount: 전체 게시물 수(SQL Count), page: 입력페이지, viewList: 화면에 보여질 게시물 목록 수, blockLink: 하단 링크 수
export const pagination = (totalCount: number, page: number | string | undefined, viewList: number, blockLink: number)=> {
    let nowPage = Number(page); // 현재 페이지
    let totalLink = Math.ceil(totalCount / viewList); // 총 페이지 링크 수

    if(!nowPage || Number.isNaN(nowPage) || nowPage > totalLink) nowPage = 1;
    let offset = (nowPage - 1) * viewList; // SQL offset 보여질 범위 0 ~ 10 
    let linkStart = Math.floor((nowPage - 1) / blockLink ) * blockLink + 1; // 블럭 시작 숫자
    let linkEnd = linkStart + blockLink - 1; // 블럭 끝 숫자
    let linkPrev = linkStart -1;
    let linkNext = linkEnd +1;
    
    if (linkEnd > totalLink) linkEnd = totalLink;
    
    // 클라이언트용 배열 생성
    const linkBlock = Array.from({ length: linkEnd - linkStart + 1 }, (_, i) => i + linkStart);
    
    // return { totalCount, nowPage, viewList, blockLink, totalLink, offset, linkStart, linkEnd, linkPrev, linkNext }
    return { 
        viewList, offset, // SQL
        nowPage, totalLink, linkPrev, linkNext, linkBlock // CLIENT
    };
}