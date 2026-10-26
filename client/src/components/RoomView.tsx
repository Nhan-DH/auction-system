import React, { useState, useEffect } from 'react';
import { useAuction } from '../context/AuctionContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Gavel,
  Clock,
  Zap,
  Users,
  Plus,
  Trash2,
  Send,
  MessageSquare,
  History,
  Layers,
  AlertTriangle,
  Play,
  Bot,
  Volume2,
  VolumeX,
  Wallet,
  Maximize2,
  Minimize2,
  FileText,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { AddItemModal } from './AddItemModal';

interface RoomViewProps {
  onOpenDeposit?: () => void;
}

export const RoomView: React.FC<RoomViewProps> = ({ onOpenDeposit }) => {
  const {
    activeRoom,
    leaveRoom,
    activeRemainingSeconds,
    placeBid,
    buyNow,
    deleteItemFromQueue,
    startNextItem,
    sendChat,
    chatMessages,
    isBotActive,
    toggleBot,
    isMuted,
    toggleMute,
  } = useAuction();

  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'queue' | 'bids' | 'history' | 'logs' | 'chat'>('queue');
  const [customBidAmount, setCustomBidAmount] = useState<string>('');
  const [chatInput, setChatInput] = useState<string>('');
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  if (!activeRoom) return null;

  const currentItem = activeRoom.currentItem;
  const isHost = currentUser && activeRoom.hostId === currentUser.id;
  const currentPrice = currentItem ? currentItem.currentPrice : 0;
  const minRequiredBid = currentItem ? currentPrice + (currentItem.stepPrice || 10000) : 0;
  const isLast30Seconds = activeRemainingSeconds <= 30 && activeRemainingSeconds > 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleQuickBid = (increment: number) => {
    if (!currentItem) return;
    placeBid(currentPrice + increment);
  };

  const handleCustomBid = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(customBidAmount);
    if (!amount || amount < minRequiredBid) return;
    placeBid(amount);
    setCustomBidAmount('');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChat(chatInput.trim());
    setChatInput('');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 overflow-hidden font-sans select-none">
      {/* 1. TOP HEADER BAR (Full Width, Sleek Studio Bar) */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-20">
        {/* Left: Back button & Room details */}
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={leaveRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer shrink-0"
            title="Rời phòng về sảnh chính"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Rời Phòng</span>
          </button>

          <div className="w-px h-5 bg-slate-200 hidden sm:block" />

          {/* Live Indicator */}
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white flex items-center gap-1.5 tracking-wider uppercase shrink-0 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            TRỰC TIẾP
          </span>

          <div className="overflow-hidden">
            <h1 className="text-sm sm:text-base font-extrabold text-slate-800 truncate leading-tight">
              {activeRoom.title}
            </h1>
            <p className="text-[10px] text-slate-500 truncate hidden md:block">
              Chủ phòng: <strong className="text-slate-700">{activeRoom.hostName}</strong>
              {isHost && <span className="text-orange-600 font-bold ml-1">(Bạn)</span>}
            </p>
          </div>
        </div>

        {/* Right: Controls, Stats, Bot, Wallet */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active Participants count */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-xs text-slate-700 font-semibold">
            <Users className="w-3.5 h-3.5 text-orange-500" />
            <span>{activeRoom.participants?.length || 0}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-orange-600" />}
          </button>

          {/* Bot Demo Toggle */}
          <button
            onClick={() => toggleBot(!isBotActive)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
              isBotActive
                ? 'bg-purple-100 text-purple-700 border border-purple-300 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
            title="Bật Bot tự động đặt giá để thử nghiệm chức năng streaming và reset 30s"
          >
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">{isBotActive ? 'Bot Bật' : 'Bot Demo'}</span>
          </button>

          {/* User Wallet Balance */}
          {currentUser && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-700">
              <Wallet className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-mono">{(currentUser.balance / 1000000).toFixed(0)}M đ</span>
              {onOpenDeposit && (
                <button
                  onClick={onOpenDeposit}
                  className="ml-1 text-[10px] bg-orange-500 hover:bg-orange-600 text-white px-1.5 py-0.2 rounded font-bold transition cursor-pointer"
                >
                  +Nạp
                </button>
              )}
            </div>
          )}

          {/* Native Fullscreen Toggle */}
          <button
            onClick={toggleNativeFullscreen}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer hidden sm:block"
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình trình duyệt'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. MAIN STAGE & SIDEBAR (Occupies 100% remaining height) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT / CENTER: AUCTION STAGE & BIDDING CONSOLE */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 space-y-4 justify-between bg-slate-100">
          {/* 30s Warning Alert Bar */}
          {isLast30Seconds && (
            <div className="bg-red-500 text-white font-black text-xs sm:text-sm py-2 px-4 rounded-xl flex items-center justify-center gap-2 animate-pulse shadow-md tracking-wide text-center shrink-0">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span>
                ⚠️ CẢNH BÁO: CHỈ CÒN {activeRemainingSeconds}S! CÓ LỆNH ĐẶT GIÁ MỚI SẼ TỰ ĐỘNG GIA HẠN THÊM 30 GIÂY!
              </span>
            </div>
          )}

          {currentItem ? (
            <div className="flex-1 flex flex-col justify-between space-y-4">
              {/* STAGE MAIN CARD */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* High-res Image on the Left of Stage */}
                  <div className="md:col-span-5 relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-inner group">
                    <img
                      src={currentItem.imageUrl}
                      alt={currentItem.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-orange-500 text-white shadow-md">
                        #{currentItem.queueOrder}
                      </span>
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-xs uppercase border border-slate-200 shadow-xs">
                        {currentItem.category}
                      </span>
                    </div>
                  </div>

                  {/* Item Specs & Countdown & Live Price on the Right of Stage */}
                  <div className="md:col-span-7 flex flex-col justify-between space-y-3.5">
                    <div>
                      <h2 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight leading-snug">
                        {currentItem.title}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {currentItem.description}
                      </p>
                    </div>

                    {/* Digital Countdown Timer */}
                    <div
                      className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                        isLast30Seconds
                          ? 'bg-red-50 border-red-300 text-red-600 animate-pulse ring-2 ring-red-400/30'
                          : 'bg-orange-50/80 border-orange-200 text-orange-950'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className={`w-6 h-6 ${isLast30Seconds ? 'text-red-500' : 'text-orange-600'}`} />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {isLast30Seconds ? 'ĐANG ĐẾM NGƯỢC 30S' : 'THỜI GIAN CÒN LẠI'}
                          </p>
                          <p className="text-xs text-slate-600 font-medium">Tự động kết thúc khi hết giờ</p>
                        </div>
                      </div>
                      <span className="text-3xl font-black font-mono tracking-tight">
                        {formatTime(activeRemainingSeconds)}
                      </span>
                    </div>

                    {/* Electronic Price Showcase */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Giá Cao Nhất Hiện Tại:
                        </span>
                        <p className="text-2xl sm:text-3xl font-black text-orange-600 font-mono tracking-tight mt-0.5">
                          {currentPrice.toLocaleString('vi-VN')} đ
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Khởi điểm: {currentItem.startingPrice.toLocaleString('vi-VN')} đ • Bước giá: +{(currentItem.stepPrice || 10000).toLocaleString('vi-VN')} đ
                        </p>
                      </div>

                      {/* Leading Bidder pill */}
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2.5 shrink-0">
                        {currentItem.highestBidder ? (
                          <>
                            <img
                              src={currentItem.highestBidder.userAvatar}
                              alt={currentItem.highestBidder.userName}
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-orange-400 shrink-0"
                            />
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                                {currentItem.highestBidder.userName}
                              </p>
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                <Award className="w-3 h-3" /> Đang dẫn đầu
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-slate-400 italic px-2 py-1">
                            Chưa có ai đặt giá
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Host Restriction Banner if user is the Room Host */}
                {isHost && (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Quy Định Minh Bạch: Bạn Là Chủ Phòng Đấu Giá</span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed max-w-lg mx-auto">
                      Chủ phòng <strong>không thể tham gia tố giá hoặc mua ngay</strong> sản phẩm của chính mình nhằm đảm bảo tính công bằng. Bạn có toàn quyền quản lý hàng đợi, thêm hoặc xóa vật phẩm ở bảng bên phải.
                    </p>
                  </div>
                )}

                {/* BUY NOW BAR (For participants only) */}
                {!isHost && currentItem.buyNowPrice > 0 && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div>
                      <span className="text-xs font-bold text-orange-800 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-orange-600 fill-orange-600" />
                        Giá Mua Ngay Trực Tiếp (Không cần chờ đấu giá)
                      </span>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Chốt sở hữu sản phẩm ngay lập tức với giá quy định của chủ phòng.
                      </p>
                    </div>

                    <button
                      onClick={buyNow}
                      className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase shadow-sm transition cursor-pointer self-start sm:self-center shrink-0 flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4 fill-white" />
                      <span>MUA NGAY: {currentItem.buyNowPrice.toLocaleString('vi-VN')} đ</span>
                    </button>
                  </div>
                )}
              </div>

              {/* BIDDING CONSOLE BAR (For participants only) */}
              {!isHost && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Gavel className="w-4 h-4 text-orange-500" />
                      Bảng Điều Khiển Đặt Lệnh Tố Giá:
                    </span>
                    <span className="text-orange-700 font-semibold">
                      Tối thiểu cần đặt: <strong>{minRequiredBid.toLocaleString('vi-VN')} đ</strong> (≥ giá hiện tại + 10.000 đ)
                    </span>
                  </div>

                  {/* Quick Increments */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { label: '+10.000 đ', add: 10000 },
                      { label: '+50.000 đ', add: 50000 },
                      { label: '+500.000 đ', add: 500000 },
                      { label: '+1.000.000 đ', add: 1000000 },
                      { label: '+5.000.000 đ', add: 5000000 },
                    ].map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickBid(btn.add)}
                        className="py-2.5 px-1 rounded-xl bg-slate-50 hover:bg-orange-500 hover:text-white border border-slate-200 text-xs font-black text-slate-700 transition cursor-pointer text-center shadow-xs"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Bid Input */}
                  <form onSubmit={handleCustomBid} className="flex gap-2 pt-1">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min={minRequiredBid}
                        step={10000}
                        value={customBidAmount}
                        onChange={(e) => setCustomBidAmount(e.target.value)}
                        placeholder={`Nhập số tiền muốn tố (tối thiểu ${minRequiredBid.toLocaleString('vi-VN')} đ)`}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-xs sm:text-sm text-slate-800 font-mono font-bold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-orange-500/20 transition cursor-pointer shrink-0"
                    >
                      Tố Giá Ngay
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* Finished All Items in Room */
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 my-auto shadow-sm">
              <Gavel className="w-16 h-16 text-orange-500 mx-auto" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                Phiên Đấu Giá Hiện Đã Hoàn Tất Các Vật Phẩm
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Tất cả các sản phẩm trong hàng đợi đã được đấu giá hoàn tất. Chủ phòng có thể bổ sung thêm vật phẩm mới vào hàng đợi để tiếp tục phiên bán!
              </p>
              {isHost && (
                <button
                  onClick={() => setIsAddItemOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Vật Phẩm Mới Vào Hàng Đợi</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: QUEUE, LIVE BIDS, HISTORY, CHAT & LOGS */}
        <aside className="w-full lg:w-96 xl:w-[420px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-72 lg:h-full overflow-hidden shrink-0 shadow-sm z-10">
          {/* Tabs Navigation Header */}
          <div className="flex bg-slate-100 p-1.5 border-b border-slate-200 text-xs font-semibold shrink-0">
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex-1 py-2 px-1 rounded-xl transition text-center cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-white text-orange-600 font-extrabold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hàng đợi ({activeRoom.itemsQueue?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('bids')}
              className={`flex-1 py-2 px-1 rounded-xl transition text-center cursor-pointer ${
                activeTab === 'bids'
                  ? 'bg-white text-orange-600 font-extrabold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tố giá ({currentItem?.bidHistory?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 px-1 rounded-xl transition text-center cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-orange-600 font-extrabold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã bán ({activeRoom.completedItems?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 px-1 rounded-xl transition text-center cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white text-orange-600 font-extrabold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chat & Log
            </button>
          </div>

          {/* TAB 1: QUEUE MANAGEMENT */}
          {activeTab === 'queue' && (
            <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
                <div>
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5 uppercase">
                    <Layers className="w-4 h-4 text-orange-500" />
                    Hàng Đợi Vật Phẩm Kế Tiếp
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Sản phẩm sẽ được đưa ra đấu giá tuần tự
                  </p>
                </div>
                {isHost && (
                  <button
                    onClick={() => setIsAddItemOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm</span>
                  </button>
                )}
              </div>

              {activeRoom.itemsQueue.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs my-auto">
                  Hàng đợi hiện không còn sản phẩm nào chờ.
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {activeRoom.itemsQueue.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-orange-200 transition"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                          #{idx + 1}
                        </span>
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div className="overflow-hidden">
                          <h5 className="font-bold text-xs text-slate-800 truncate max-w-[170px]">
                            {item.title}
                          </h5>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Khởi điểm: {item.startingPrice.toLocaleString('vi-VN')} đ
                          </p>
                          {item.buyNowPrice > 0 && (
                            <span className="text-[10px] text-orange-600 font-semibold font-mono">
                              Mua ngay: {item.buyNowPrice.toLocaleString('vi-VN')} đ
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Host Actions: Delete */}
                      {isHost && (
                        <button
                          onClick={() => deleteItemFromQueue(item.id)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer transition shrink-0"
                          title="Xóa vật phẩm này khỏi hàng đợi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE BIDS FEED */}
          {activeTab === 'bids' && (
            <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-2">
              <h4 className="font-bold text-xs text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-1.5 uppercase shrink-0">
                <Gavel className="w-4 h-4 text-orange-500" />
                Lịch Sử Đặt Giá Trực Tuyến
              </h4>

              {!currentItem?.bidHistory || currentItem.bidHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs my-auto">
                  Chưa có lượt đặt giá nào cho vật phẩm hiện tại.
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {currentItem.bidHistory.map((bid, i) => (
                    <div
                      key={bid.id || i}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                        i === 0
                          ? 'bg-orange-50 border-orange-200 shadow-xs'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <img
                          src={bid.userAvatar}
                          alt={bid.userName}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                        <div className="overflow-hidden">
                          <p className="font-bold text-xs text-slate-800 truncate">
                            {bid.userName}
                            {i === 0 && (
                              <span className="ml-1 text-[9px] px-1.5 py-0.2 bg-orange-500 text-white rounded font-black">
                                CAO NHẤT
                              </span>
                            )}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(bid.timestamp).toLocaleTimeString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-black text-orange-600">
                        {bid.amount.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMPLETED ITEMS HISTORY */}
          {activeTab === 'history' && (
            <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-2">
              <h4 className="font-bold text-xs text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-1.5 uppercase shrink-0">
                <History className="w-4 h-4 text-orange-500" />
                Vật Phẩm Đã Bán Xong
              </h4>

              {activeRoom.completedItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs my-auto">
                  Chưa có sản phẩm nào kết thúc trong phiên này.
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {activeRoom.completedItems.map((cItem) => (
                    <div
                      key={cItem.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <img
                          src={cItem.imageUrl}
                          alt={cItem.title}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                        />
                        <div className="overflow-hidden">
                          <h5 className="font-bold text-xs text-slate-800 truncate max-w-[160px]">
                            {cItem.title}
                          </h5>
                          {cItem.status === 'sold' ? (
                            <p className="text-[10px] text-emerald-600 font-bold truncate">
                              ✓ Thắng: {cItem.winnerName}
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-400 italic">Bỏ qua</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-orange-600 block">
                          {(cItem.finalPrice || cItem.currentPrice).toLocaleString('vi-VN')} đ
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {cItem.soldType === 'buynow' ? 'Mua ngay' : 'Đấu giá'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LIVE CHAT & AUDIT LOGS */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5 uppercase">
                  <MessageSquare className="w-4 h-4 text-orange-500" />
                  Thảo Luận & Log Hệ Thống
                </h4>
              </div>

              {/* Chat & Logs list */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {/* Recent system logs */}
                {activeRoom.logs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className={`p-2 rounded-xl text-[11px] border leading-snug ${
                      log.type === 'warning' || log.type === 'reset'
                        ? 'bg-orange-50 border-orange-200 text-orange-800 font-bold'
                        : log.type === 'buynow' || log.type === 'item_end'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="font-mono text-[9px] text-slate-400 mr-1.5">
                      {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                    </span>
                    <span>{log.message}</span>
                  </div>
                ))}

                {/* User Chat messages */}
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2">
                    <img
                      src={msg.userAvatar}
                      alt={msg.userName}
                      className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="bg-slate-100 p-2 rounded-xl max-w-[85%] text-xs">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-bold text-slate-800 text-[11px]">{msg.userName}</span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-slate-700">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Send Box */}
              <form onSubmit={handleSendChat} className="pt-2 border-t border-slate-100 flex gap-1.5 shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Gửi bình luận vào phòng..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-orange-500"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white cursor-pointer transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </aside>
      </div>

      {/* Add Item Modal */}
      <AddItemModal isOpen={isAddItemOpen} onClose={() => setIsAddItemOpen(false)} />
    </div>
  );
};
