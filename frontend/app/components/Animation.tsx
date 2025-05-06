import { FC, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface Keyframe {
  a: number;
  k: number[];
  ix: number;
}

interface Keyframes {
  p: Keyframe;
  a: Keyframe;
  s: Keyframe;
  r: Keyframe;
  o: Keyframe;
  sk: Keyframe;
  sa: Keyframe;
}

interface Asset {
  id: string;
  w: number;
  h: number;
  u: string;
  p: string;
  e: number;
}

interface Layer {
  ddd: number;
  ind: number;
  ty: number;
  nm: string;
  sr: number;
  ks: Keyframes;
  ao: number;
  ip: number;
  op: number;
  st: number;
  bm: number;
}

interface AnimationData {
  v: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  nm: string;
  ddd: number;
  assets: Asset[];
  layers: Layer[];
}

interface AnimationProps {
  type: 'success' | 'loading' | 'login' | 'click';
  className?: string;
  onComplete?: () => void;
}

// Dynamically import Lottie with no SSR
const LottieAnimation = dynamic(() => import('./LottieAnimation'), {
  ssr: false,
});

const Animation: FC<AnimationProps> = ({ type, className, onComplete }) => {
  const [animationData, setAnimationData] = useState<AnimationData | null>(null);

  const getAnimationUrl = () => {
    switch (type) {
      case 'success':
        return '/animations/success.json';
      case 'loading':
        return '/animations/loading.json';
      case 'login':
        return '/animations/login.json';
      case 'click':
        return '/animations/click.json';
      default:
        return '/animations/loading.json';
    }
  };

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch(getAnimationUrl());
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error('Error loading animation:', error);
      }
    };

    loadAnimation();
  }, [type]);

  if (!animationData) {
    return null;
  }

  return (
    <div className={className}>
      <LottieAnimation
        animationData={animationData}
        loop={type === 'loading' || type === 'login'}
        autoplay={true}
        onComplete={onComplete}
      />
    </div>
  );
};

export default Animation; 