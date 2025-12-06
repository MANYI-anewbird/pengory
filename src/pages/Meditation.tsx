import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const DURATION_OPTIONS = {
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
  const [selectedDuration, setSelectedDuration] = useState<'15' | '20'>('20');
  const [timeLeft, setTimeLeft] = useState(DURATION_OPTIONS['20']);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [showPrompts, setShowPrompts] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);

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

  const handleDurationChange = (duration: '15' | '20') => {
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
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Soft animated floating orbs - warm cream tones */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-amber-100/40 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '5%', left: '0%' }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-orange-50/30 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '40%', right: '-5%' }}
        />
        <motion.div
          className="absolute w-72 h-72 rounded-full bg-yellow-50/40 blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: '5%', left: '20%' }}
        />
      </div>

      {/* Floating small dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-amber-200/60"
            style={{
              left: `${20 + i * 15}%`,
              top: `${25 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -12, 0],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
        {/* Opening prompts */}
        <div className="absolute top-16 left-0 right-0 text-center px-8">
          <AnimatePresence mode="wait">
            {showPrompts && (
              <motion.p
                key={currentPromptIndex}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.6 }}
                className="text-2xl font-handwritten text-foreground"
              >
                {openingPrompts[currentPromptIndex]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Timer card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/90 backdrop-blur-sm rounded-2xl p-10 shadow-lg border border-border"
        >
          {/* Duration selector */}
          {!isActive && (
            <div className="mb-8 flex gap-3 justify-center">
              <button
                onClick={() => handleDurationChange('15')}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedDuration === '15'
                    ? 'bg-slate-800 text-white'
                    : 'bg-secondary text-muted-foreground hover:bg-muted'
                }`}
              >
                15 min
              </button>
              <button
                onClick={() => handleDurationChange('20')}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedDuration === '20'
                    ? 'bg-slate-800 text-white'
                    : 'bg-secondary text-muted-foreground hover:bg-muted'
                }`}
              >
                20 min
              </button>
            </div>
          )}

          {/* Timer */}
          <div className="text-7xl font-light text-foreground text-center font-mono mb-8 tracking-wider">
            {formatTime(timeLeft)}
          </div>

          {/* Progress bar */}
          <div className="w-72 mx-auto mb-8">
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-slate-700 rounded-full"
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-5">
            {!isActive ? (
              <motion.button
                onClick={handleStart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center shadow-md"
              >
                <Play className="h-7 w-7 ml-0.5" />
              </motion.button>
            ) : (
              <>
                <motion.button
                  onClick={handlePause}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-full bg-card border border-border text-foreground flex items-center justify-center shadow-sm hover:bg-muted"
                >
                  {isPaused ? <Play className="h-5 w-5 ml-0.5" /> : <Pause className="h-5 w-5" />}
                </motion.button>
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-full bg-card border border-border text-foreground flex items-center justify-center shadow-sm hover:bg-muted"
                >
                  <RotateCcw className="h-5 w-5" />
                </motion.button>
              </>
            )}
          </div>

          {/* Volume */}
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 rounded-full hover:bg-muted">
              {isMuted ? <VolumeX className="h-4 w-4 text-muted-foreground" /> : <Volume2 className="h-4 w-4 text-muted-foreground" />}
            </button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={(value) => {
                setVolume(value[0] / 100);
                if (value[0] > 0) setIsMuted(false);
              }}
              max={100}
              step={1}
              className="w-24"
            />
          </div>
        </motion.div>

        {/* Completion */}
        <AnimatePresence>
          {timeLeft === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm z-20"
            >
              <div className="text-center">
                <h2 className="text-3xl font-handwritten text-foreground mb-3">Meditation Complete</h2>
                <p className="text-lg font-handwritten text-muted-foreground mb-6">Take a moment to notice how you feel.</p>
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-medium shadow-md"
                >
                  Start Again
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
