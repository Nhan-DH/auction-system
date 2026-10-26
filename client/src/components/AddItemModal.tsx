import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { useAuth } from '../context/AuthContext';
import { X, Plus } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1547996160-71dfabb1a7cf?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
];

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose }) => {
  const { addItemToQueue, activeRoom } = useAuction();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(SAMPLE_IMAGES[0]);
  const [startingPrice, setStartingPrice] = useState('50000000');
  const [stepPrice, setStepPrice] = useState('1000000');
  const [buyNowPrice, setBuyNowPrice] = useState('80000000');
  const [durationSeconds, setDurationSeconds] = useState(90);

  const isHost = currentUser && activeRoom && activeRoom.hostId === currentUser.id;
  if (!isOpen || !activeRoom || !isHost) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addItemToQueue({
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || SAMPLE_IMAGES[0],
      startingPrice: Number(startingPrice) || 1000000,
      stepPrice: Math.max(10000, Number(stepPrice) || 10000),
      buyNowPrice: Number(buyNowPrice) || 0,
      durationSeconds: Number(durationSeconds) || 90,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-orange-200 shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-800">
              Thêm Vật Phẩm Mới Vào Hàng Đợi
            </h3>
            <p className="text-[11px] text-slate-500">
              Phòng: {activeRoom.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên vật phẩm *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ví dụ: Đồng hồ Cartier Tank Francaise"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Link hình ảnh
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-orange-500 mb-2"
            />
            <div className="flex items-center gap-2">
              {SAMPLE_IMAGES.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="sample"
                  onClick={() => setImageUrl(img)}
                  className={`w-11 h-11 rounded-lg object-cover cursor-pointer border ${
                    imageUrl === img ? 'ring-2 ring-orange-500' : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Giá khởi điểm (VNĐ) *
              </label>
              <input
                type="number"
                min={10000}
                required
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Bước giá tối thiểu (≥10.000 đ)
              </label>
              <input
                type="number"
                min={10000}
                required
                value={stepPrice}
                onChange={(e) => setStepPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Giá Bán Ngay
              </label>
              <input
                type="number"
                value={buyNowPrice}
                onChange={(e) => setBuyNowPrice(e.target.value)}
                placeholder="0 nếu không có"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Thời lượng đấu giá (giây)
              </label>
              <select
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
              >
                <option value="60">60 giây</option>
                <option value="90">90 giây</option>
                <option value="120">120 giây</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả chi tiết
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tình trạng, xuất xứ, phụ kiện kèm theo..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              Thêm Vào Hàng Đợi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
