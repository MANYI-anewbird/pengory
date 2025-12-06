import { motion } from 'framer-motion';
import antarcticBg from '@/assets/antarctic-bg-hd.png';

export const Home = () => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Full-screen background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${antarcticBg})` }}
      />
      
      {/* Soft gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/40" />
      
      {/* Floating snowflakes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              filter: 'blur(0.5px)',
              boxShadow: '0 0 4px rgba(255,255,255,0.8)',
            }}
            initial={{ y: -20, opacity: 0 }}
            animate={{
              y: ['0vh', '100vh'],
              opacity: [0, 0.9, 0.9, 0],
              x: [0, Math.sin(i) * 40, Math.cos(i) * 30, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-8">
        {/* Central message card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center"
        >
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="text-6xl md:text-7xl lg:text-8xl font-handwritten font-bold text-sky-700 mb-6 drop-shadow-lg"
            style={{
              textShadow: '0 4px 20px rgba(255,255,255,0.8), 0 2px 10px rgba(14,116,144,0.2)',
            }}
          >
            Every single day counts
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-xl md:text-2xl font-handwritten text-sky-600/80 tracking-wide"
            style={{
              textShadow: '0 2px 10px rgba(255,255,255,0.9)',
            }}
          >
            Find peace in simplicity • Breathe • Let go
          </motion.p>
        </motion.div>

        {/* Subtle breathing circle animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-20"
        >
          <motion.div
            className="w-16 h-16 rounded-full border-2 border-white/40 backdrop-blur-sm"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};
