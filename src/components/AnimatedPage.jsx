// src/components/AnimatedPage.jsx
import { useEffect, useState } from "react";

const AnimatedPage = ({ children }) => {
    const [shouldRender, setShouldRender] = useState(false);
    const [fadeClass, setFadeClass] = useState("");

    useEffect(() => {
        setShouldRender(true);
        setFadeClass("animate-fade-in");

        return () => {
            setFadeClass("animate-fade-out");
        };
    }, []);

    return (
        <div className={`transition-opacity duration-500 ${fadeClass}`}>
            {shouldRender && children}
        </div>
    );
};

export default AnimatedPage;
