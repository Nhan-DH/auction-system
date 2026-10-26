import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Award, DollarSign, Gavel, Calendar, CheckCircle } from 'lucide-react';
import { UserStats } from '../types/auction';

interface UserStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserStatsModal: React.FC<UserStatsModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !currentUser) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${currentUser.id}/stats`);
        const data = await res.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      } catch (e) {
        console.error('Failed to fetch user stats:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-orange-200 shadow-2xl p-6 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <img
              src={currentUser.avatar}
              alt={currentUser.displayName}
              className="w-10 h-10 rounded-full object-cover border-2 border-orange-400"
            />
            <div>
              <h3 className="font-bold text-base text-slate-800">
                Thống Kê Hoạt Động Của Tôi
              </h3>
              <p className="text-[11px] text-slate-500">
                {currentUser.displayName} (@{currentUser.username})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {loading || !stats ? (
            <div className="text-center py-10 text-slate-400 text-xs">Đang tải số liệu...</div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-100">
                  <div className="flex items-center gap-1.5 text-orange-700 text-xs font-semibold mb-0.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>Thắng được</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800 font-mono">{stats.itemsWonCount}</p>
                  <p className="text-[10px] text-slate-500">vật phẩm</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold mb-0.5">
                    <DollarSign className="w-3.5 h-3.5 text-orange-500" />
                    <span>Tổng tiền chi</span>
                  </div>
                  <p className="text-lg font-bold text-orange-600 font-mono">
                    {(stats.totalSpent / 1000000).toFixed(0)}M đ
                  </p>
                  <p className="text-[10px] text-slate-500">thanh toán</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold mb-0.5">
                    <Gavel className="w-3.5 h-3.5 text-orange-500" />
                    <span>Số lần tố</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800 font-mono">{stats.bidsCount}</p>
                  <p className="text-[10px] text-slate-500">lượt đặt giá</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold mb-0.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                    <span>Phòng tham gia</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800 font-mono">{stats.roomsJoinedCount}</p>
                  <p className="text-[10px] text-slate-500">phòng</p>
                </div>
              </div>

              {/* Won Items List */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5 mb-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Vật Phẩm Đã Thắng ({stats.wonItems.length})
                </h4>

                {stats.wonItems.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    Bạn chưa thắng vật phẩm nào. Hãy tham gia phòng và đặt giá hoặc Mua Ngay!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stats.wonItems.map(({ item, roomTitle, date }, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="overflow-hidden">
                            <h5 className="font-bold text-xs text-slate-800 truncate max-w-xs">
                              {item.title}
                            </h5>
                            <p className="text-[10px] text-slate-500">
                              Phòng: {roomTitle} • {new Date(date).toLocaleTimeString('vi-VN')} {new Date(date).toLocaleDateString('vi-VN')}
                            </p>
                            <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 inline-block mt-0.5">
                              {item.soldType === 'buynow' ? '⚡ Mua ngay' : '🔨 Thắng đấu giá'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="block text-xs font-mono font-bold text-orange-600">
                            {(item.finalPrice || 0).toLocaleString('vi-VN')} đ
                          </span>
                          <span className="text-[10px] text-emerald-600 font-medium">Hoàn tất</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
