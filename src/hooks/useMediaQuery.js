import { useState, useEffect } from "react";

// Type for hook options
const UseMediaQueryOptions = {
  defaultValue: false,
  initializeWithValue: true,
};

// Check if we're on the server
const IS_SERVER = typeof window === "undefined";

export function useMediaQuery(
  query,
  {
    defaultValue = false,
    initializeWithValue = true,
  } = UseMediaQueryOptions
) {
  // Helper function to get matches
  const getMatches = (query) => {
    if (IS_SERVER) {
      return defaultValue;
    }
    return window.matchMedia(query).matches;
  };

  // Initialize state with proper value based on options
  const [matches, setMatches] = useState(() => {
    if (initializeWithValue) {
      return getMatches(query);
    }
    return defaultValue;
  });

  // Handles the change event of the media query
  function handleChange() {
    setMatches(getMatches(query));
  }

  useEffect(() => {
    // Skip on server
    if (IS_SERVER) return undefined;

    const matchMedia = window.matchMedia(query);

    // Triggered at the first client-side load and if query changes
    handleChange();

    // Use deprecated `addListener` and `removeListener` to support Safari < 14
    if (matchMedia.addListener) {
      matchMedia.addListener(handleChange);
    } else {
      matchMedia.addEventListener("change", handleChange);
    }

    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange);
      } else {
        matchMedia.removeEventListener("change", handleChange);
      }
    };
  }, [query]);

  return matches;
}