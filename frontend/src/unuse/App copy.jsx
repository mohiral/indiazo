import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CrashGame = () => {
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashed, setCrashed] = useState(false);
  const [isCashOutActive, setIsCashOutActive] = useState(true);

  useEffect(() => {
    if (crashed) return;
    const interval = setInterval(() => {
      setMultiplier((prev) => (prev * 1.05).toFixed(2));
      if (Math.random() < 0.01) setCrashed(true);
    }, 100);
    return () => clearInterval(interval);
  }, [crashed]);

  const handleCashOut = () => {
    setIsCashOutActive(false);
    setCrashed(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-blue-900 flex flex-col items-center justify-center text-white p-4">
      {/* Navigation Bar */}
      <div className="w-full max-w-3xl bg-yellow-500 text-black text-center p-2 rounded-t-lg font-bold text-lg">
        FUN MODE
      </div>

      {/* Graph */}
      <div className="w-full max-w-3xl bg-gray-800 p-4 rounded-b-lg flex flex-col items-center relative overflow-hidden">
        {/* Multiplier Display */}
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className={`text-5xl font-bold ${crashed ? 'text-red-600' : 'text-white'}`}
        >
          {multiplier}x
        </motion.div>

        {/* Exponential Curve */}
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: crashed ? 0.5 : 1 }}
          transition={{ duration: 2 }}
          className={`w-full h-64 border-l-2 border-b-2 border-gray-400 relative`}
        >
          <motion.div
            className={`absolute bottom-0 left-0 w-8 h-8 bg-red-500 rounded-full ${crashed ? 'animate-pulse' : ''}`}
            animate={{ x: multiplier * 20, y: -Math.pow(multiplier, 1.5) }}
          />
        </motion.div>

        {/* Crash Effect */}
        {crashed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-red-900 opacity-50"
          />
        )}
      </div>

      {/* Cash Out Button */}
      <button
        onClick={handleCashOut}
        disabled={!isCashOutActive}
        className={`mt-4 px-6 py-3 rounded-lg text-xl font-bold transition-all ${isCashOutActive ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 cursor-not-allowed'}`}
      >
        {isCashOutActive ? 'Cash Out' : 'Cashed Out'}
      </button>
    </div>
  );
};

export default CrashGame;
