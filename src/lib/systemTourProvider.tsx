import { SystemTourContext, tours } from "@/components/hooks/tour";
import React, { useEffect } from "react";
import { initializeTours } from "@/utils/constants/tours";
import { useTranslation } from "next-i18next";

type SystemTourContextProviderProps = {
  children: React.ReactNode;
};

export const SystemTourProvider = ({
  children,
}: SystemTourContextProviderProps) => {
  const { t } = useTranslation('common');

  useEffect(() => {
    initializeTours(t);
  }, [t]);

  return (
    <SystemTourContext.Provider value={tours}>
      {children}
    </SystemTourContext.Provider>
  );
};
