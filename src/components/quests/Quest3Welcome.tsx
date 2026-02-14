
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface Quest3WelcomeProps {
  onComplete: () => void;
}

export function Quest3Welcome({ onComplete }: Quest3WelcomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-warm-neutral p-8 flex items-center justify-center text-center"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-10 border-4 border-brand-purple">
        <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
            <Sparkles className="w-12 h-12 text-brand-purple" />
        </motion.div>

        <h1 className="text-4xl font-bold text-brand-purple mb-6">
          Welcome to Number Positions!
        </h1>

        <div className="space-y-4 text-xl text-gray-700 mb-10">
          <p>
            In this quest, we will learn the special homes regarding numbers <span className="font-bold text-brand-teal">0</span>, <span className="font-bold text-brand-teal">1</span>, <span className="font-bold text-sunburst-yellow">5</span>, and <span className="font-bold text-sunburst-yellow">9</span> on your Junior Counter!
          </p>
          <p>
            Are you ready to become a positioning master?
          </p>
        </div>

        <Button
          onClick={onComplete}
          className="w-full max-w-sm mx-auto bg-brand-purple hover:bg-brand-purple/90 text-white text-xl py-6 rounded-xl shadow-xl flex items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95"
        >
          Let's Start! 
          <ArrowRight className="w-6 h-6" />
        </Button>
      </div>
    </motion.div>
  );
}
