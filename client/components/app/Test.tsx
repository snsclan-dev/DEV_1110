// TransitionContainer.tsx
import { ReactNode, useState } from "react";
import "./transition.css";

export default function TransitionContainer({ children }: { children: ReactNode[] }) {
    const [index, setIndex] = useState(0);

    const next = () => {
        if (index < children.length - 1) {
            setIndex((i) => i + 1);
        }
    };

    const prev = () => {
        if (index > 0) {
            setIndex((i) => i - 1);
        }
    };

    return (<>
        <div className="transition-wrapper">
            {children.map((child, i) => (
                <div key={i} className={`transition-page ${i === index ? "active" : ""}`}>
                    {child}
                </div>
            ))}

        </div>
        <div className="mg_t5">
            <button onClick={prev} disabled={index === 0}>
                이전
            </button>
            <button onClick={next} disabled={index === children.length - 1}>
                다음
            </button>
        </div>
        </>
    );
}
