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

const AdminStudioContext = createContext<ContextValue>({
  isSaving: false,
  isPreviewMode: false,
  saveDraft: noop,
  savePublished: noop,
  togglePreview: noop,
});

export function useAdminStudioControls() {
  return useContext(AdminStudioContext);
}

interface ProviderProps {
  children: React.ReactNode;
}

export function AdminStudioProvider({ children }: ProviderProps) {
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

  // Expose registration helpers to children via module-level singletons.
  // Consumers import registerAdminStudioControls / setAdminStudioState.
  ;(globalThis as any).__ADMIN_STUDIO_REGISTER__ = (controls: Controls) => {
    controlsRef.current = controls;
  };
  ;(globalThis as any).__ADMIN_STUDIO_SET_STATE__ = (s: StudioState) => {
    setState((prev) =>
      prev.isSaving === s.isSaving && prev.isPreviewMode === s.isPreviewMode
        ? prev
        : s,
    );
  };

  return (
    <AdminStudioContext.Provider value={value}>
      {children}
    </AdminStudioContext.Provider>
  );
}

export function registerAdminStudioControls(controls: Controls) {
  const fn = (globalThis as any).__ADMIN_STUDIO_REGISTER__ as
    | ((c: Controls) => void)
    | undefined;
  fn?.(controls);
}

export function setAdminStudioState(s: StudioState) {
  const fn = (globalThis as any).__ADMIN_STUDIO_SET_STATE__ as
    | ((s: StudioState) => void)
    | undefined;
  fn?.(s);
}
