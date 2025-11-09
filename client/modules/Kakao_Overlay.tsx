import type { User } from "types"

export const Kakao_Overlay: React.FC<{ users: User[] }> = ({ users })=>{
    return(<div className="kakao_overlay fs_13 fwb">
        {users.map(u => u.name).join(', ')}
    </div>)
}