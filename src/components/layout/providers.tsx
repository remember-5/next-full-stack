"use client";
import React from "react";
import { TRPCReactProvider } from "~/trpc/react";
import { ActiveThemeProvider } from "../themes/active-theme";

export default function Providers({
  activeThemeValue,
  children,
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </ActiveThemeProvider>
    </>
  );
}
