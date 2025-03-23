import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlane } from 'react-icons/fa';

const CrashGame = () => {
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashed, setCrashed] = useState(false);
  const [isCashOutActive, setIsCashOutActive] = useState(true);
  const [customCrashValue, setCustomCrashValue] = useState(200.0);

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
        <div className="relative w-full h-72 mt-8">
          {/* Corner Labels */}
          <div className="absolute bottom-0 left-0 text-white">A</div>
          <div className="absolute bottom-0 right-0 text-white">B</div>
          <div className="absolute top-0 right-0 text-white">C</div>
          <div className="absolute top-0 left-0 text-white">D</div>

          {/* Plane Movement */}
          <motion.div
            className={`absolute w-8 h-8 text-red-500 ${crashed ? 'animate-pulse' : ''}`}
            initial={{ x: 0, y: 288 }} // Start at corner A (bottom-left)
            animate={{ 
              x: crashed ? 600 : [0, 600], // Move from left to right
              y: crashed ? 0 : [288, 0], // Move from bottom to top
            }}
            transition={{
              duration: 3,
              ease: "linear",
              repeat: 0 // No repeat - stays at corner C
            }}
          >
            <FaPlane size={36} style={{ transform: 'rotate(-45deg)' }} />
          </motion.div>
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
