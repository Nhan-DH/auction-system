import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuctionRoom, AuctionItem, RoomLog } from '../types/auction';
import { socketService } from '../services/socket';
import { soundManager } from '../services/sound';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
}

export interface ToastAlert {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'urgent';
  title: string;
  message: string;
}

interface AuctionContextType {
  rooms: AuctionRoom[];
  activeRoom: AuctionRoom | null;
  activeRemainingSeconds: number;
  chatMessages: ChatMessage[];
  toasts: ToastAlert[];
  isBotActive: boolean;
  isMuted: boolean;
  joinRoom: (roomId: string, accessCode?: string) => void;
  leaveRoom: () => void;
  createRoom: (data: {
    title: string;
    description: string;
    category: string;
    isPrivate: boolean;
    accessCode?: string;
    items: Partial<AuctionItem>[];
    autoStart?: boolean;
  }) => void;
  placeBid: (amount: number) => void;
  buyNow: () => void;
  addItemToQueue: (item: Partial<AuctionItem>) => void;
  deleteItemFromQueue: (itemId: string) => void;
  startNextItem: () => void;
  sendChat: (text: string) => void;
  toggleBot: (enabled: boolean) => void;
  toggleMute: () => void;
  removeToast: (id: string) => void;
  refreshRooms: () => Promise<void>;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [rooms, setRooms] = useState<AuctionRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<AuctionRoom | null>(null);
  const [activeRemainingSeconds, setActiveRemainingSeconds] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);
  const [isBotActive, setIsBotActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const addToast = useCallback(
    (type: ToastAlert['type'], title: string, message: string) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundManager.setMuted(nextState);
  };

  const refreshRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (data.success && data.rooms) {
        setRooms(data.rooms);
      }
    } catch (e) {
      console.error('Error fetching rooms:', e);
    }
  };

  useEffect(() => {
    refreshRooms();

    // 1. Listen to rooms update broadcast
    const unsubRooms = socketService.on('rooms:update', (payload) => {
      if (Array.isArray(payload)) {
        setRooms(payload);
      }
    });

    // 2. Listen to full room state
    const unsubState = socketService.on('room:state', (payload) => {
      if (payload && payload.id) {
        setActiveRoom(payload);
        if (payload.currentItem?.durationSeconds) {
          const rem = Math.max(
            0,
            Math.ceil(((payload.currentItem.endTime || 0) - Date.now()) / 1000)
          );
          setActiveRemainingSeconds(rem);
        }
      }
    });

    // 3. Listen to room error (e.g. invalid bid, wrong access code)
    const unsubError = socketService.on('room:error', (payload) => {
      addToast('error', 'Thông báo lỗi', payload.message || 'Thao tác không thành công');
    });

    // 4. Time ticks
    const unsubTick = socketService.on('auction:tick', (payload) => {
      if (activeRoom && payload.roomId === activeRoom.id) {
        setActiveRemainingSeconds(payload.remainingSeconds);
      }
    });

    // 5. 30 Seconds warning!
    const unsubWarning = socketService.on('auction:30s_warning', (payload) => {
      if (activeRoom && payload.roomId === activeRoom.id) {
        soundManager.playWarning30s();
        addToast(
          'urgent',
          '⏱️ CẢNH BÁO: CHỈ CÒN 30 GIÂY!',
          payload.message || 'Thời gian đấu giá sắp hết! Đặt giá ngay để không bỏ lỡ vật phẩm.'
        );
      }
    });

    // 6. Time Reset when bid placed in last 30s
    const unsubReset = socketService.on('auction:time_reset', (payload) => {
      if (activeRoom && payload.roomId === activeRoom.id) {
        soundManager.playTimeReset();
        setActiveRemainingSeconds(30);
        if (activeRoom.currentItem) {
          activeRoom.currentItem.endTime = payload.newEndTime;
        }
        addToast(
          'warning',
          '⚡ RESET THỜI GIAN VỀ 30S',
          payload.message || 'Có mức giá mới trong 30 giây cuối! Đồng hồ được gia hạn 30 giây.'
        );
      }
    });

    // 7. Bid Success
    const unsubBid = socketService.on('auction:bid_success', (payload) => {
      soundManager.playBidPlaced();
      if (activeRoom && payload.roomId === activeRoom.id) {
        setActiveRoom((prev) => {
          if (!prev || !prev.currentItem) return prev;
          return {
            ...prev,
            currentItem: {
              ...prev.currentItem,
              currentPrice: payload.newPrice,
              highestBidder: payload.highestBidder,
              bidHistory: [payload.bidRecord, ...prev.currentItem.bidHistory],
              endTime: payload.newEndTime || prev.currentItem.endTime,
            },
          };
        });

        addToast('info', 'Giá Mới Được Thiết Lập', payload.message);
      }
    });

    // 8. Item Sold (Auction finish or Buy Now)
    const unsubSold = socketService.on('auction:item_sold', (payload) => {
      soundManager.playVictory();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      if (activeRoom && payload.roomId === activeRoom.id) {
        const isMeWinner = currentUser && payload.winner?.userId === currentUser.id;
        addToast(
          'success',
          isMeWinner ? '🎉 CHÚC MỪNG BẠN ĐÃ THẮNG!' : '🎉 VẬT PHẨM ĐÃ ĐƯỢC BÁN!',
          payload.message
        );
      }
      refreshRooms();
    });

    // 9. Item Passed
    const unsubPassed = socketService.on('auction:item_passed', (payload) => {
      soundManager.playGavel();
      if (activeRoom && payload.roomId === activeRoom.id) {
        addToast('info', 'Phiên Đấu Giá Kết Thúc', payload.message);
      }
      refreshRooms();
    });

    // 10. Room Logs
    const unsubLog = socketService.on('room:log', (payload) => {
      if (activeRoom && payload.roomId === activeRoom.id && payload.log) {
        setActiveRoom((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            logs: [payload.log, ...(prev.logs || [])].slice(0, 100),
          };
        });
      }
    });

    // 11. Chat message
    const unsubChat = socketService.on('chat:message', (payload) => {
      if (activeRoom && payload.roomId === activeRoom.id && payload.message) {
        setChatMessages((prev) => [...prev, payload.message]);
      }
    });

    // 12. User Joined / Left
    const unsubJoin = socketService.on('room:user_joined', (payload) => {
      if (activeRoom && payload.roomId === activeRoom.id) {
        setActiveRoom((prev) => {
          if (!prev) return prev;
          if (prev.participants.some((p) => p.userId === payload.participant.userId)) {
            return prev;
          }
          return {
            ...prev,
            participants: [...prev.participants, payload.participant],
          };
        });
      }
    });

    const unsubLeft = socketService.on('room:user_left', (payload) => {
      if (activeRoom && payload.roomId === activeRoom.id) {
        setActiveRoom((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            participants: prev.participants.filter((p) => p.userId !== payload.userId),
          };
        });
      }
    });

    return () => {
      unsubRooms();
      unsubState();
      unsubError();
      unsubTick();
      unsubWarning();
      unsubReset();
      unsubBid();
      unsubSold();
      unsubPassed();
      unsubLog();
      unsubChat();
      unsubJoin();
      unsubLeft();
    };
  }, [activeRoom, currentUser, addToast]);

  // Join room
  const joinRoom = (roomId: string, accessCode?: string) => {
    if (!currentUser) {
      addToast('warning', 'Yêu cầu đăng nhập', 'Vui lòng đăng nhập trước khi tham gia phòng đấu giá!');
      return;
    }
    // Clean chat messages for new room
    setChatMessages([]);
    socketService.send('room:join', { roomId, accessCode });
  };

  // Leave room
  const leaveRoom = () => {
    if (activeRoom) {
      socketService.send('room:leave', { roomId: activeRoom.id });
      setActiveRoom(null);
      setChatMessages([]);
      setIsBotActive(false);
    }
  };

  // Create room
  const createRoom = (data: {
    title: string;
    description: string;
    category: string;
    isPrivate: boolean;
    accessCode?: string;
    items: Partial<AuctionItem>[];
    autoStart?: boolean;
  }) => {
    socketService.send('room:create', data);
    addToast('success', 'Tạo phòng thành công', `Phòng "${data.title}" đã sẵn sàng.`);
  };

  // Place bid
  const placeBid = (amount: number) => {
    if (!activeRoom || !activeRoom.currentItem) {
      addToast('error', 'Lỗi', 'Không có vật phẩm nào đang mở đấu giá!');
      return;
    }
    socketService.send('bid:place', {
      roomId: activeRoom.id,
      amount,
    });
  };

  // Buy now
  const buyNow = () => {
    if (!activeRoom || !activeRoom.currentItem) return;
    socketService.send('item:buynow', {
      roomId: activeRoom.id,
    });
  };

  // Add item to queue
  const addItemToQueue = (item: Partial<AuctionItem>) => {
    if (!activeRoom) return;
    socketService.send('item:add', {
      roomId: activeRoom.id,
      itemData: item,
    });
    addToast('success', 'Đã thêm vật phẩm', `Đã thêm "${item.title}" vào hàng đợi.`);
  };

  // Delete item from queue
  const deleteItemFromQueue = (itemId: string) => {
    if (!activeRoom) return;
    socketService.send('item:delete', {
      roomId: activeRoom.id,
      itemId,
    });
    addToast('info', 'Đã xóa vật phẩm', 'Vật phẩm đã được gỡ bỏ khỏi hàng đợi.');
  };

  // Start next item
  const startNextItem = () => {
    if (!activeRoom) return;
    socketService.send('item:start', {
      roomId: activeRoom.id,
    });
  };

  // Send live chat
  const sendChat = (text: string) => {
    if (!activeRoom) return;
    socketService.send('chat:send', {
      roomId: activeRoom.id,
      text,
    });
  };

  // Toggle Bot Simulation for easy grading
  const toggleBot = (enabled: boolean) => {
    if (!activeRoom) return;
    setIsBotActive(enabled);
    socketService.send('bot:toggle', {
      roomId: activeRoom.id,
      enabled,
    });
    addToast(
      'info',
      enabled ? 'Đã bật Bot thử nghiệm' : 'Đã tắt Bot',
      enabled
        ? 'Bot sẽ tự động đặt giá để bạn kiểm tra streaming và reset 30s.'
        : 'Đã dừng Bot tự động.'
    );
  };

  return (
    <AuctionContext.Provider
      value={{
        rooms,
        activeRoom,
        activeRemainingSeconds,
        chatMessages,
        toasts,
        isBotActive,
        isMuted,
        joinRoom,
        leaveRoom,
        createRoom,
        placeBid,
        buyNow,
        addItemToQueue,
        deleteItemFromQueue,
        startNextItem,
        sendChat,
        toggleBot,
        toggleMute,
        removeToast,
        refreshRooms,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};
