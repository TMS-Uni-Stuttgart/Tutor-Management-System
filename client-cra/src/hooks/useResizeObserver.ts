import _ from 'lodash';
import { RefObject, useEffect, useRef, useState } from 'react';

export interface Dimensions {
  height: number;
  width: number;
}

export function useResizeObserver<T extends HTMLElement>(
  startDimensions?: Dimensions
): [RefObject<T>, Dimensions] {
  const root = useRef<T>(null);
  const [dimensions, setDimensions] = useState(() => startDimensions ?? { height: 0, width: 0 });

  useEffect(() => {
    const rootElement = root.current;

    if (!rootElement) {
      return;
    }

    function handleResize(elements: ResizeObserverEntry[]) {
      // Use the given elements here to get the most up-to-date variant (the root ref is kind of lagging behind).
      // We only observe one element so we can just pick the first one.
      const element = elements[0];

      if (!element) {
        return;
      }

      const { height, width } = element.contentRect;
      setDimensions({ height, width });
    }

    const resizeObserver = new ResizeObserver(_.debounce(handleResize, 10));
    resizeObserver.observe(rootElement, { box: 'border-box' });

    return () => resizeObserver.disconnect();
  }, []);

  return [root, dimensions];
}
