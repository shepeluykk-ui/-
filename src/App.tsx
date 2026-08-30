import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SystemModule } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NavigationRail } from './components/NavigationRail';
import { MobileBottomNavigation } from './components/MobileBottomNavigation';

// Views
import { DashboardView } from './components/DashboardView';
import { DocumentsView } from './components/DocumentsView';
import { EstimatesView } from './components/EstimatesView';
import { ScheduleView } from './components/ScheduleView';
import { ConstructionControlView } from './components/ConstructionControlView';
import { OvikModuleView } from './components/OvikModuleView';
import { PhotoControlView } from './components/PhotoControlView';
import { RemarksDefectsView } from './components/RemarksDefectsView';
import { ExecutiveDocsView } from './components/ExecutiveDocsView';
import { ContractorsView } from './components/ContractorsView';
import { FinanceView } from './components/FinanceView';
import { RisksView } from './components/RisksView';
import { AiAssistantView } from './components/AiAssistantView';
import { AiProjectAnalysisView } from './components/AiProjectAnalysisView';
import { AuditLogView } from './components/AuditLogView';
import { SecurityRedTeamView } from './components/SecurityRedTeamView';
import { BackupRestoreView } from './components/BackupRestoreView';
import { ProjectsView } from './components/ProjectsView';
import { OrganizationsView } from './components/OrganizationsView';
import { WorkTypesManagerView } from './components/WorkTypesManagerView';
import { UnifiedControlView } from './components/UnifiedControlView';
import { AdminRegistrationRequests } from './components/AdminRegistrationRequests';

// Modals & Auth
import { MobileSiteModal } from './components/MobileSiteModal';
import { ManagerReportModal } from './components/ManagerReportModal';
import { SuperAdminRegistrationAlertModal } from './components/SuperAdminRegistrationAlertModal';
import { LoginScreen } from './components/LoginScreen';

const AppContent: React.FC = () => {
  const { isAuthenticated, authLoading, pendingAlertRequest, dismissPendingAlert } = useApp();
  const [activeModule, setActiveModule] = useState<SystemModule>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Fast checkingSession / loading state without any delay or video splash
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white">
        <div className="h-8 w-8 rounded-full border-3 border-cyan-500 border-t-transparent animate-spin mb-4" />
        <div className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
          Проверка сессии...
        </div>
      </div>
    );
  }

  // Unauthenticated -> Login Screen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const handleSelectModule = (module: SystemModule) => {
    setActiveModule(module);
    setIsDrawerOpen(false);
  };

  const renderModuleView = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={setActiveModule}
            onOpenExecutiveReport={() => setShowReportModal(true)}
          />
        );
      case 'projects':
        return <ProjectsView />;
      case 'organizations':
        return <OrganizationsView />;
      case 'work_types':
        return <WorkTypesManagerView />;
      case 'unified_control':
        return <UnifiedControlView />;
      case 'documents':
      case 'drawings':
      case 'specifications':
        return <DocumentsView />;
      case 'estimates':
      case 'volume_control':
        return <EstimatesView />;
      case 'schedule':
        return <ScheduleView />;
      case 'construction_control':
        return <ConstructionControlView />;
      case 'defects':
        return <RemarksDefectsView />;
      case 'ovik':
        return <OvikModuleView />;
      case 'photo_control':
        return <PhotoControlView />;
      case 'executive_docs':
        return <ExecutiveDocsView />;
      case 'contractors':
        return <ContractorsView />;
      case 'finance':
        return <FinanceView />;
      case 'risks':
        return <RisksView />;
      case 'ai_assistant':
        return <AiAssistantView />;
      case 'ai_project_analysis':
        return <AiProjectAnalysisView />;
      case 'audit_log':
        return <AuditLogView />;
      case 'registration_requests':
        return <AdminRegistrationRequests />;
      case 'security_redteam':
        return <SecurityRedTeamView />;
      case 'backup_restore':
        return <BackupRestoreView />;
      default:
        return (
          <DashboardView
            onNavigate={setActiveModule}
            onOpenExecutiveReport={() => setShowReportModal(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 font-sans text-neutral-900 flex flex-col selection:bg-neutral-900 selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Top Application Header */}
      <Header
        activeModule={activeModule}
        onSelectModule={handleSelectModule}
        onOpenMobileSite={() => setShowMobileModal(true)}
        onOpenExecutiveReport={() => setShowReportModal(true)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden min-w-0">
        {/* Desktop Sidebar (>= 1024px) */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={handleSelectModule}
        />

        {/* Tablet Navigation Rail (600px - 1023px) */}
        <NavigationRail
          activeModule={activeModule}
          onSelectModule={handleSelectModule}
          onOpenDrawer={() => setIsDrawerOpen(true)}
        />

        {/* Mobile/Tablet Slide-over Drawer */}
        {isDrawerOpen && (
          <Sidebar
            activeModule={activeModule}
            onSelectModule={handleSelectModule}
            isDrawer={true}
            onClose={() => setIsDrawerOpen(false)}
          />
        )}

        {/* Dynamic Center Canvas */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 lg:p-8 pb-20 sm:pb-24 md:pb-8 min-w-0">
          <div className="mx-auto max-w-7xl">
            {renderModuleView()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 600px / md) */}
      <MobileBottomNavigation
        activeModule={activeModule}
        onSelectModule={handleSelectModule}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        isDrawerOpen={isDrawerOpen}
      />

      {/* Mobile Terminal Modal */}
      {showMobileModal && (
        <MobileSiteModal onClose={() => setShowMobileModal(false)} />
      )}

      {/* Executive Report Modal */}
      {showReportModal && (
        <ManagerReportModal onClose={() => setShowReportModal(false)} />
      )}

      {/* Super Admin Global Real-Time Registration Alert Modal */}
      {pendingAlertRequest && (
        <SuperAdminRegistrationAlertModal
          request={pendingAlertRequest}
          onClose={() => dismissPendingAlert(pendingAlertRequest.id)}
          onNavigateToRequests={() => {
            setActiveModule('registration_requests');
            setIsDrawerOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

