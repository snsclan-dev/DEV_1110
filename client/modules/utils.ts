import Cookies from "js-cookie";
import { checkAdmin } from "./systems";
import type { Location, User } from "types";
import dayjs from "dayjs";
import 'dayjs/locale/ko';

// type MediaEvent = React.MouseEvent<HTMLImageElement | HTMLVideoElement | HTMLElement>;
// export const onClickImage = (e: MediaEvent, setModal: (modal: { image?: string }) => void )=>{
//     if(e.target instanceof HTMLVideoElement) return;
//     if(e.target instanceof HTMLImageElement) return setModal({image: e.target.src})
// }
// export const onClickVideo = (e: MediaEvent, setModal: (modal: { video?: string }) => void )=>{
//     const src = (e.target as HTMLVideoElement).getAttribute('src');
//     if(src) setModal({ video: src })
// }
export const onErrorImage = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== '/image_error.png') target.src = '/image_error.png';
};
export const setScroll = (move: string)=>{
    if(move === 'top') return window.scrollTo({top: 0, behavior: 'smooth'})
    if(move === 'bottom') return window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})
}
export const setSound = (path: string) => {
    const $SOUND = Cookies.get('sound') === 'true' ? true : false;
    if($SOUND){
        // const sound = new Audio('/join.mp3');
        const sound = new Audio(`${path}.mp3`);
        sound.loop = false;
        sound.volume = 1;
        sound.play();
    }
}
export const getDate = (date?: string)=>{
    if(!date || !dayjs(date).isValid()) return dayjs().format('YYYY-MM-DD')
    return dayjs(date).format('YYYY-MM-DD')
}
export const getDistance = (myLocation: Location, userLocation: Location): number => {
    const lat1 = Number(myLocation.latitude);
    const lon1 = Number(myLocation.longitude);
    const lat2 = Number(userLocation.latitude);
    const lon2 = Number(userLocation.longitude);
    const R = 6371; // 지구 반지름 (km)
    const toRad = Math.PI / 180;
    const dLat = (lat2 - lat1) * toRad;
    const dLon = (lon2 - lon1) * toRad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // 거리 (m)로 반환
};
export const getWatermark = (user: User)=> {
    const { id, level, ip } = user;
    if(!ip || checkAdmin(level)) return;

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
        canvas.style.zIndex = '9999'; // 최상위 배치
        
        // 워터마크 스타일 설정
        ctx.font = '18px Arial';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI / 6);  // 45도 회전
        
        for (let x = -canvas.width; x < canvas.width; x += 280) { // 반복 워터마크 그리기
            for (let y = -canvas.height; y < canvas.height; y += 200) {
                if(id){
                    if(id.length >= 10){
                        ctx.fillText(`${id}`, x, y);
                        ctx.fillText(`${ip}`, x, y + 24);
                    }else{
                        ctx.fillText(`${id} (${ip})`, x, y);
                    }
                }else{
                    ctx.fillText(`${ip}`, x, y);
                }
            }
        }
    };

    // 캔버스 추가 및 워터마크 그리기
    document.body.appendChild(canvas);
    drawWatermark();
    return () => {
        canvas.remove();
    }
};