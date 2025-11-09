// import { Editor_Notice } from "components/editor";

import { fetchApiData } from "modules/fetchServer";

export const App_Page = () => {
    const clickTest = async ()=>{
        const $DATA = await fetchApiData('get', '/data')
        console.log($DATA);
    }
    return (<div className="layout_max">
        {/* <Editor_Notice params={{ room: 'room', menu: 'menu', category: 'category' }} /> */}

        <button onClick={clickTest}>api 서버 테스트</button>

    </div>);
};
