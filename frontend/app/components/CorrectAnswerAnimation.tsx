import { FC } from 'react';
import Animation from './Animation';

interface CorrectAnswerAnimationProps {
  x: number;
  y: number;
  onComplete?: () => void;
}

const CorrectAnswerAnimation: FC<CorrectAnswerAnimationProps> = ({ x, y, onComplete }) => {
  return (
    <div 
      className="fixed pointer-events-none z-50"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="w-40 h-40">
        <Animation type="click" onComplete={onComplete} />
      </div>
    </div>
  );
};

export default CorrectAnswerAnimation; 