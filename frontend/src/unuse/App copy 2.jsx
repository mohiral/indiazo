import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlane } from 'react-icons/fa';

const CrashGame = () => {
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashed, setCrashed] = useState(false);
  const [isCashOutActive, setIsCashOutActive] = useState(true);

  useEffect(() => {
    if (crashed) return;
    const interval = setInterval(() => {
      setMultiplier((prev) => (prev * 1.07).toFixed(2));
      if (Math.random() < 0.02) setCrashed(true);
    }, 100);
    return () => clearInterval(interval);
  }, [crashed]);

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
        {/* Multiplier Display */}
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className={`text-7xl font-bold ${crashed ? 'text-red-600' : 'text-white'}`}
        >
          {multiplier}x
        </motion.div>

        {/* Exponential Curve and Plane */}
        <motion.div className="relative w-full h-72 border-l-2 border-b-2 border-gray-500 mt-8">
          <motion.div
            className={`absolute bottom-0 left-0 w-8 h-8 text-red-500 ${crashed ? 'animate-pulse' : ''}`}
            animate={{ x: Math.min(multiplier * 25, 600), y: Math.max(-Math.pow(multiplier, 1.5), -400) }}
          >
            <FaPlane size={36} />
          </motion.div>
        </motion.div>

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
