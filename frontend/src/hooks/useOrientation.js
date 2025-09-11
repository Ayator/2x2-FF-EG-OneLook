import { useEffect, useState } from "react";

export function useOrientation() {
    const getOrientation = () =>
        window.innerWidth > window.innerHeight ? "landscape" : "portrait";
    const [orientation, setOrientation] = useState(getOrientation());
    useEffect(() => {
        function handleResize() {
            setOrientation(getOrientation());
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return orientation;
}
