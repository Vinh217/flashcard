import { useLottie } from 'lottie-react';
import { FC } from 'react';

interface LottieAnimationProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  onComplete?: () => void;
}

const LottieAnimation: FC<LottieAnimationProps> = ({
  animationData,
  loop = false,
  autoplay = true,
  onComplete,
}) => {
  const { View } = useLottie({
    animationData,
    loop,
    autoplay,
    onComplete,
  });

  return View;
};

export default LottieAnimation; 