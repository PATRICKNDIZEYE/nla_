"use client";
import { useSystemTour } from "@/components/hooks/tour";
import { Tour } from "antd";
import { useEffect, useState } from "react";

const ClientTour = () => {
  const systemTour = useSystemTour();
  const [tourSteps, setTourSteps] = useState([] as any);

  useEffect(() => {
    const tour = systemTour.getTour("new-case");
    if (!tour) return;
    setTourSteps(tour.steps);
  }, [systemTour]);

  if (!tourSteps) return null;

  return <Tour open={true} steps={tourSteps} />;
};

export default ClientTour;
