import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuction } from '../context/AuctionContext';
import {
  Gavel,
  Search,
  Plus,
  BarChart3,
  Wallet,
  LogOut,
  ChevronDown,
  Volume2,
  VolumeX,
  Users,
} from 'lucide-react';

interface NavbarProps {
  onOpenCreateRoom: () => void;
  onOpenSearch: () => void;
  onOpenStats: () => void;
  onOpenDeposit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateRoom,
  onOpenSearch,
  onOpenStats,
  onOpenDeposit,
}) => {
  const { currentUser, usersList, switchUser, logout } = useAuth();
  const { activeRoom, leaveRoom, isMuted, toggleMute } = useAuction();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <div
          onClick={() => activeRoom && leaveRoom()}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/30">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base text-slate-800 tracking-tight">
              ĐẤU GIÁ TRỰC TUYẾN
            </span>
            <p className="text-[10px] text-slate-500 leading-none">Hệ Thống Đấu Giá Real-time</p>
          </div>
        </div>

        {/* Center: Search button */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-500 transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-orange-500" />
            <span>Tìm kiếm vật phẩm theo tên, khung giờ...</span>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Room Badge */}
          {activeRoom && (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="truncate max-w-[130px]">{activeRoom.title}</span>
              <button
                onClick={leaveRoom}
                className="text-[11px] text-orange-600 hover:text-orange-900 underline ml-1 cursor-pointer"
              >
                Rời phòng
              </button>
            </div>
          )}

          {/* Mute/Sound toggle */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition cursor-pointer"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-orange-600" />}
          </button>

          {/* Search on mobile */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Create Room Button */}
          <button
            onClick={onOpenCreateRoom}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-sm shadow-orange-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Phòng</span>
          </button>

          {/* User Stats Button */}
          <button
            onClick={onOpenStats}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-orange-500" />
            <span>Thống Kê</span>
          </button>

          {/* User Profile & Balance */}
          {currentUser && (
            <div className="relative">
              <div className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-xl bg-slate-50 border border-slate-200">
                {/* Wallet Balance */}
                <button
                  onClick={onOpenDeposit}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white text-xs font-bold text-orange-600 transition cursor-pointer"
                  title="Bấm để nạp thêm tiền ví ảo"
                >
                  <Wallet className="w-3.5 h-3.5 text-orange-500" />
                  <span>{currentUser.balance.toLocaleString('vi-VN')} đ</span>
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-1 py-0.2 rounded font-normal">
                    +Nạp
                  </span>
                </button>

                <div className="w-px h-4 bg-slate-200" />

                {/* Avatar */}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-1 px-1 py-0.5 rounded-lg hover:bg-white transition cursor-pointer"
                  title="Menu tài khoản & chuyển người dùng"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.displayName}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-orange-300"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Quick 1-click Logout button */}
                <button
                  onClick={logout}
                  className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition cursor-pointer"
                  title="Đăng xuất (Về màn hình Đăng Nhập / Đăng Ký)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 text-xs"
                  onClick={() => setShowDropdown(false)}
                >
                  <div className="p-3 border-b border-slate-100 mb-2">
                    <p className="font-bold text-slate-800 text-sm">{currentUser.displayName}</p>
                    <p className="text-[11px] text-slate-500">@{currentUser.username}</p>
                    <p className="text-[11px] text-orange-600 font-semibold mt-1">
                      Số dư ví: {currentUser.balance.toLocaleString('vi-VN')} đ
                    </p>
                  </div>

                  <p className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Đổi tài khoản nhanh:
                  </p>
                  {usersList.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => switchUser(u.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                        u.id === currentUser.id
                          ? 'bg-orange-50 text-orange-700 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <img
                          src={u.avatar}
                          alt={u.displayName}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="truncate">{u.displayName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {(u.balance / 1000000).toFixed(0)}M
                      </span>
                    </button>
                  ))}

                  <div className="border-t border-slate-100 my-2 pt-1 flex flex-col gap-1">
                    <button
                      onClick={onOpenStats}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-slate-700 text-left cursor-pointer"
                    >
                      <BarChart3 className="w-4 h-4 text-orange-500" />
                      <span>Xem lịch sử & kết quả</span>
                    </button>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-red-50 text-red-600 text-left cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất tài khoản</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
