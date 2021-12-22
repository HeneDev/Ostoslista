import { useEffect } from 'react';

/**
 * Hooks to component lifecycle and adds 'vertical-center'
 * class to <body> element when component is active.
 */
export default function useFullHeightLayout() {
  const className = 'vertical-center';

  useEffect(() => {
    // Set up
    document.body.classList.add(className);

    // Clean up
    return () => {
      document.body.classList.remove(className);
    };
  },
  [className]);
}
