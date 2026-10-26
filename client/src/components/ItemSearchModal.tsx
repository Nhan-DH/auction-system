import React, { useState, useEffect } from 'react';
import { useAuction } from '../context/AuctionContext';
import { Search, X, Clock, ArrowRight, Filter } from 'lucide-react';
import { AuctionItem } from '../types/auction';

interface ItemSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResultItem {
  item: AuctionItem;
  room: {
    id: string;
    title: string;
    hostName: string;
    status: string;
    isPrivate: boolean;
  };
}

export const ItemSearchModal: React.FC<ItemSearchModalProps> = ({ isOpen, onClose }) => {
  const { joinRoom, activeRoom } = useAuction();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchSearch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set('q', query.trim());
        if (category !== 'all') params.set('category', category);
        if (status !== 'all') params.set('status', status);

        const res = await fetch(`/api/items/search?${params.toString()}`);
        const data = await res.json();
        if (data.success && data.results) {
          setResults(data.results);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSearch, 250);
    return () => clearTimeout(debounce);
  }, [query, category, status, isOpen]);

  if (!isOpen) return null;

  const handleJoin = (roomId: string) => {
    joinRoom(roomId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-orange-200 shadow-2xl p-6 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">
                Tìm Kiếm Vật Phẩm & Khung Giờ Đấu Giá
              </h3>
              <p className="text-[11px] text-slate-500">
                Tìm theo tên vật phẩm hoặc khung giờ để tham gia phòng ngay
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

        {/* Search Bar */}
        <div className="py-3 space-y-2 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập tên vật phẩm (Rolex, gốm sứ, iPhone, tranh...)"
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-xs text-slate-800"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500 flex items-center gap-1 text-[11px]">
              <Filter className="w-3 h-3 text-orange-500" /> Lọc:
            </span>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white"
            >
              <option value="all">Tất cả chuyên mục</option>
              <option value="watch">Đồng hồ & Trang sức</option>
              <option value="art">Tranh ảnh</option>
              <option value="antique">Cổ vật</option>
              <option value="tech">Công nghệ</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang đấu giá</option>
              <option value="queued">Trong hàng đợi</option>
              <option value="sold">Đã bán</option>
            </select>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
          {loading ? (
            <div className="text-center py-10 text-slate-400 text-xs">Đang tìm kiếm...</div>
          ) : results.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Không tìm thấy vật phẩm nào.
            </div>
          ) : (
            results.map(({ item, room }) => {
              const isActive = item.status === 'active';
              const isCurrentRoom = activeRoom?.id === room.id;

              return (
                <div
                  key={`${room.id}_${item.id}`}
                  className="p-3 rounded-xl border border-slate-200 hover:border-orange-300 bg-slate-50/60 hover:bg-orange-50/20 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200"
                    />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isActive ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-100 text-red-700">
                            ĐANG ĐẤU GIÁ
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-200 text-slate-700">
                            HÀNG ĐỢI #{item.queueOrder}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-orange-500" />
                          {item.scheduledTime || (isActive ? 'Hiện tại' : 'Chờ mở')}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-800 truncate mt-0.5">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        Phòng: <strong>{room.title}</strong> • Chủ: {room.hostName}
                      </p>

                      <div className="flex items-center gap-3 text-xs mt-0.5">
                        <span className="text-slate-600">
                          Giá hiện tại: <strong className="text-orange-600 font-mono">{item.currentPrice.toLocaleString('vi-VN')} đ</strong>
                        </span>
                        {item.buyNowPrice > 0 && (
                          <span className="text-slate-500 text-[10px]">
                            Mua ngay: <strong className="text-orange-700 font-mono">{item.buyNowPrice.toLocaleString('vi-VN')} đ</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isCurrentRoom ? (
                      <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-lg">
                        Đang ở phòng
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoin(room.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                      >
                        <span>Vào Phòng Đấu Giá</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
