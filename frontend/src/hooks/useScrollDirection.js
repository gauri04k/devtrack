import { useEffect, useState } from "react";

const useScrollDirection = () => {
    const [scrollDirection, setScrollDirection] = useState("top");

    useEffect(() => {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateScrollDirection = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY <= 10) {
                setScrollDirection("top");
                lastScrollY = currentScrollY;
                ticking = false;
                return;
            }

            if (Math.abs(currentScrollY - lastScrollY) < 5) {
                ticking = false;
                return;
            }

            if (currentScrollY > lastScrollY) {
                setScrollDirection("down");
            } else {
                setScrollDirection("up");
            }

            lastScrollY = currentScrollY;
            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollDirection);
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll, {
            passive: true,
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return scrollDirection;
};

export default useScrollDirection;