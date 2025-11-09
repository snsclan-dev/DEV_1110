import React, { useEffect, useRef, useState } from "react";
import { getDistance } from "./utils";
import type { Location, User } from "types";

interface LocationGroup {
    location: Location;
    users: User[];
}
interface KakaoMapProps {
    user: User[];
}

export const Kakao_Map: React.FC<KakaoMapProps> = ({ user }) => {
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const customOverlaysRef = useRef<any[]>([]);
    const [auto, setAuto] = useState(true); // map 자동 조정
    const [update, setUpdate] = useState(true) // map 업데이트 여부

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

        const groups: LocationGroup[] = [];
        user.forEach((u) => {
            if (!u.location || !u.name) return;
            const foundGroup = groups.find((group) => getDistance(group.location, u.location!) <= 10); // 거리 10m 기준으로 사용자 그룹핑
            if (foundGroup) {
                foundGroup.users.push(u);
            } else {
                groups.push({ location: u.location, users: [u] });
            }
        });

        const bounds = new window.kakao.maps.LatLngBounds();
        groups.forEach(({ location, users }) => {
            const position = new window.kakao.maps.LatLng(location.latitude, location.longitude);
            const marker = new window.kakao.maps.Marker({ position, map: mapRef.current }); // 마커 생성
            markersRef.current.push(marker);
            bounds.extend(position);

            // 이름 묶음 커스텀 오버레이 생성
            const content = `<div style="padding: 4px 10px; background: rgba(255,255,255,0.9); border-radius: 6px; border: 1px solid #888; white-space: nowrap; font-weight: bold; font-size: 13px;">
                ${users.map((u) => u.name).join("<br/>")}
            </div>`;
            const overlay = new window.kakao.maps.CustomOverlay({ position, content, yAnchor: 2.4, map: mapRef.current }); // yAnchor: 오버레이가 마커 위쪽에 위치하게 조정 (1은 하단 기준)
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
