import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { useAuth } from '../context/AuthContext';
import {
  Gavel,
  Users,
  Plus,
  ArrowRight,
  Layers,
  Lock,
} from 'lucide-react';

interface RoomListProps {
  onOpenCreateRoom: () => void;
  onOpenSearch: () => void;
}

export const RoomList: React.FC<RoomListProps> = ({ onOpenCreateRoom, onOpenSearch }) => {
  const { rooms, joinRoom, activeRoom } = useAuction();
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<'all' | 'my_rooms'>('all');

  const filteredRooms = rooms.filter((r) => {
    if (filter === 'my_rooms' && currentUser) {
      return r.hostId === currentUser.id;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Sàn Đấu Giá Trực Tuyến
          </h1>
          <p className="text-orange-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            Tham gia phòng đấu giá thời gian thực, xem và đặt giá cho các vật phẩm trong hàng đợi hoặc tạo phòng đấu giá của bạn.
          </p>
        </div>

        <button
          onClick={onOpenCreateRoom}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-orange-50 text-orange-600 font-bold text-xs shadow-md transition cursor-pointer self-start sm:self-center shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Phòng Đấu Giá</span>
        </button>
      </div>

      {/* Rules Notice */}
      <div className="bg-white border border-orange-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-700 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span>
            <strong>Quy định:</strong> Tại một thời điểm, mỗi người chỉ được tham gia vào 1 phòng đấu giá.
          </span>
        </div>
        {activeRoom && (
          <span className="text-orange-600 font-semibold text-[11px]">
            Đang ở: {activeRoom.title}
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
            filter === 'all'
              ? 'bg-orange-500 text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100'
          }`}
        >
          Tất cả phòng đấu giá ({rooms.length})
        </button>
        {currentUser && (
          <button
            onClick={() => setFilter('my_rooms')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              filter === 'my_rooms'
                ? 'bg-orange-500 text-white font-bold'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Phòng tôi tạo
          </button>
        )}
      </div>

      {/* Room Grid */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs">
          Chưa có phòng đấu giá nào. Bấm "Tạo Phòng Đấu Giá" để bắt đầu!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => {
            const currentItem = room.currentItem;
            const isCurrentRoom = activeRoom?.id === room.id;

            return (
              <div
                key={room.id}
                className={`bg-white rounded-2xl border transition shadow-xs flex flex-col justify-between overflow-hidden ${
                  isCurrentRoom
                    ? 'border-orange-500 ring-2 ring-orange-100'
                    : 'border-slate-200 hover:border-orange-300 hover:shadow-md'
                }`}
              >
                {/* Room Info */}
                <div className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      ĐANG ĐẤU GIÁ
                    </span>

                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      {room.isPrivate && <Lock className="w-3.5 h-3.5 text-orange-500" />}
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        <Users className="w-3 h-3 text-orange-500" />
                        {room.participants?.length || 0} người
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-800 line-clamp-1">
                    {room.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {room.description || 'Phiên đấu giá công khai cho các thành viên tham gia.'}
                  </p>
                </div>

                {/* Current Item Preview */}
                <div className="px-5 py-2">
                  {currentItem ? (
                    <div className="p-2.5 rounded-xl bg-orange-50/60 border border-orange-100 flex items-center gap-3">
                      <img
                        src={currentItem.imageUrl}
                        alt={currentItem.title}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-orange-200"
                      />
                      <div className="overflow-hidden flex-1">
                        <span className="text-[10px] font-semibold text-orange-700 block uppercase">
                          Vật phẩm hiện tại:
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 truncate">
                          {currentItem.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs mt-0.5">
                          <span className="font-bold text-orange-600 font-mono">
                            {currentItem.currentPrice.toLocaleString('vi-VN')} đ
                          </span>
                          {currentItem.buyNowPrice > 0 && (
                            <span className="text-[10px] text-slate-500">
                              Mua ngay: {currentItem.buyNowPrice.toLocaleString('vi-VN')} đ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-orange-500" />
                        Hàng đợi vật phẩm:
                      </span>
                      <strong className="text-slate-800 font-mono">
                        {room.itemsQueue?.length || 0} vật phẩm
                      </strong>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 truncate">
                    Chủ phòng: <strong className="text-slate-700">{room.hostName}</strong>
                  </span>

                  <button
                    onClick={() => joinRoom(room.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      isCurrentRoom
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-xs'
                    }`}
                  >
                    <span>{isCurrentRoom ? 'Đang Trong Phòng' : 'Tham Gia Phòng'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
