"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";

type Controls = {
  saveDraft: () => void;
  savePublished: () => void;
  togglePreview: () => void;
};

type StudioState = {
  isSaving: boolean;
  isPreviewMode: boolean;
};

type ContextValue = StudioState & Controls;

const noop = () => {};

const SeriesPostStudioContext = createContext<ContextValue>({
  isSaving: false,
  isPreviewMode: false,
  saveDraft: noop,
  savePublished: noop,
  togglePreview: noop,
});

export function useSeriesPostStudioControls() {
  return useContext(SeriesPostStudioContext);
}

interface ProviderProps {
  children: React.ReactNode;
}

export function SeriesPostStudioProvider({ children }: ProviderProps) {
  const controlsRef = useRef<Controls>({
    saveDraft: noop,
    savePublished: noop,
    togglePreview: noop,
  });
  const [state, setState] = useState<StudioState>({
    isSaving: false,
    isPreviewMode: false,
  });

  const value = useMemo<ContextValue>(
    () => ({
      ...state,
      saveDraft: () => controlsRef.current.saveDraft(),
      savePublished: () => controlsRef.current.savePublished(),
      togglePreview: () => controlsRef.current.togglePreview(),
    }),
    [state],
  );

  // Expose registration helpers to children via module-level singletons
  ;(globalThis as any).__SERIES_POST_STUDIO_REGISTER__ = (controls: Controls) => {
    controlsRef.current = controls;
  };
  ;(globalThis as any).__SERIES_POST_STUDIO_SET_STATE__ = (s: StudioState) => {
    setState((prev) =>
      prev.isSaving === s.isSaving && prev.isPreviewMode === s.isPreviewMode
        ? prev
        : s,
    );
  };

  return (
    <SeriesPostStudioContext.Provider value={value}>
      {children}
    </SeriesPostStudioContext.Provider>
  );
}

export function registerSeriesPostStudioControls(controls: Controls) {
  const fn = (globalThis as any).__SERIES_POST_STUDIO_REGISTER__ as
    | ((c: Controls) => void)
    | undefined;
  fn?.(controls);
}

export function setSeriesPostStudioState(s: StudioState) {
  const fn = (globalThis as any).__SERIES_POST_STUDIO_SET_STATE__ as
    | ((s: StudioState) => void)
    | undefined;
  fn?.(s);
}
