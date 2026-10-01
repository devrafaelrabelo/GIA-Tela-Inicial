import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MotivationalModal } from './publish/MotivationalModal';
import { CompanyHighlightModal } from './publish/CompanyHighlightModal';
import { EmployeeHighlightModal } from './publish/EmployeeHighlightModal';
import { CompanyValuesModal } from './publish/CompanyValuesModal';
import { AnnouncementModal } from './publish/AnnouncementModal';
import { CalendarModal } from './publish/CalendarModal';
import { ForumModal } from './publish/ForumModal';
import { CompanyGoalModal } from './publish/CompanyGoalModal';

export const PublishModal: React.FC = () => {
  const { isPublishModalOpen, closePublishModal, publishTarget } = useAuth();
  const [activeTarget, setActiveTarget] = useState<string>('forum');

  useEffect(() => {
    if (publishTarget) {
      setActiveTarget(publishTarget);
    }
  }, [publishTarget, isPublishModalOpen]);

  if (!isPublishModalOpen) return null;

  // Route to the dedicated modal tailored for each card / publication type
  switch (activeTarget) {
    case 'card_1':
      return <MotivationalModal isOpen={isPublishModalOpen} onClose={closePublishModal} />;

    case 'card_2':
      return <CompanyHighlightModal isOpen={isPublishModalOpen} onClose={closePublishModal} />;

    case 'card_3':
      return <EmployeeHighlightModal isOpen={isPublishModalOpen} onClose={closePublishModal} />;

    case 'card_4':
      return <CompanyValuesModal isOpen={isPublishModalOpen} onClose={closePublishModal} />;

    case 'metas':
      return <CompanyGoalModal isOpen={isPublishModalOpen} onClose={closePublishModal} />;

    case 'avisos_principais':
      return (
        <AnnouncementModal
          isOpen={isPublishModalOpen}
          onClose={closePublishModal}
          defaultFeatured={true}
        />
      );

    case 'comunicados':
    case 'unidades':
      return (
        <AnnouncementModal
          isOpen={isPublishModalOpen}
          onClose={closePublishModal}
          defaultFeatured={false}
        />
      );

    case 'calendario':
      return <CalendarModal isOpen={isPublishModalOpen} onClose={closePublishModal} />;

    case 'forum':
    default:
      return <ForumModal isOpen={isPublishModalOpen} onClose={closePublishModal} />;
  }
};
