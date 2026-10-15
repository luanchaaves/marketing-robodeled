import React, { useState, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, NavTab } from './Sidebar';
import { TopHeader } from './TopHeader';
import { AIAssistantModal } from '../ai/AIAssistantModal';
import { NewLeadModal } from '../leads/NewLeadModal';

interface MainLayoutProps {
  currentTab?: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  children: ReactNode;
  onOpenNewLead?: () => void;
  onOpenAIModal?: () => void;
}

const TAB_ROUTES: Record<NavTab, string> = {
  dashboard: '/',
  leads: '/leads',
  campaigns: '/campaigns',
  traffic: '/traffic',
  instagram: '/instagram',
  editorial: '/editorial',
  automations: '/automations',
  reports: '/reports',
  integrations: '/integrations',
  settings: '/settings',
};

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentTab: propTab,
  onSelectTab: propOnSelectTab,
  children,
  onOpenNewLead: propOnOpenNewLead,
  onOpenAIModal: propOnOpenAIModal,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isGlobalLeadOpen, setIsGlobalLeadOpen] = useState(false);
  const [isGlobalAIOpen, setIsGlobalAIOpen] = useState(false);

  // Derive tab from pathname if not explicitly passed
  const getTabFromPath = (path: string): NavTab => {
    if (path.startsWith('/leads')) return 'leads';
    if (path.startsWith('/campaigns')) return 'campaigns';
    if (path.startsWith('/traffic')) return 'traffic';
    if (path.startsWith('/instagram')) return 'instagram';
    if (path.startsWith('/editorial')) return 'editorial';
    if (path.startsWith('/automations')) return 'automations';
    if (path.startsWith('/reports')) return 'reports';
    if (path.startsWith('/integrations')) return 'integrations';
    if (path.startsWith('/settings')) return 'settings';
    return 'dashboard';
  };

  const activeTab = propTab || getTabFromPath(location.pathname);

  const handleSelectTab = (tab: NavTab) => {
    if (propOnSelectTab) {
      propOnSelectTab(tab);
    } else {
      navigate(TAB_ROUTES[tab]);
    }
  };

  const handleOpenNewLead = () => {
    if (propOnOpenNewLead) {
      propOnOpenNewLead();
    } else {
      setIsGlobalLeadOpen(true);
    }
  };

  const handleOpenAIModal = () => {
    if (propOnOpenAIModal) {
      propOnOpenAIModal();
    } else {
      setIsGlobalAIOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex">
      {/* Sidebar */}
      <Sidebar
        currentTab={activeTab}
        onSelectTab={handleSelectTab}
        isOpenMobile={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onOpenNewLeadModal={handleOpenNewLead}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <TopHeader
          currentTab={activeTab}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onOpenNewLead={handleOpenNewLead}
          onOpenAIModal={handleOpenAIModal}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <AIAssistantModal
        isOpen={isGlobalAIOpen}
        onClose={() => setIsGlobalAIOpen(false)}
      />

      <NewLeadModal
        isOpen={isGlobalLeadOpen}
        onClose={() => setIsGlobalLeadOpen(false)}
        onLeadSaved={() => {
          setIsGlobalLeadOpen(false);
          // If on leads page, can reload or navigate
          if (location.pathname !== '/leads') {
            navigate('/leads');
          } else {
            window.location.reload();
          }
        }}
      />
    </div>
  );
};
