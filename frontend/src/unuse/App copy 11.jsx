import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Rocket from './assets/Rocket.gif'

const CrashGame = () => {
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashed, setCrashed] = useState(false);
  const [isCashOutActive, setIsCashOutActive] = useState(true);
  const [customCrashValue, setCustomCrashValue] = useState(200.0);
  const [pathLength, setPathLength] = useState(0);
  const [dotPosition, setDotPosition] = useState(0);
  const [rocketAtCorner, setRocketAtCorner] = useState(false);

  useEffect(() => {
    if (crashed) return;
    const interval = setInterval(() => {
      setMultiplier((prev) => {
        const newValue = (prev * 1.07).toFixed(2);
        if (parseFloat(newValue) >= customCrashValue) {
          setCrashed(true);
          return prev;
        }
        return newValue;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [crashed, customCrashValue]);

  // Effect for moving dots after rocket reaches corner - now slower
  useEffect(() => {
    if (!rocketAtCorner || crashed) return;
    const moveInterval = setInterval(() => {
      setDotPosition(prev => (prev + 2) % 40); // Reduced from 4 to 2 for slower movement
    }, 150); // Increased from 100 to 150ms for slower updates
    return () => clearInterval(moveInterval);
  }, [rocketAtCorner, crashed]);

  const handleCashOut = () => {
    setIsCashOutActive(false);
    setCrashed(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-blue-900 flex flex-col items-center justify-center text-white p-4 relative">
      {/* Navigation Bar */}
      <div className="w-full max-w-3xl bg-yellow-500 text-black text-center p-2 rounded-t-lg font-bold text-lg">
        FUN MODE
      </div>

      {/* Graph Container */}
      <div className="w-full max-w-3xl bg-gray-900 p-4 rounded-b-lg flex flex-col items-center relative border border-gray-700 overflow-hidden max-h-[500px]">
        {/* Custom Crash Value Input */}
        <div className="absolute top-2 right-4 z-10">
          <input
            type="number"
            value={customCrashValue}
            onChange={(e) => setCustomCrashValue(Math.max(1.0, parseFloat(e.target.value) || 1.0))}
            className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-600"
            placeholder="Crash at..."
            min="1.0"
            step="0.1"
          />
        </div>

        {/* Multiplier Display */}
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className={`text-7xl font-bold ${crashed ? 'text-red-600' : 'text-white'}`}
        >
          {multiplier}x
        </motion.div>

        {/* Game Area with Corners A, B, C, D */}
        {/* Game Area with 90-degree corner lines */}
        <div className="relative w-full max-w-3xl h-72 mt-8">
          {/* Corner Labels */}
          <div className="absolute bottom-0 left-0 text-white">A</div>
          <div className="absolute bottom-0 right-0 text-white">B</div>
          <div className="absolute top-0 right-0 text-white">C</div>
          <div className="absolute top-0 left-0 text-white">D</div>

          {/* Red background below curved line */}
          <svg className="absolute w-full h-full" style={{ zIndex: 0 }}>
            <motion.path
              d="M 0 270 Q 300 190 600 0 L 600 270 L 120 270 Z"
              fill="rgba(255, 69, 0, 0.5)"
              initial={{ scale: 0, originX: 0, originY: 1 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 3.5,
                ease: "linear"
              }}
            />
          </svg>


          {/* 90-degree corner lines */}
          <svg className="absolute w-full h-full" style={{ zIndex: 1 }}>
            {/* Curved path */}
            <motion.path
              d="M 0 270 Q 300 190 600 0"
              stroke="rgba(255,255,255,1)"
              strokeWidth="3"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 3.5,
                ease: "linear"
              }}
            />

            {/* Vertical line with moving dots */}
            <path
              d={`M 0 0 L 0 270`}
              stroke={rocketAtCorner ? "rgba(255,165,0,1)" : "rgba(255,255,255,1)"}
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${dotPosition},4,4,4,4,4,4,4,4,4`}
              style={{
                strokeDashoffset: -dotPosition
              }}
            />

            {/* Horizontal line with moving dots */}
            <path
              d={`M 0 270 L 840 270`}
              stroke={rocketAtCorner ? "rgba(255,165,0,1)" : "rgba(255,255,255,1)"}
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${dotPosition},4,4,4,4,4,4,4,4,4`}
              style={{
                strokeDashoffset: -dotPosition
              }}
            />
          </svg>

          {/* Plane moving along the curve */}
          {/* Rocket moving along the road */}
          <motion.div
            className="absolute w-32 h-32"
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            transition={{
              duration: 3.5,
              ease: "linear"
            }}
            style={{
              offsetPath: "path('M 0 270 Q 300 190 600 0')",
              offsetRotate: "auto"
            }}
            onAnimationComplete={() => {
              setRocketAtCorner(true); // Trigger road animation when rocket reaches end
            }}
          >
            <img
              src={Rocket}
              alt="Rocket"
              className="w-full h-full object-contain"
              style={{ transform: 'rotate(45deg)' }}
            />
          </motion.div>

          {/* Road Animation */}
          {rocketAtCorner && (
            <motion.div
              className="absolute inset-0"
              initial={{ x: 0 }}
              animate={{ x: ["0%", "-100%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            >
            </motion.div>
          )}

        </div>


        {/* Crash Effect */}
        {crashed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-red-800 opacity-40 flex items-center justify-center"
          >
            <motion.div className="w-28 h-28 bg-red-600 rounded-full opacity-75" animate={{ scale: [1, 1.7, 1], opacity: [1, 0.5, 0] }} />
          </motion.div>
        )}
      </div>

      {/* Cash Out Button */}
      <button
        onClick={handleCashOut}
        disabled={!isCashOutActive}
        className={`mt-6 px-8 py-4 rounded-lg text-2xl font-bold transition-all ${isCashOutActive ? 'bg-green-500 hover:bg-green-600 animate-pulse' : 'bg-gray-500 cursor-not-allowed'}`}
      >
        {isCashOutActive ? 'Cash Out' : 'Cashed Out'}
      </button>
    </div>
  );
};

export default CrashGame;
