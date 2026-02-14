import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { useDataLogger } from '../DataLogger';


interface Quest3PreTestProps {
    onComplete: (score: number) => void;
    isPostTest?: boolean;
}

export function Quest3PreTest({ onComplete, isPostTest = false }: Quest3PreTestProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | 'skip' | null>(null);
    const [startTime, setStartTime] = useState(Date.now());
    const [correctCount, setCorrectCount] = useState(0);
    const { logInteraction } = useDataLogger();

    const testQuestions = [
        { number: 0, correctPosition: 'top', display: 'Zero' },
        { number: 1, correctPosition: 'middle-lower', display: 'One' },
        { number: 5, correctPosition: 'middle-upper', display: 'Five' },
        { number: 9, correctPosition: 'bottom', display: 'Nine' },
    ];

    useEffect(() => {
        setStartTime(Date.now());
    }, [currentQuestion]);

    const handleAnswer = (answer: string, isSkip: boolean = false) => {
        const currentQ = testQuestions[currentQuestion];
        const isCorrect = !isSkip && answer === currentQ.correctPosition;
        const timeSpent = Date.now() - startTime;

        if (isCorrect) {
            setCorrectCount(prev => prev + 1);
        }

        logInteraction({
            quest_id: 3,
            scene_id: `${isPostTest ? 'posttest' : 'pretest'}_question_${currentQuestion + 1}`,
            number: currentQ.number,
            correct_flag: isSkip ? null : isCorrect,
            time_ms: timeSpent,
            interaction_type: isPostTest ? 'post_test' : 'pre_test',
            student_response: isSkip ? 'I_dont_know_yet' : answer,
        });

        setShowFeedback(isSkip ? 'skip' : (isCorrect ? 'correct' : 'wrong'));

        setTimeout(() => {
            if (currentQuestion < testQuestions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setShowFeedback(null);
            } else {
                // Calculate percentage score
                const finalScore = isCorrect ? ((correctCount + 1) / testQuestions.length) * 100 : (correctCount / testQuestions.length) * 100;
                // Note: state update for correctCount might not be reflected immediately if we use correctCount directly here,
                // so we use the conditional logic or functional update if we were staying in component.
                // Safest to just calculate based on current result.

                onComplete(Math.round(finalScore));
            }
        }, 1500);
    };

    const renderAbacusPosition = (position: string, isHighlighted: boolean = false) => {
        return (
            <div className="flex flex-col items-center gap-1">
                <div
                    className={`w-10 h-10 rounded-full transition-all shadow-lg ${position === 'top' && isHighlighted
                        ? 'bg-sunburst-yellow ring-4 ring-aqua-blue scale-110'
                        : position === 'top'
                            ? 'bg-sunburst-yellow'
                            : 'bg-gray-300'
                        }`}
                ></div>
                <div className="w-1 h-6 bg-gray-700 rounded"></div>
                <div className="flex flex-col gap-1">
                    {[0, 1].map((i) => (
                        <div
                            key={`upper-${i}`}
                            className={`w-8 h-8 rounded-full transition-all shadow-lg ${position === 'middle-upper' && isHighlighted
                                ? 'bg-sunburst-yellow ring-4 ring-aqua-blue scale-110'
                                : position === 'middle-upper'
                                    ? 'bg-sunburst-yellow'
                                    : 'bg-gray-400'
                                }`}
                        ></div>
                    ))}
                </div>
                <div className="w-1 h-4 bg-gray-700 rounded"></div>
                <div className="flex flex-col gap-1">
                    {[0, 1].map((i) => (
                        <div
                            key={`lower-${i}`}
                            className={`w-8 h-8 rounded-full transition-all shadow-lg ${position === 'middle-lower' && isHighlighted
                                ? 'bg-sunburst-yellow ring-4 ring-aqua-blue scale-110'
                                : position === 'middle-lower'
                                    ? 'bg-sunburst-yellow'
                                    : 'bg-gray-400'
                                }`}
                        ></div>
                    ))}
                </div>
                <div className="w-1 h-6 bg-gray-700 rounded"></div>
                <div
                    className={`w-10 h-10 rounded-full transition-all shadow-lg ${position === 'bottom' && isHighlighted
                        ? 'bg-abacus-red ring-4 ring-aqua-blue scale-110'
                        : position === 'bottom'
                            ? 'bg-abacus-red'
                            : 'bg-gray-300'
                        }`}
                ></div>
            </div>
        );
    };

    const currentQ = testQuestions[currentQuestion];

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="min-h-screen bg-warm-neutral p-8"
        >
            <div className="max-w-4xl mx-auto">
                <div className="bg-deep-blue text-white rounded-2xl p-4 mb-4 shadow-xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm opacity-80 mb-1">
                                {isPostTest ? '📝 Post-Test' : '📋 Pre-Test'}
                            </p>
                            <p className="text-xl">
                                Show me: <span className="text-3xl text-sunburst-yellow ml-2">{currentQ.display}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm">Question {currentQuestion + 1} of {testQuestions.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-aqua-blue">
                    <div className="flex items-center gap-2 mb-6 bg-aqua-blue/10 rounded-xl p-3">
                        <div className="text-2xl">🐝</div>
                        <p className="text-deep-blue">
                            {isPostTest
                                ? "Let's see what you've learned! Click the counter that shows this number."
                                : "No worries if you're not sure yet! Just try your best or skip."}
                        </p>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {['top', 'middle-upper', 'middle-lower', 'bottom'].map((position) => (
                            <motion.button
                                key={position}
                                onClick={() => handleAnswer(position)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gray-50 rounded-xl p-4 border-3 border-gray-200 hover:border-sunburst-yellow transition-all shadow-md"
                            >
                                {renderAbacusPosition(position)}
                            </motion.button>
                        ))}
                    </div>

                    {!isPostTest && (
                        <Button
                            onClick={() => handleAnswer('', true)}
                            variant="outline"
                            className="w-full border-2 border-deep-blue/30 text-deep-blue hover:bg-deep-blue/5 py-4 rounded-xl"
                        >
                            <HelpCircle className="w-5 h-5 mr-2" />
                            I don't know yet
                        </Button>
                    )}

                    <AnimatePresence>
                        {showFeedback && (
                            <motion.div
                                initial={{ scale: 0, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0, y: 20 }}
                                className={`mt-6 p-4 rounded-xl flex items-center justify-center gap-3 ${showFeedback === 'correct'
                                    ? 'bg-green-100 border-3 border-green-500'
                                    : showFeedback === 'skip'
                                        ? 'bg-blue-100 border-3 border-blue-400'
                                        : 'bg-orange-100 border-3 border-orange-400'
                                    }`}
                            >
                                {showFeedback === 'correct' ? (
                                    <>
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                        <span className="text-xl text-green-700">Great job! 🎉</span>
                                    </>
                                ) : showFeedback === 'skip' ? (
                                    <>
                                        <HelpCircle className="w-8 h-8 text-blue-600" />
                                        <span className="text-xl text-blue-700">Thanks for trying! Let's learn together! 📚</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-8 h-8 text-orange-600" />
                                        <span className="text-xl text-orange-700">Keep learning—you'll get it! 💪</span>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
