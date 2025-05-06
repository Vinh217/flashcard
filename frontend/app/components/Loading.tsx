import { FC } from 'react';
import Animation from './Animation';

interface LoadingProps {
  type?: 'default' | 'login' | 'upload' | 'success' | 'click';
  className?: string;
  text?: string;
}

const Loading: FC<LoadingProps> = ({ 
  type = 'default', 
  className = 'w-20 h-20',
  text 
}) => {
  const getAnimationType = () => {
    switch (type) {
      case 'login':
        return 'login';
      case 'upload':
        return 'loading';
      case 'success':
        return 'success';
      case 'click':
        return 'click';
      default:
        return 'loading';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Animation 
        type={getAnimationType()} 
        className={className}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading; 