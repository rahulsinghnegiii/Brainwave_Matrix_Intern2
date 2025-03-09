import { useRef, useEffect } from 'react';

export function useRenderCounter(componentName) {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    console.log(`${componentName} rendered ${renderCount.current} times`);
  });
  
  return renderCount.current;
}

// Then in your components:
function ProblemComponent() {
  const renders = useRenderCounter('ProblemComponent');
  // ...
} 