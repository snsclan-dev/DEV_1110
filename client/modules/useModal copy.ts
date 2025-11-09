import { useCallback, useState } from "react";

type ModalState = Record<string, any>;
export const useModal = ()=> {
    const [modal, setModal] = useState<ModalState>({});

    const openModal = useCallback((data: ModalState) => {
        setModal(Object.keys(data).length ? data : {});
    }, []);
    const closeModal = useCallback(()=> setModal({}), []);

    return { modal, openModal, closeModal };
};
// export const useModal = (): [ModalState, (data: ModalState) => void, () => void] => {
//     const [modal, setModal] = useState<ModalState>({});

//     useEffect(()=>{
//         const onEsc = (e: KeyboardEvent)=>{
//             if(e.key === 'Escape') setModal({})
//         }
//         addEventListener('keydown', onEsc)
//         return ()=> removeEventListener('keydown', onEsc)
//     }, [])

//     const openModal = useCallback((data: ModalState) => {
//         if (Object.keys(data).length === 0) {
//             setModal({});
//         } else {
//             setModal(data);
//             // setModal(prev => ({ ...prev, ...data })); // 여러 모달 사용
//         }
//     }, []);

//     const closeModal = useCallback(()=> setModal({}), []);
//     return { modal, openModal, closeModal };
// };