import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';

/** Re-runs `refresh` whenever the screen comes back into focus (e.g. after saving a form), but not on first mount. */
export function useRefreshOnFocus(refresh: () => unknown) {
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      refresh();
    }, [refresh]),
  );
}
