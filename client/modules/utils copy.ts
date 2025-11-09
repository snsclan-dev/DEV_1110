import Cookies from "js-cookie";
import { checkAdmin } from "./systems";
import type { User } from "types";

type MediaEvent = React.MouseEvent<HTMLImageElement | HTMLVideoElement | HTMLElement>;
export const onClickImage = (e: MediaEvent, setModal: (modal: { image?: string }) => void )=>{
    if(e.target instanceof HTMLVideoElement) return;
    if(e.target instanceof HTMLImageElement) return setModal({image: e.target.src})
}
export const onClickVideo = (e: MediaEvent, setModal: (modal: { video?: string }) => void )=>{
    const src = (e.target as HTMLVideoElement).getAttribute('src');
    if(src) setModal({ video: src })
}
    
export const onErrorImage = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== '/image_error.png') target.src = '/image_error.png';
};
export const setScroll = (move: string)=>{
    if(move === 'top') return window.scrollTo({top: 0, behavior: 'smooth'})
    if(move === 'bottom') return window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})
}
export const chatSound = () => {
    const $SOUND = Cookies.get('sound') ? true : false;
    if($SOUND){
        const sound = new Audio('/join.mp3');
        sound.loop = false;
        sound.volume = 1;
        sound.play();
    }
}
export const getDistance = (lat1: number | string, lon1: number | string, lat2: number | string, lon2: number | string) => {
    lat1 = Number(lat1);
    lon1 = Number(lon1);
    lat2 = Number(lat2);
    lon2 = Number(lon2);
    const R = 6371; // 지구 반지름 (km)
    const toRad = Math.PI / 180;
    const dLat = (lat2 - lat1) * toRad;
    const dLon = (lon2 - lon1) * toRad;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // 거리 (m)로 반환
};
export const getWatermark = (user: User): ()=> void => {
    const { id, level, ip } = user;
    if(!ip || checkAdmin(level)) return ()=> {};
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if(!ctx) return ()=> {};

    const drawWatermark = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none'; // 클릭 방지
        canvas.style.zIndex = '9999';        // 최상위 배치

        // 워터마크 스타일 설정
        const fontSize = 24;
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // 매우 희미한 회색
        // 45도 회전 설정
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI / 6);  // 45도 회전
        // 반복 워터마크 그리기
        for (let x = -canvas.width; x < canvas.width; x += 200) {
            for (let y = -canvas.height; y < canvas.height; y += 180) {
                ctx.fillText(id ? id : ip, x, y);
            }
        }
    };
    // 캔버스 추가 및 워터마크 그리기
    document.body.appendChild(canvas);
    drawWatermark();
    // MutationObserver 설정 (캔버스가 없으면 다시 추가)
    const observer = new MutationObserver(() => {
        if (!document.body.contains(canvas)) {
            document.body.appendChild(canvas);
            drawWatermark();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
};