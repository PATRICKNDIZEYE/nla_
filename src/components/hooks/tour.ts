import { TourStepProps } from "antd";
import { ReactNode, createContext, useContext } from "react";

type Step = {
  id: string;
  title: string;
  target: () => any;
  description: string;
  nextButtonProps?: {
    children?: ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  };
  prevButtonProps?: {
    children?: ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  };
};

interface Tour extends TourStepProps {
  id: string;
  title: string;
  description: string;
  steps: Array<Step>;
};

type Tours = Array<Tour>;

class SystemTour {
  tours: Tours;
  constructor() {
    this.tours = new Array<Tour>();
  }

  addTour(tour: Tour) {
    if (!this.getTour(tour.id)) {
      this.tours.push(tour);
    }
  }

  getTour(id: string) {
    return this.tours.find((tour) => tour.id === id);
  }

  removeTour(id: string) {
    this.tours = this.tours.filter((tour) => tour.id !== id);
  }

  getTours() {
    return this.tours;
  }

  addStep(tourId: string, step: Step, index: number = -1) {
    const tour = this.getTour(tourId);
    if (tour && !this.getStep(tourId, step.id)) {
      tour.steps.splice(index, 0, step);
    }
  }

  getStep(tourId: string, stepId: string) {
    const tour = this.getTour(tourId);
    if (tour) {
      return tour.steps.find((step) => step.id === stepId);
    }
  }
}

export const tours: SystemTour = new SystemTour();

export const SystemTourContext = createContext<SystemTour>(tours);

export const useSystemTour: () => SystemTour = () => useContext(SystemTourContext);
