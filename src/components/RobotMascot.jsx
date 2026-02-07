import { useRef, useEffect } from 'react';

const RobotMascot = () => {
    const mascotHeadRef = useRef(null);
    const eyeLeftRef = useRef(null);
    const eyeRightRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!mascotHeadRef.current || !eyeLeftRef.current || !eyeRightRef.current) return;

            // Get the actual position of the robot head
            const rect = mascotHeadRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const x = e.clientX;
            const y = e.clientY;

            const deltaX = (x - centerX) / 30;
            const deltaY = (y - centerY) / 30;

            // Head rotation with limits
            const rotX = Math.min(Math.max(-deltaY, -15), 15);
            const rotY = Math.min(Math.max(deltaX, -25), 25);
            mascotHeadRef.current.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(30px)`;

            // Eye movement
            const eyeX = Math.min(Math.max(deltaX / 1.5, -10), 10);
            const eyeY = Math.min(Math.max(deltaY / 1.5, -10), 10);
            eyeLeftRef.current.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
            eyeRightRef.current.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
        };

        const handleMouseLeave = () => {
            if (!mascotHeadRef.current || !eyeLeftRef.current || !eyeRightRef.current) return;

            mascotHeadRef.current.style.transform = `rotateX(0deg) rotateY(0deg) translateZ(0px)`;
            eyeLeftRef.current.style.transform = `translate(0px, 0px)`;
            eyeRightRef.current.style.transform = `translate(0px, 0px)`;
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div className="character-container relative mb-12 flex flex-col items-center">
            <style>{`
                .bemo-bot {
                    transform-style: preserve-3d;
                    transition: transform 0.1s ease-out;
                    perspective: 1000px;
                }
                .robot-body-textured {
                    background: linear-gradient(145deg, #ffffff 0%, #cbd5e1 100%);
                    box-shadow: 
                        inset -5px -5px 15px rgba(0,0,0,0.1),
                        inset 5px 5px 15px rgba(59, 130, 246, 0.2),
                        0 10px 40px rgba(0,0,0,0.3);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    transform-style: preserve-3d;
                }
                .robot-face-glow {
                    background: #0f172a;
                    box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.3);
                    border: 2px solid rgba(59, 130, 246, 0.2);
                }
                .robot-eye-glow {
                    background: #60a5fa;
                    box-shadow: 0 0 20px #3b82f6, 0 0 40px rgba(59, 130, 246, 0.4), inset 0 0 5px #fff;
                }
            `}</style>

            <div className="bemo-bot relative w-72 h-80 flex flex-col items-center">
                {/* Robot Head */}
                <div
                    ref={mascotHeadRef}
                    className="robot-body-textured w-64 h-56 rounded-[3.5rem] relative z-20 flex items-center justify-center transition-transform duration-75"
                >
                    {/* Face Screen */}
                    <div className="robot-face-glow w-48 h-36 rounded-[2.5rem] flex items-center justify-center gap-8 relative overflow-hidden">
                        {/* Eyes */}
                        <div className="flex gap-10">
                            <div
                                ref={eyeLeftRef}
                                className="robot-eye-glow w-10 h-12 rounded-full transition-transform duration-75"
                            ></div>
                            <div
                                ref={eyeRightRef}
                                className="robot-eye-glow w-10 h-12 rounded-full transition-transform duration-75"
                            ></div>
                        </div>
                        {/* Scan line effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400/10 to-transparent h-1/3 w-full animate-pulse"></div>
                    </div>

                    {/* Antenna */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-16">
                        <div className="w-3 h-8 bg-slate-300 rounded-full border-b-4 border-blue-400"></div>
                        <div className="w-3 h-8 bg-slate-300 rounded-full border-b-4 border-blue-400"></div>
                    </div>
                </div>

                {/* Shadow/Glow */}
                <div className="mt-8 w-40 h-6 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
            </div>
        </div>
    );
};

export default RobotMascot;
