import { useEffect } from "react";

// const onEsc = (e: KeyboardEvent)=>{
//     if(e.key === 'Escape') setPopup(null)
// }
export const onErrorImage = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== '/image_error.png') target.src = '/image_error.png';
};

type BackControlMode = "block" | "confirm";
export function Page_Control({ mode }: { mode: BackControlMode }) {
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (mode === "confirm") {
                e.preventDefault();
                e.returnValue = "";
                return "";
            }
        };
        const handlePopState = (e: PopStateEvent) => {
            if (mode === "block") {
                e.preventDefault();
                window.history.pushState(null, "", window.location.href);
                alert("앱 내 뒤로가기를 사용해주세요.");
            } else if (mode === "confirm") {
                const leave = confirm("정말 나가시겠습니까?");
                if (!leave) {
                    window.history.pushState(null, "", window.location.href);
                }
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("popstate", handlePopState);
        window.history.pushState(null, "", window.location.href);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("popstate", handlePopState);
        };
    }, [mode]);

    return null;
}
