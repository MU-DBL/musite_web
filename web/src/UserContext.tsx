import React, { createContext, useContext } from "react";

export const UserContext = createContext<string | null>(null);

export const useUserId = (): string => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUserId must be used within UserContext.Provider");
  }
  return ctx;
};
