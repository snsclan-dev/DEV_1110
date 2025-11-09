import React, { useEffect, useRef, useState } from "react";
import { getDistance } from "./utils";
import type { Location, User } from "types";
import { Kakao_Overlay } from "./Kakao_Overlay";
import ReactDOMServer from "react-dom/server";

declare global {
    interface Window {
        kakao: any;
    }
}
export const Kakao_Map: React.FC<{ user: User[] }> = ({ user }) => {
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const customOverlaysRef = useRef<any[]>([]);
    const [auto, setAuto] = useState(true); // map 자동 조정
    const [update, setUpdate] = useState(true) // map 업데이트 여부

    // console.log(mapRef.current);
    
    // 맵 초기화
    const initializeMap = () => {
        if (mapRef.current) return;
        window.kakao.maps.load(() => {
            const el = document.getElementById("map");
            if (!el) return;
            mapRef.current = new window.kakao.maps.Map(el, { center: new window.kakao.maps.LatLng(37.567513, 126.817353), level: 3 });
            window.kakao.maps.event.addListener(mapRef.current, "dragstart", () => setAuto(false)); // 사용자 지도 이동 감지
        });
    };

    useEffect(() => {
        if (window.kakao && window.kakao.maps) initializeMap();
    }, []);

    useEffect(() => {
        if (!update || !mapRef.current) return;
        // 이전 마커 및 커스텀 오버레이 제거
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];
        customOverlaysRef.current.forEach((overlay) => overlay.setMap(null));
        customOverlaysRef.current = [];

        if (!user || user.length === 0) return;
        const groups: { users: User[], location: Location }[] = [];
        user.forEach((e) => {
            if (!e.location || !e.name) return;
            const foundGroup = groups.find((group) => getDistance(group.location, e.location!) <= 10); // 거리 10m 기준으로 사용자 그룹핑
            if (foundGroup) {
                foundGroup.users.push(e);
            } else {
                groups.push({ location: e.location, users: [e] });
            }
        });

        const bounds = new window.kakao.maps.LatLngBounds();
        groups.forEach(({ location, users }) => {
            const position = new window.kakao.maps.LatLng(location.latitude, location.longitude);
            const marker = new window.kakao.maps.Marker({ position, map: mapRef.current }); // 마커 생성
            markersRef.current.push(marker);
            bounds.extend(position);
            const content = document.createElement('div'); // 커스텀 오버레이
            content.innerHTML = ReactDOMServer.renderToString(<Kakao_Overlay users={users} />);
            const overlay = new window.kakao.maps.CustomOverlay({ position, content, xAnchor: 0.5, yAnchor: 1, map: mapRef.current }); // yAnchor: 오버레이가 마커 위쪽에 위치하게 조정 (1은 하단 기준)
            customOverlaysRef.current.push(overlay);
        });

        if (auto && groups.length > 0) mapRef.current.setBounds(bounds);
    }, [user, auto, update]);

    return (<>
        <div id="map" className="box kakao_map mg_b6"/>
        <div className="ta_c mg_h2">
            <button className={`bt_3 ${auto ? 'c_green' : 'c_gray'}`} onClick={() => setAuto((prev) => !prev)}>{auto ? "자동" : "수동"}</button>
            <button className="bt_3" onClick={()=> setUpdate((prev) => !prev)}>{update ? <span className="c_green">실시간 업데이트</span> : <span className="c_gray">업데이트 중지</span>}</button>
        </div>
    </>);
};
