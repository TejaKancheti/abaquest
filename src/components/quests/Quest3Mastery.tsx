
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle, Eye, MousePointerClick } from 'lucide-react';
import { Button } from '../ui/button';
import { InteractiveAbacus } from '../InteractiveAbacus';
import { useAbacusSound } from '../../hooks/useAbacusSound';
import { useDataLogger } from '../DataLogger';

interface Quest3MasteryProps {
    onComplete: () => void;
}

const MASTERY_STEPS = [0, 1, 5, 9];

export function Quest3Mastery({ onComplete }: Quest3MasteryProps) {
    const [stepIndex, setStepIndex] = useState(0);
    const [phase, setPhase] = useState<'demo' | 'practice'>('demo');
    const [headerText, setHeaderText] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    // For demo animation
    const [demoValue, setDemoValue] = useState(0);

    const { logInteraction } = useDataLogger();
    const { playSuccess, playClick } = useAbacusSound();

    const currentNumber = MASTERY_STEPS[stepIndex];

    // Effect for Demo Phase Animation
    useEffect(() => {
        if (phase === 'demo') {
            setDemoValue(0);
            setHeaderText(`Watch closely: Positioning to ${currentNumber}`);

            // Animate to target
            const timer = setTimeout(() => {
                setDemoValue(currentNumber);
                playClick();
                setHeaderText(`This is the position for number ${currentNumber}`);
            }, 1500);

            return () => clearTimeout(timer);
        } else {
            setHeaderText(`Your turn: Position to ${currentNumber}`);
        }
    }, [phase, currentNumber, stepIndex]);

    const handlePracticeChange = (val: number) => {
        if (val === currentNumber) {
            handleSuccess(val);
        }
    };

    const handleSuccess = (val: number) => {
        logInteraction({
            quest_id: 3,
            scene_id: `mastery_${currentNumber}`,
            number: currentNumber,
            correct_flag: true,
            interaction_type: 'practice',
            student_response: val.toString(),
        });

        playSuccess();
        setFeedback('correct');

        setTimeout(() => {
            setFeedback(null);
            completeStep();
        }, 1500);
    };

    const completeStep = () => {
        if (stepIndex < MASTERY_STEPS.length - 1) {
            setStepIndex(prev => prev + 1);
            setPhase('demo');
        } else {
            onComplete();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-warm-neutral p-6"
        >
            <div className="max-w-4xl mx-auto">
                {/* Header Card */}
                <div className={`rounded-xl p-6 mb-6 shadow-lg text-white transition-colors duration-500 ${phase === 'demo'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                        : 'bg-gradient-to-r from-orange-500 to-amber-400'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {phase === 'demo' ? <Eye className="w-8 h-8" /> : <MousePointerClick className="w-8 h-8" />}
                            <h2 className="text-2xl font-bold">{headerText}</h2>
                        </div>
                        <div className="text-xl font-mono opacity-80">
                            {stepIndex + 1} / {MASTERY_STEPS.length}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl shadow-2xl p-10 border-4 border-gray-100 flex flex-col items-center min-h-[500px] justify-center relative">

                    {/* Character / Instruction */}
                    <div className="absolute top-6 left-6 flex items-start gap-4 max-w-xs">
                        <div className="text-4xl">🤖</div>
                        <div className="bg-gray-100 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl text-gray-700 text-sm">
                            {phase === 'demo'
                                ? "Watch how the beads move. I'll show you first!"
                                : "Now you try! Move the beads to match what I showed you."}
                        </div>
                    </div>

                    {/* Abacus */}
                    <div className="transform scale-125 mb-8">
                        {/* 
                           For demo: We control the value via props. 
                           For practice: User controls value.
                           We need to update InteractiveAbacus to support controlled 'value' prop better or key-reset it. 
                           Using 'key' forces re-render which is fine for switching modes.
                        */}
                        {phase === 'demo' ? (
                            <div className="pointer-events-none opacity-90 grayscale-0 transition-all duration-500">
                                {/* We need a controlled version of InteractiveAbacus or just pass initialValue + reset */}
                                <InteractiveAbacus
                                    key={`demo-${stepIndex}-${demoValue}`} // Force re-render on value change for simple animation
                                    initialValue={demoValue}
                                    interactive={false}
                                />
                            </div>
                        ) : (
                            <InteractiveAbacus
                                key={`practice-${stepIndex}`}
                                initialValue={0}
                                onChange={handlePracticeChange}
                                interactive={true}
                            />
                        )}
                    </div>

                    {/* Demo Continue Button */}
                    {phase === 'demo' && demoValue === currentNumber && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Button
                                onClick={() => setPhase('practice')}
                                className="bg-green-500 hover:bg-green-600 text-white text-xl px-8 py-4 rounded-full shadow-lg flex items-center gap-2"
                            >
                                I'm Ready to Try! <ArrowRight />
                            </Button>
                        </motion.div>
                    )}

                    {/* Feedback Overlay */}
                    <AnimatePresence>
                        {feedback === 'correct' && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-50"
                            >
                                <div className="text-center">
                                    <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-3xl font-bold text-green-600">Perfect Position!</h3>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
