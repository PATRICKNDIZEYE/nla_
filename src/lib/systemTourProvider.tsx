import { SystemTourContext, tours } from "@/components/hooks/tour";
import React from "react";
import ClientTour from "./ClientTour";

type SystemTourContextProviderProps = {
  children: React.ReactNode;
};

export const SystemTourProvider = ({
  children,
}: SystemTourContextProviderProps) => {
  return (
    <>
      <SystemTourContext.Provider value={tours}>
        {children}
        {/* <ClientTour /> */}
      </SystemTourContext.Provider>
    </>
  );
};
