import { useState } from 'react';
import { Quest3PreTest } from '../quests/Quest3PreTest';
import { Quest3Story } from '../quests/Quest3Story';
import { Quest3Welcome } from '../quests/Quest3Welcome';
import { Quest3Mastery } from '../quests/Quest3Mastery';


interface PositionNumbersProps {
  onNext: (results?: { pre: number; post: number }) => void;
}


type Phase = 'welcome' | 'pretest' | 'mastery' | 'story' | 'posttest';

export function PositionNumbers({ onNext }: PositionNumbersProps) {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [preScore, setPreScore] = useState(0);


  const handleNextPhase = (nextPhase?: Phase) => {
    if (nextPhase) {
      setPhase(nextPhase);
    } else {
      // Default Sequential Flow
      switch (phase) {
        case 'welcome': setPhase('pretest'); break;
        case 'pretest': setPhase('mastery'); break;
        case 'mastery': setPhase('story'); break;
        case 'story': setPhase('posttest'); break;
        case 'posttest': onNext({ pre: preScore, post: 100 }); break; // Using dummy post score or passed from component
      }
    }
  };


  switch (phase) {
    case 'welcome':
      return <Quest3Welcome onComplete={() => handleNextPhase('pretest')} />;
    case 'pretest':
      return <Quest3PreTest key="pretest" onComplete={(score) => {
        setPreScore(score || 0);
        handleNextPhase('mastery');
      }} />;
    case 'mastery':
      return <Quest3Mastery key="mastery" onComplete={() => handleNextPhase('story')} />;
    case 'story':
      return <Quest3Story key="story" onComplete={() => handleNextPhase('posttest')} />;
    case 'posttest':
      // Passing isPostTest prop if Quest3PreTest supports it, assuming it does based on previous code
      return <Quest3PreTest key="posttest" isPostTest onComplete={(score) => onNext({ pre: preScore, post: score || 0 })} />;
    default:
      return null;
  }
}