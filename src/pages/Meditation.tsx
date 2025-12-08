import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

const DURATION_OPTIONS = {
  '10': 10 * 60,
  '15': 15 * 60,
  '20': 20 * 60,
};

const openingPrompts = [
  "Find a comfortable position and gently close your eyes",
  "Take a deep breath in... and slowly breathe out",
  "Let go of any tension in your body",
  "Notice the rhythm of your breath, flowing naturally",
  "Allow your thoughts to drift by like clouds in the sky",
  "Return to this moment, here and now"
];

export const Meditation = () => {
  const [selectedDuration, setSelectedDuration] = useState<'10' | '15' | '20'>('15');
  const [timeLeft, setTimeLeft] = useState(DURATION_OPTIONS['15']);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [showPrompts, setShowPrompts] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeLeft]);

  useEffect(() => {
    if (showPrompts && currentPromptIndex < openingPrompts.length - 1) {
      const timer = setTimeout(() => {
        setCurrentPromptIndex((prev) => prev + 1);
      }, 4000);
      return () => clearTimeout(timer);
    } else if (showPrompts && currentPromptIndex === openingPrompts.length - 1) {
      const timer = setTimeout(() => {
        setShowPrompts(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showPrompts, currentPromptIndex]);

  const handleStart = () => {
    setTimeLeft(DURATION_OPTIONS[selectedDuration]);
    setIsActive(true);
    setIsPaused(false);
    setShowPrompts(true);
    setCurrentPromptIndex(0);
  };

  const handleDurationChange = (duration: '10' | '15' | '20') => {
    if (!isActive) {
      setSelectedDuration(duration);
      setTimeLeft(DURATION_OPTIONS[duration]);
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(DURATION_OPTIONS[selectedDuration]);
    setShowPrompts(false);
    setCurrentPromptIndex(0);
  };

  const handleComplete = () => {
    setIsActive(false);
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 528;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1.5);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = DURATION_OPTIONS[selectedDuration];
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated aurora background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(99, 179, 237, 0.4) 0%, rgba(129, 140, 248, 0.2) 50%, transparent 70%)',
            top: '-10%',
            left: '-10%',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.4) 0%, rgba(236, 72, 153, 0.2) 50%, transparent 70%)',
            bottom: '-5%',
            right: '-5%',
            filter: 'blur(80px)',
          }}
          animate={{
            scale: [1.1, 1, 1.1],
            x: [0, -40, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(52, 211, 153, 0.3) 0%, rgba(99, 179, 237, 0.2) 50%, transparent 70%)',
            top: '40%',
            left: '50%',
            transform: 'translateX(-50%)',
            filter: 'blur(70px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Stars effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute"
            style={{
              left: `${15 + i * 10}%`,
              top: `${10 + (i % 4) * 20}%`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          >
            <Sparkles className="w-3 h-3 text-white/40" />
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-light text-white/90 tracking-widest uppercase mb-2">
            Meditation
          </h1>
          <div className="w-16 h-0.5 mx-auto bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </motion.div>

        {/* Opening prompts */}
        <div className="h-16 mb-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {showPrompts && (
              <motion.p
                key={currentPromptIndex}
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.8 }}
                className="text-xl md:text-2xl text-white/70 text-center font-light italic max-w-lg"
              >
                "{openingPrompts[currentPromptIndex]}"
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Timer circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl scale-110" />
          
          {/* Progress ring */}
          <div className="relative w-72 h-72 md:w-80 md:h-80">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              {/* Progress circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="50%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#f472b6" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Glassmorphism inner circle */}
              <div className="w-56 h-56 md:w-64 md:h-64 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center shadow-2xl">
                {/* Timer display */}
                <motion.div
                  key={timeLeft}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="text-5xl md:text-6xl font-extralight text-white tracking-wider tabular-nums"
                >
                  {formatTime(timeLeft)}
                </motion.div>
                
                {/* Duration label */}
                <p className="text-white/40 text-sm mt-2 tracking-widest uppercase">
                  {selectedDuration} minutes
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Duration selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 mb-8"
        >
          {!isActive && (
            <div className="flex gap-2 p-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              {(['10', '15', '20'] as const).map((duration) => (
                <button
                  key={duration}
                  onClick={() => handleDurationChange(duration)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedDuration === duration
                      ? 'bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white shadow-lg shadow-purple-500/20'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  {duration} min
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center gap-6"
        >
          {!isActive ? (
            <motion.button
              onClick={handleStart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative w-20 h-20 rounded-full flex items-center justify-center"
            >
              {/* Button glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative z-10">
                <Play className="h-8 w-8 text-white ml-1" fill="white" />
              </div>
            </motion.button>
          ) : (
            <>
              <motion.button
                onClick={handleReset}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
              >
                <RotateCcw className="h-5 w-5" />
              </motion.button>
              <motion.button
                onClick={handlePause}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative w-20 h-20 rounded-full flex items-center justify-center"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
                <div className="relative z-10">
                  {isPaused ? (
                    <Play className="h-8 w-8 text-white ml-1" fill="white" />
                  ) : (
                    <Pause className="h-8 w-8 text-white" fill="white" />
                  )}
                </div>
              </motion.button>
            </>
          )}
        </motion.div>

        {/* Breathing indicator when active */}
        <AnimatePresence>
          {isActive && !isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-12 text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-white/40 text-sm tracking-[0.3em] uppercase"
              >
                Breathe
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion overlay */}
        <AnimatePresence>
          {timeLeft === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-slate-900/95 backdrop-blur-xl z-20"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center px-6"
              >
                {/* Celebration particles */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"
                      style={{
                        left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 6)}%`,
                        top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 6)}%`,
                      }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </motion.div>
                
                <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-6" />
                <h2 className="text-4xl font-light text-white mb-4 tracking-wide">
                  Session Complete
                </h2>
                <p className="text-lg text-white/50 mb-10 max-w-sm mx-auto">
                  Take a moment to notice how you feel. Carry this peace with you.
                </p>
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
                >
                  Begin Again
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
