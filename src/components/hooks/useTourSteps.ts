import { useEffect } from 'react';
import { useSystemTour } from './tour';
import { useTranslation } from 'react-i18next';

export const useDashboardTourSteps = (refs: {
  searchRef: React.RefObject<HTMLElement>;
  filterRef: React.RefObject<HTMLElement>;
  tableRef: React.RefObject<HTMLElement>;
  actionsRef: React.RefObject<HTMLElement>;
}) => {
  const { t } = useTranslation('common');
  const systemTour = useSystemTour();

  useEffect(() => {
    const { searchRef, filterRef, tableRef, actionsRef } = refs;

    systemTour.addStep('dashboard', {
      id: 'search',
      title: t('Search'),
      target: () => searchRef.current,
      description: t('Use this search bar to find specific items quickly'),
    }, 0);

    systemTour.addStep('dashboard', {
      id: 'filters',
      title: t('Filters'),
      target: () => filterRef.current,
      description: t('Apply filters to narrow down your results'),
    }, 1);

    systemTour.addStep('dashboard', {
      id: 'table',
      title: t('Data Table'),
      target: () => tableRef.current,
      description: t('View and manage your data in this table'),
    }, 2);

    systemTour.addStep('dashboard', {
      id: 'actions',
      title: t('Actions'),
      target: () => actionsRef.current,
      description: t('Perform various actions on your data here'),
    }, 3);
  }, [systemTour, t]);
};

export const useDisputesTourSteps = (refs: {
  createRef: React.RefObject<HTMLElement>;
  statusRef: React.RefObject<HTMLElement>;
  detailsRef: React.RefObject<HTMLElement>;
}) => {
  const { t } = useTranslation('common');
  const systemTour = useSystemTour();

  useEffect(() => {
    const { createRef, statusRef, detailsRef } = refs;

    systemTour.addStep('disputes', {
      id: 'create-dispute',
      title: t('Create Dispute'),
      target: () => createRef.current,
      description: t('Click here to create a new dispute case'),
    }, 0);

    systemTour.addStep('disputes', {
      id: 'status',
      title: t('Status Tracking'),
      target: () => statusRef.current,
      description: t('Monitor the status of your disputes here'),
    }, 1);

    systemTour.addStep('disputes', {
      id: 'details',
      title: t('Case Details'),
      target: () => detailsRef.current,
      description: t('View and manage detailed information about each case'),
    }, 2);
  }, [systemTour, t]);
};

export const useInvitationsTourSteps = (refs: {
  generateRef: React.RefObject<HTMLElement>;
  cancelRef: React.RefObject<HTMLElement>;
  shareRef: React.RefObject<HTMLElement>;
}) => {
  const { t } = useTranslation('common');
  const systemTour = useSystemTour();

  useEffect(() => {
    const { generateRef, cancelRef, shareRef } = refs;

    systemTour.addStep('invitations', {
      id: 'generate-letter',
      title: t('Generate Letter'),
      target: () => generateRef.current,
      description: t('Generate invitation letters for participants'),
    }, 0);

    systemTour.addStep('invitations', {
      id: 'cancel',
      title: t('Cancel Invitation'),
      target: () => cancelRef.current,
      description: t('Cancel an invitation if needed'),
    }, 1);

    systemTour.addStep('invitations', {
      id: 'share',
      title: t('Share Documents'),
      target: () => shareRef.current,
      description: t('Share relevant documents with participants'),
    }, 2);
  }, [systemTour, t]);
};

export const useAppealsTourSteps = (refs: {
  submitRef: React.RefObject<HTMLElement>;
  trackRef: React.RefObject<HTMLElement>;
  documentsRef: React.RefObject<HTMLElement>;
}) => {
  const { t } = useTranslation('common');
  const systemTour = useSystemTour();

  useEffect(() => {
    const { submitRef, trackRef, documentsRef } = refs;

    systemTour.addStep('appeals', {
      id: 'submit-appeal',
      title: t('Submit Appeal'),
      target: () => submitRef.current,
      description: t('Submit a new appeal for review'),
    }, 0);

    systemTour.addStep('appeals', {
      id: 'track-appeal',
      title: t('Track Appeal'),
      target: () => trackRef.current,
      description: t('Monitor the status of your appeals'),
    }, 1);

    systemTour.addStep('appeals', {
      id: 'appeal-documents',
      title: t('Appeal Documents'),
      target: () => documentsRef.current,
      description: t('Manage documents related to your appeal'),
    }, 2);
  }, [systemTour, t]);
};

export const useProfileTourSteps = (refs: {
  personalRef: React.RefObject<HTMLElement>;
  securityRef: React.RefObject<HTMLElement>;
  preferencesRef: React.RefObject<HTMLElement>;
}) => {
  const { t } = useTranslation('common');
  const systemTour = useSystemTour();

  useEffect(() => {
    const { personalRef, securityRef, preferencesRef } = refs;

    systemTour.addStep('profile', {
      id: 'personal-info',
      title: t('Personal Information'),
      target: () => personalRef.current,
      description: t('Update your personal information here'),
    }, 0);

    systemTour.addStep('profile', {
      id: 'security',
      title: t('Security Settings'),
      target: () => securityRef.current,
      description: t('Manage your security settings and password'),
    }, 1);

    systemTour.addStep('profile', {
      id: 'preferences',
      title: t('Preferences'),
      target: () => preferencesRef.current,
      description: t('Customize your application preferences'),
    }, 2);
  }, [systemTour, t]);
}; 