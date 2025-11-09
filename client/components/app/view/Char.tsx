type Char = { char?: string; color?: string; style?: string }

export const Char = ({ char, color = 'c_lgray', style = '' }: Char) => {
    if (char === "vl") return <span className={`vl ${color} ${style}`}>&#x2502;</span>;
    if (char === "sl") return <span className={`sl ${color} ${style}`}>/</span>; // chat
    if (char === "like") return <span className={`like mg_r ${color}`}>♥</span>;
    return <span className="c_red">&#x2716;</span>;
};