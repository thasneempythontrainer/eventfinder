import { useState, useEffect, useRef } from 'react';

const DigitOdometer = ({ digit, height }) => (
  <span style={{
    display: 'inline-block',
    width: '.55em',
    height,
    lineHeight: height,
    overflow: 'hidden',
    textAlign: 'center',
    verticalAlign: 'middle',
    position: 'relative',
  }}>
    <span style={{
      display: 'block',
      transform: `translateY(-${digit * 10}%)`,
      transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      lineHeight: 1,
    }}>
      {[0,1,2,3,4,5,6,7,8,9].map(d => (
        <span key={d} style={{ display: 'block', height, lineHeight: height, textAlign: 'center' }}>{d}</span>
      ))}
    </span>
  </span>
);

const AnimatedCount = ({ value, duration = 1500, prefix = '', suffix = '', decimals = 0 }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const startTime = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const end = parseFloat(value) || 0;
    const start = 0;
    const range = end - start;
    if (range === 0) return;

    const animate = (ts) => {
      if (!startTime.current) startTime.current = ts;
      const elapsed = ts - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrentValue(start + range * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    startTime.current = null;
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const formatted = currentValue.toFixed(decimals);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontVariantNumeric: 'tabular-nums',
      lineHeight: 1,
    }}>
      {prefix}
      {formatted.split('').map((char, i) => {
        if (char === '.') return <span key={i} style={{ lineHeight: 1 }}>.</span>;
        const digit = parseInt(char, 10);
        if (isNaN(digit)) return <span key={i} style={{ lineHeight: 1 }}>{char}</span>;
        return <DigitOdometer key={i} digit={digit} height="1em" />;
      })}
      {suffix}
    </span>
  );
};

export default AnimatedCount;
