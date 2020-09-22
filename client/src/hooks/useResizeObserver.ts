import { RefObject, useEffect, useRef, useState } from 'react';

interface Dimensions {
  height: number;
  width: number;
}

export function useResizeObserver<T extends HTMLElement>(): [RefObject<T>, Dimensions] {
  const root = useRef<T>(null);
  const [dimensions, setDimensions] = useState({ height: 0, width: 0 });

  useEffect(() => {
    const rootElement = root.current;

    if (!rootElement) {
      return;
    }

    function handleResize() {
      if (!rootElement) {
        return;
      }

      const { height, width } = rootElement.getBoundingClientRect();
      setDimensions({ height, width });
    }

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(rootElement);

    return () => resizeObserver.disconnect();
  }, []);

  return [root, dimensions];
}
