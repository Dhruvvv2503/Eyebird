import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

export function useCountUp(value: number, duration = 1200, decimals = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as any, { once: true, margin: '-80px' });
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!isInView || started.current) return;
    started.current = true;
    const startTime = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(parseFloat((eased * value).toFixed(decimals)));
      if (t < 1) requestAnimationFrame(animate);
      else setCount(value);
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration, decimals]);

  return { count, ref };
}
