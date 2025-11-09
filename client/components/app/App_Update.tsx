import { Li_Item, Li_Label, Title } from "./view/Tags"

export const App_Update = ()=>{
    return(<div className="max_w80">
        <Title title="준비중인(업데이트) 계획"></Title>

        <Li_Label label="0">주제(컨셉)에 맞게 여러 가지를 만들어볼 예정입니다.</Li_Label>
        <Li_Item item=">">비공개, 비밀, 개인, 수위 제한 없음, 어둠(심연) 등</Li_Item>
        <Li_Item item=">" style="mg_b10">아이디어 받습니다. 어둠의 놀이공간을 만들어 봅시다!</Li_Item>

        <Li_Label label="1">게시판을 준비중입니다.</Li_Label>
        <Li_Item item=">" style="mg_b10">대화방(채팅)이 안정적으로 운영되면 오픈하겠습니다.</Li_Item>

        <Li_Label label="2">개인 채널(방)을 준비중입니다.</Li_Label>
        <Li_Item item=">" style="mg_b10">초대된 사람들만 이용이 가능한 공간을 만들 예정입니다.</Li_Item>
    </div>)
}