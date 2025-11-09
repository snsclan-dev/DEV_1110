import Link from "next/link"

export default function Notfound(){

    return(
        <div>
            찾을 수 없는 페이지 입니다.
            <Link href='/'>메인 페이지로 </Link>
        </div>
    )
}