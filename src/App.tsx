import React from 'react';
import { CalendarView } from './components/Calendar/CalendarView';
import { ContactsView } from './components/Contacts/ContactsView';
import { DashboardView } from './components/Dashboard/DashboardView';
import { DataManagementView } from './components/DataManagement/DataManagementView';
import { KanbanBoard } from './components/Kanban/KanbanBoard';
import { Navbar } from './components/Navbar';
import { AddOpportunityModal } from './components/Opportunities/AddOpportunityModal';
import { OpportunityCatalog } from './components/Opportunities/OpportunityCatalog';
import { OpportunityDetailModal } from './components/Opportunities/OpportunityDetailModal';
import { EnterpriseAuthView } from './components/Auth/EnterpriseAuthView';
import { ToastContainer } from './components/UI/ToastContainer';
import { useWorkspace, WorkspaceProvider } from './context/WorkspaceContext';
import { AuthProvider } from './context/AuthContext';
import { Briefcase, ShieldCheck } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab } = useWorkspace();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'catalog' && <OpportunityCatalog />}
      {activeTab === 'kanban' && <KanbanBoard />}
      {activeTab === 'calendar' && <CalendarView />}
      {activeTab === 'contacts' && <ContactsView />}
      {activeTab === 'data' && <DataManagementView />}
      {activeTab === 'auth' && <EnterpriseAuthView />}
    </main>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
          <div>
            {/* Top Sticky Navigation */}
            <Navbar />

            {/* Main View Area */}
            <MainContent />
          </div>

          {/* Global Modals & Alerts */}
          <OpportunityDetailModal />
          <AddOpportunityModal />
          <ToastContainer />

          {/* Footer */}
          <footer className="bg-slate-900 text-white border-t border-slate-800 py-6 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 text-white flex items-center justify-center font-bold text-xs border border-blue-500">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-white uppercase tracking-wider">
                  Opportunity Hub
                </span>
                <span className="text-[11px] uppercase tracking-wider text-slate-500">— Shared Catalog & Full-Stack Auth Workspace</span>
              </div>

              <div className="flex items-center gap-4 text-[11px] uppercase tracking-wider">
                <span className="text-slate-500">Enterprise Dual-Token JWT Guard</span>
              </div>
            </div>
          </footer>
        </div>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
