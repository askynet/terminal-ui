import React, { useState, useEffect } from "react";

const DesktopOnlyOverlay = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (!isMobile) return null;

    return (
        <div className="desk-overlay">
            <div className="desk-modal">
                <i className="pi pi-exclamation-triangle mb-3" style={{ fontSize: '4rem', color: 'red'}}></i>
                <p className="text-2xl">Please use a desktop for the best experience.</p>
            </div>
        </div>
    );
};

export default DesktopOnlyOverlay;
