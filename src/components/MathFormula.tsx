import React, { useEffect, useRef } from 'react';

interface MathFormulaProps {
  formula: string;
  display?: boolean;
  className?: string;
}

declare global {
  interface Window {
    katex?: {
      render: (tex: string, element: HTMLElement, options?: object) => void;
    };
  }
}

export const MathFormula: React.FC<MathFormulaProps> = ({ formula, display = false, className = '' }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      if (typeof window !== 'undefined' && window.katex) {
        try {
          window.katex.render(formula, containerRef.current, {
            displayMode: display,
            throwOnError: false
          });
        } catch {
          containerRef.current.textContent = formula;
        }
      } else {
        containerRef.current.textContent = formula;
      }
    }
  }, [formula, display]);

  return (
    <span
      ref={containerRef}
      className={`font-mono text-indigo-300 ${display ? 'block my-3 text-center overflow-x-auto py-1' : 'inline-block px-1'} ${className}`}
    />
  );
};
