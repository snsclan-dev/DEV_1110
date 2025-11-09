import { getDistance } from "modules";
import type { Location } from "types";

export const View_Id = ({ id }: { id: string }) => {
    return <span className="fs_13 c_gray fwb">{id.substring(0, 4)}*</span>;
};
export const View_Ip = ({ ip }: { ip: string }) => {
    const $IP = /(\d+)[.](\d+)[.](\d+)[.](\d+)/g;
    return <span className="fs_13 c_blue">{ip.replace($IP, "🔒.🔒.$3.$4")}</span>;
};
export const View_Price_Input = ({price}: { price: string })=>{
    return <><span className="c_red"><View_Price price={price}/></span> ( <View_Price_Won price={price}/> )</>
}
export const View_Char = ({char, style=''}: { char: string, style?: string })=>{
    if(char === 'vl') return <span className={`vl ${style}`}>&#x2502;</span>
    if(char === 'li') return <span className={`li ${style}`}>&bull;</span>
    if(char === 'sl') return <span className={`sl ${style}`}>/</span> // chat
    if(char === 'like') return <span className={`like mg_r ${style}`}>♥</span>
    return <span className="c_red">&#x2716;</span>
}
export const View_Date = ({type, date}: { type?: string, date: string })=>{
    const today = Date.now();
    const timeValue = Date.parse(date);
    const parseTime = Math.floor((today - timeValue) / 1000 / 60);  // 60 분
    
    const day = Math.floor(parseTime / 60 / 24);
    if(type === 'count') return <span className="fwb">{day}일</span>;

    // if (parseTime < 10) return <span className="c_red fwb">방금 전</span>;
    if (parseTime < 60) return <span className="c_orange fwb">{parseTime}분 전</span>;

    const hour = Math.floor(parseTime / 60);
    if (hour < 24) return <span className="c_lblue fwb">{hour}시간 전</span>;

    // const day = Math.floor(parseTime / 60 / 24);
    if (day < 31) return <span className="c_green">{day}일 전</span>;
    if (day < 365) return <span className="c_gray">{date?.substring(5, 10)}</span>;
    return <span className="c_lgray">{date?.substring(2, 10)}</span>;
}
export const View_Timer = ({time}: { time: string })=>{
    if(!time) return null;
    const today = Date.now();
    const timeValue = Date.parse(time);
    const parseTime = Math.floor((timeValue - today) / 1000 / 60);  // 60 분
    const day = Math.floor(parseTime / 60 / 24);
    const $DAY = day + 1
    if($DAY < 0) return <span className="c_gray fwb">종료</span>
    if($DAY === 0) return <span className="c_red fwb">오늘 종료</span>
    if($DAY === 1) return <span className="c_orange fwb">내일 종료</span>
    return <span className={`${$DAY <= 3 ? "c_blue" : "c_green"} fwb`}>{$DAY}일 후 종료</span>
}
export const View_Event = ({price, time}: { price: string, time: string })=>{
    if(!price && !time) return null;
    if(price && !time) return <View_Price price={price}/>
    if(!price && time) return <View_Timer time={time}/>
    return(<><View_Price price={price}/><View_Char char='vl'/><View_Timer time={time}/></>)
}
export const View_Count = ({ count }: { count: number }) => {
    if (!count) return <span className="c_gray fwb">0</span>;
    if (count >= 100) return <span className="c_red">100+</span>;
    if (count >= 50) return <span className="c_red">50+</span>;
    if (count >= 40) return <span className="c_orange fwb">{count}</span>;
    if (count >= 30) return <span className="c_pink fwb">{count}</span>;
    if (count >= 20) return <span className="c_blue fwb">{count}</span>;
    if (count >= 10) return <span className="c_green fwb">{count}</span>;
    return <span className="c_gray fwb">{count}</span>;
};
export const View_Price = ({price}: { price: string })=>{ // 3단위 콤마 구분
    const $PRICE = String(price).replace(/[^\d]/g, '');
    if(!price || !$PRICE) return <span className="fwb">0</span>;
    const $WON = $PRICE.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return <span className="fwb">{$WON}</span>
};
const zeroCut = (input: string)=>{
    const $INPUT = input.toString().replace(/\B(?=(\d{4})+(?!\d))/g, ',');
    return $INPUT.split(',').map(e => e.replace(/^[0]*/g, ''));
}
const priceStyle = (price: string | number)=>{
    if(Number(price) >= 1000000) return 'c_red fwb'
    if(Number(price) >= 100000) return 'c_orange fwb'
    if(Number(price) >= 10000) return 'c_blue fwb'
    if(Number(price) >= 1000) return 'c_green fwb'
    return 'c_green fwb'
}
export const View_Price_Won = ({price}: { price: string | number })=>{ // 한글 표시
    const $PRICE = String(price).replace(/[^\d]/g, '');
    if(!price || !$PRICE) return '0';
    const $CUT = zeroCut($PRICE)
    if($CUT.length === 1) return <span className={priceStyle(price)}>{$CUT[$CUT.length -1]}원</span>;
    if($CUT.length === 2) return <span className={priceStyle(price)}>{$CUT[$CUT.length -2]}만 {$CUT[$CUT.length -1]}원</span>;
    if($CUT.length === 3) return <span className={priceStyle(price)}>{$CUT[$CUT.length -3]}억 {$CUT[$CUT.length -2] === '' ? '' : `${$CUT[$CUT.length -2]}만`} {$CUT[$CUT.length -1]}원</span>;
};
export const View_Distance = ({ type, location1, location2 }: { type?: string, location1: Location, location2: Location }) => {
    if (!location1 || !location2) return <span className="c_lgray fwb">X</span>
    const dist = getDistance(location1, location2); // m 단위
    const $DIST = Math.floor(dist); // 소수점 버림
    const $KM = Math.floor($DIST / 1000);

    // 1000m 이상이면 km 단위, 아니면 m 단위
    if ($DIST >= 1000 * 300){
        if(type === 'text') return <span className="c_lgray fwb">🩶 멀리 있어요!</span>;
        return '🩶';
    }
    // if ($DIST >= 1000 * 200) return <span className="c_lgray fwb">200km+</span>;
    // if ($DIST >= 1000 * 100) return <span className='c_gray fwb'>100km+</span>;
    if ($DIST >= 1000 * 100) return <span className='c_gray fwb'>{$KM}km</span>;
    if ($DIST >= 1000 * 50) return <span className='c_green fwb'>{$KM}km</span>;
    if ($DIST >= 1000 * 30) return <span className='c_green fwb'>{$KM}km</span>;
    if ($DIST >= 1000 * 10) return <span className='c_blue fwb'>{$KM}km</span>;
    if ($DIST >= 1000 * 5) return <span className='c_pink fwb'>{$KM}km</span>;
    if ($DIST >= 1000) return <span className="c_orange fwb">{$KM}km</span>;
    if ($DIST >= 10) return <span className="c_red fwb">{$DIST}m</span>;
    // return <span className="c_red fwb">10m 미만</span>;
    if(type === 'text') return <span className="c_red fwb mg_-l">❤️ 근처에 있어요!</span>;
    return <span className="mg_-l">❤️</span>;
};