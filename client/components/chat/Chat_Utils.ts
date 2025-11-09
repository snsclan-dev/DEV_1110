import Cookies from "js-cookie";

export const chatMessage = (message: string)=>{
    const regex = /(https:\/\/[^\s]+)/g;
    return message.replace(regex, url => `<p><a href="${url}" target="_blank" rel="noopener noreferrer" class="c_green fwb">[ ${url} ]</a></p>`);
}
export const chatSlider = (view: HTMLDivElement | null)=>{
    const $SLIDER = document.getElementById('slider')
    if(!view || !$SLIDER) return ()=>{};
    if(Cookies.get('chat_slider')) view.style.height = Cookies.get('chat_slider') + 'px';

    const move = (e: MouseEvent | TouchEvent)=>{
        const newY = e instanceof TouchEvent ? e.touches[0].clientY : (e as MouseEvent).clientY;
        view.style.height = view.offsetHeight + newY - dragY + "px";
        dragY = newY;
    }
    const end = ()=>{
        Cookies.set('chat_slider', view.offsetHeight.toString());
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', end);
        document.removeEventListener('touchmove', move);
        document.removeEventListener('touchend', end);
    }
    let dragY = 0;
    const drag = (clientY: number)=>{
        dragY = clientY;
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', end);
        document.addEventListener('touchmove', move, { passive: false });
        document.addEventListener('touchend', end);
    }
    const touchStartHandler = (e: TouchEvent) => {
        e.preventDefault();
        drag(e.touches[0].clientY);
    }
    $SLIDER.onmousedown = (e)=> drag(e.clientY);
    $SLIDER.addEventListener('touchstart', touchStartHandler, { passive: false });

    return ()=>{
        $SLIDER.onmousedown = null;
        $SLIDER.removeEventListener('touchstart', touchStartHandler);
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', end);
        document.removeEventListener('touchmove', move);
        document.removeEventListener('touchend', end);
    }
}