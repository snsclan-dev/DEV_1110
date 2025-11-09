import { storeApp, storeUser } from "modules/stores/zustand";
import { socket } from "modules/sockets";
import { getDistance } from "modules/utils";
import { $APP_STATUS } from "components/app";
import type { User } from "types";

// 위치 변경 감지 및 위치 업데이트
type Position = { id: number | null;  latitude: number | null; longitude: number | null; }
const $POSITION: Position = { id: null, latitude: null, longitude: null } // id: watchPosition id
// const geoLocation = (set: Parameters<StateCreator<StoreUser>>[0], user: User): void => {
const geoLocation = (user: User): void => {
    const startWatching = (highAccuracy: boolean) => {
        if ($POSITION.id !== null) {
            navigator.geolocation.clearWatch($POSITION.id); // 중복 방지
            $POSITION.id = null;
        }
        $POSITION.id = navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            if ($POSITION.latitude === null && $POSITION.longitude === null) {
                // set((state) => ({ user: { ...state.user, location: { latitude, longitude } } })); // client location
                storeUser.getState().setUser({ location: { latitude, longitude } });
                if (user.id) socket.emit("USER_LOCATION", { id: user.id, location: `${latitude},${longitude}` }); // 접속 위치 DB 저장
            }
            if ($POSITION.latitude !== null && $POSITION.longitude !== null) {
                const $DISTANCE = getDistance({ latitude: $POSITION.latitude, longitude: $POSITION.longitude }, { latitude, longitude });
                if ($DISTANCE < 10) return; // 10m 이내이면 위치 업데이트하지 않음
                if ($DISTANCE >= 1000 && highAccuracy) { // 1km 이상 거리일 때 highAccuracy가 true라면 재등록
                    $POSITION.latitude = latitude;
                    $POSITION.longitude = longitude;
                    startWatching(false); // 정확도 낮게 재등록
                    return;
                }
                if ($DISTANCE < 1000 && !highAccuracy) { // 1km 미만 거리일 때 highAccuracy가 false라면 재등록
                    $POSITION.latitude = latitude;
                    $POSITION.longitude = longitude;
                    startWatching(true); // 정확도 높게 재등록
                    return;
                }
            }
            $POSITION.latitude = latitude;
            $POSITION.longitude = longitude;
            socket.emit("SOCKET_LOCATION", { location: { latitude, longitude } }); // socket user realtime location update
        }, (err: GeolocationPositionError) => {
            // set((state) => ({ user: { ...state.user, location: null } })); // location off
            storeUser.getState().setUser({ location: null });
            storeApp.setState({ status: $APP_STATUS["0_NAME"] });
            socket.emit("SOCKET_LOCATION", { location: null });
        }, { enableHighAccuracy: highAccuracy, maximumAge: 30000, timeout: 15000 });
    };
    startWatching(false);
};
// 위치 정보 권한 상태 감지
export const getLocation = async (user: User) => {
    const permissionStatus = await navigator.permissions.query({ name: "geolocation" });
    const changeGeo = () => {
        $POSITION.latitude = null;
        $POSITION.longitude = null;
        // geoLocation(set, user);
        geoLocation(user);
    };
    if (permissionStatus.state === "granted") changeGeo();
    // if (permissionStatus.state === "prompt") geoLocation(set, user); // 사용자 선택을 대기하고 허용 시 자동으로 위치 갱신
    if (permissionStatus.state === "prompt") geoLocation(user); // 사용자 선택을 대기하고 허용 시 자동으로 위치 갱신
    permissionStatus.onchange = () => {
        if (permissionStatus.state === "granted") changeGeo();
    };
};