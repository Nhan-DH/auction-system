import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuctionProvider, useAuction } from './context/AuctionContext';
import { Navbar } from './components/Navbar';
import { AuthPage } from './components/AuthPage';
import { RoomList } from './components/RoomList';
import { RoomView } from './components/RoomView';
import { ToastContainer } from './components/ToastContainer';
import { CreateRoomModal } from './components/CreateRoomModal';
import { ItemSearchModal } from './components/ItemSearchModal';
import { UserStatsModal } from './components/UserStatsModal';
import { DepositModal } from './components/DepositModal';
import { Gavel } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeRoom } = useAuction();

  // Modals state
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  // Global shortcut (Ctrl+K to search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // If not logged in, display the dedicated Login / Register page!
  if (!currentUser) {
    return <AuthPage />;
  }

  // When inside a room, enter dedicated Full-Screen Live Auction Room!
  if (activeRoom) {
    return (
      <div className="h-screen w-screen overflow-hidden flex flex-col font-sans bg-slate-100">
        <ToastContainer />
        <RoomView onOpenDeposit={() => setIsDepositOpen(true)} />
        <DepositModal
          isOpen={isDepositOpen}
          onClose={() => setIsDepositOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-900">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Top Navbar */}
      <Navbar
        onOpenCreateRoom={() => setIsCreateRoomOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenDeposit={() => setIsDepositOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        <RoomList
          onOpenCreateRoom={() => setIsCreateRoomOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      </main>

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold">
              <Gavel className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-700">Đấu Giá Trực Tuyến</span>
            <span>• Hệ thống đấu giá phòng thời gian thực</span>
          </div>

          <div className="text-slate-400 text-[11px]">
            WebSocket Server Authoritative • Reset 30s • Hàng đợi vật phẩm
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
      />

      <ItemSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <UserStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AuctionProvider>
        <MainAppContent />
      </AuctionProvider>
    </AuthProvider>
  );
}
