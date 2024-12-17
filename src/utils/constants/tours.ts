import { tours } from '@/components/hooks/tour';

export const initializeTours = (t: (key: string) => string) => {
  // Dashboard Tour
  tours.addTour({
    id: 'dashboard',
    title: t('Dashboard Tour'),
    description: t('Let us show you around the dashboard'),
    steps: []
  });

  // Disputes Tour
  tours.addTour({
    id: 'disputes',
    title: t('Disputes Management Tour'),
    description: t('Learn how to manage disputes'),
    steps: []
  });

  // Invitations Tour
  tours.addTour({
    id: 'invitations',
    title: t('Invitations Management Tour'),
    description: t('Learn how to manage invitations'),
    steps: []
  });

  // Appeals Tour
  tours.addTour({
    id: 'appeals',
    title: t('Appeals Management Tour'),
    description: t('Learn how to manage appeals'),
    steps: []
  });

  // Profile Tour
  tours.addTour({
    id: 'profile',
    title: t('Profile Management Tour'),
    description: t('Learn how to manage your profile'),
    steps: []
  });
}; 