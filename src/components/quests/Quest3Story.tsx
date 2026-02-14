
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useDataLogger } from '../DataLogger';
import { useAbacusSound } from '../../hooks/useAbacusSound';
import { Button } from '../ui/button';
import { InteractiveAbacus } from '../InteractiveAbacus';

interface Quest3StoryProps {
    onComplete: () => void;
}

export function Quest3Story({ onComplete }: Quest3StoryProps) {
    const [sceneIndex, setSceneIndex] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [startTime, setStartTime] = useState(Date.now());

    const { logInteraction } = useDataLogger();
    const { playSuccess, playError } = useAbacusSound();

    useEffect(() => {
        setStartTime(Date.now());
    }, [sceneIndex]);

    const storyScenes = [
        {
            narrator: "Mistress Creola asks: 'Who can show me the number 9?'",
            options: [
                { id: 'A', value: 9, isCorrect: true, label: "Student A" },
                { id: 'B', value: 4, isCorrect: false, label: "Student B" },
            ],
            correctMessage: "Correct! Student A has all beads touching the bar (5 + 4 = 9)."
        },
        {
            narrator: "Ameer tries to show the number 5. Is he correct?",
            // Ameer shows 1 (lower bead) instead of 5 (upper bead).
            options: [
                { id: 'Yes', value: 5, isCorrect: false, label: "Yes, looks right" }, // Trick: label says yes, we need visual representation of error
                // Actually, let's make it "Select the Correct Student"
            ],
            // Let's stick to "Select the correct student" pattern for simplicity first
            isBinaryChoice: true,
            question: "Does Ameer (showing 1 bead up) have 5?",
            targetValue: 1, // Visual representation
            correctAnswer: false // "No"
        },
        {
            narrator: "Final Challenge! Find the student showing ZERO.",
            options: [
                { id: 'A', value: 5, isCorrect: false, label: "Student A" },
                { id: 'B', value: 0, isCorrect: true, label: "Student B" },
                { id: 'C', value: 1, isCorrect: false, label: "Student C" },
            ],
            correctMessage: "That's right! Zero means NO beads are touching the bar."
        }
    ];

    // Refined Scenes for consistency
    const refinedScenes = [
        {
            instruction: "Touch the student who is showing the number 9 Correctly.",
            targetNumber: 9,
            students: [
                { id: 1, value: 9, correct: true },
                { id: 2, value: 4, correct: false }, // 4 lower beads
                { id: 3, value: 5, correct: false }  // Just 5 bead
            ]
        },
        {
            instruction: "Mistress Creola asks: 'Who knows the Number 5 position?'",
            targetNumber: 5,
            students: [
                { id: 1, value: 1, correct: false }, // Common mistake: 1 lower bead
                { id: 2, value: 5, correct: true },  // Correct: Top bead down (Maimuna)
                { id: 3, value: 4, correct: false }, // 4 lower beads
            ]
        },
        {
            instruction: "Mistress Creola says: 'Find the student showing the number 1!'",
            targetNumber: 1,
            students: [
                { id: 1, value: 5, correct: false }, // Top bead down
                { id: 2, value: 1, correct: true },  // 1 lower bead up
            ]
        },
        {
            instruction: "Who is showing Zero (Empty)?",
            targetNumber: 0,
            students: [
                { id: 1, value: 0, correct: true },
                { id: 2, value: 9, correct: false },
            ]
        }
    ];

    const currentScene = refinedScenes[sceneIndex];

    const handleSelect = (student: typeof currentScene.students[0]) => {
        if (feedback) return; // Prevent double clicks

        const isCorrect = student.correct;
        const timeSpent = Date.now() - startTime;

        logInteraction({
            quest_id: 3,
            scene_id: `story_scene_${sceneIndex}`,
            number: currentScene.targetNumber,
            correct_flag: isCorrect,
            interaction_type: 'story_selection',
            student_response: student.value.toString(),
            time_ms: timeSpent,
        });

        if (isCorrect) {
            playSuccess();
            setFeedback('correct');
            setTimeout(() => {
                setFeedback(null);
                if (sceneIndex < refinedScenes.length - 1) {
                    setSceneIndex(prev => prev + 1);
                } else {
                    onComplete();
                }
            }, 2000);
        } else {
            playError();
            setFeedback('wrong');
            setTimeout(() => setFeedback(null), 1500);
        }
    };

    return (
        <div className="min-h-screen bg-brand-cream p-8">
            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-8 border-4 border-brand-purple">

                {/* Story Header */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-brand-purple mb-4">Making Numbers Come Alive!</h2>
                    <div className="bg-brand-purple/10 inline-block px-6 py-3 rounded-full">
                        <p className="text-xl text-brand-purple font-medium">{currentScene.instruction}</p>
                    </div>
                </div>

                {/* Students Grid */}
                <div className="flex flex-wrap justify-center gap-12">
                    {currentScene.students.map((student, idx) => (
                        <motion.button
                            key={student.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSelect(student)}
                            className="flex flex-col items-center gap-4 bg-gray-50 p-6 rounded-2xl border-2 border-transparent hover:border-brand-teal transition-all shadow-md hover:shadow-xl"
                        >
                            <div className="text-6xl mb-2">
                                {['👧', '👦', '🧒', '👧🏽'][idx % 4]}
                            </div>

                            {/* Static abacus representation */}
                            <div className="pointer-events-none transform scale-90">
                                <InteractiveAbacus
                                    initialValue={student.value}
                                    interactive={false}
                                />
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Feedback Overlay */}
                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 pointer-events-none"
                        >
                            <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center">
                                {feedback === 'correct' ? (
                                    <>
                                        <CheckCircle className="w-24 h-24 text-green-500 mb-4" />
                                        <h3 className="text-3xl font-bold text-green-600">Spot On!</h3>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-24 h-24 text-red-500 mb-4" />
                                        <h3 className="text-3xl font-bold text-red-600">Oops, try again!</h3>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
