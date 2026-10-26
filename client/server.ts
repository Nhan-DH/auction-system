import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  User,
  AuctionRoom,
  AuctionItem,
  Participant,
  RoomLog,
  SocketMessage,
} from './src/types/auction.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json());

// ==========================================
// IN-MEMORY DATA STORE
// ==========================================

const users = new Map<string, User>();
const rooms = new Map<string, AuctionRoom>();
// User ID -> Room ID: Strictly enforce 1 room per user at a time
const userCurrentRoomMap = new Map<string, string>();
// User ID -> WebSocket connection
const userSockets = new Map<string, WebSocket>();
// WebSocket -> User ID
const socketUsers = new Map<WebSocket, string>();
// Track 30-second warning state per room item to prevent duplicate sound/toast spam
const warned30sItems = new Set<string>();
// Bot simulation intervals
const roomBotIntervals = new Map<string, NodeJS.Timeout>();

// Preload initial test users
const initialUsers: User[] = [
  {
    id: 'user_1',
    username: 'hoangnhan',
    displayName: 'Nguyễn Hoàng Nhân',
    email: 'hongnhan474747@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    balance: 500000000, // 500M VND
    currentRoomId: null,
    joinedAt: Date.now() - 3600000,
    password: '123456',
  },
  {
    id: 'user_2',
    username: 'minhquan',
    displayName: 'Trần Minh Quân',
    email: 'minhquan@vip.vn',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    balance: 350000000,
    currentRoomId: null,
    joinedAt: Date.now() - 7200000,
    password: '123456',
  },
  {
    id: 'user_3',
    username: 'thaovy',
    displayName: 'Phạm Thảo Vy',
    email: 'thaovy.art@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    balance: 200000000,
    currentRoomId: null,
    joinedAt: Date.now() - 86400000,
    password: '123456',
  },
  {
    id: 'user_4',
    username: 'ducanh',
    displayName: 'Vũ Đức Anh',
    email: 'ducanh.tech@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    balance: 150000000,
    currentRoomId: null,
    joinedAt: Date.now() - 86400000,
    password: '123456',
  },
];

initialUsers.forEach((u) => users.set(u.id, u));

// Preload initial rooms & items
const now = Date.now();

const room1Id = 'room_luxury_watches';
const room1CurrentItem: AuctionItem = {
  id: 'item_rolex_126610',
  roomId: room1Id,
  title: 'Đồng Hồ Rolex Submariner Date 126610LN Oystersteel 41mm',
  description: 'Đồng hồ nguyên bản chính hãng Thụy Sĩ, mặt số đen huyền bí, vành gốm Cerachrom đen, bộ máy 3235 mới nhất, trữ cót 70h. Đầy đủ hộp sổ thẻ bảo hành quốc tế 2025.',
  imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
  category: 'watch',
  startingPrice: 280000000,
  currentPrice: 310000000,
  stepPrice: 10000000,
  buyNowPrice: 420000000,
  durationSeconds: 90,
  status: 'active',
  startTime: now,
  endTime: now + 85000,
  highestBidder: {
    userId: 'user_2',
    userName: 'Trần Minh Quân',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    amount: 310000000,
    timestamp: now - 5000,
  },
  bidHistory: [
    {
      id: 'bid_1',
      userId: 'user_3',
      userName: 'Phạm Thảo Vy',
      userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      amount: 290000000,
      timestamp: now - 35000,
      type: 'bid',
    },
    {
      id: 'bid_2',
      userId: 'user_2',
      userName: 'Trần Minh Quân',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      amount: 310000000,
      timestamp: now - 5000,
      type: 'bid',
    },
  ],
  winnerId: null,
  finalPrice: null,
  soldType: null,
  queueOrder: 1,
  scheduledTime: 'Hôm nay, 15:00',
};

const room1Queue: AuctionItem[] = [
  {
    id: 'item_patek_5711',
    roomId: room1Id,
    title: 'Patek Philippe Nautilus 5711/1R-001 Vàng Hồng 18k Cực Phẩm',
    description: 'Tuyệt tác huyền thoại từ Patek Philippe bằng vàng hồng 18k nguyên khối, mặt số chocolate chuyển màu. Tình trạng như mới (Like New 99%).',
    imageUrl: 'https://images.unsplash.com/photo-1547996160-71dfabb1a7cf?auto=format&fit=crop&w=800&q=80',
    category: 'watch',
    startingPrice: 1800000000,
    currentPrice: 1800000000,
    stepPrice: 20000000,
    buyNowPrice: 2500000000,
    durationSeconds: 120,
    status: 'queued',
    startTime: null,
    endTime: null,
    highestBidder: null,
    bidHistory: [],
    winnerId: null,
    finalPrice: null,
    soldType: null,
    queueOrder: 2,
    scheduledTime: 'Sau vật phẩm số 1',
  },
  {
    id: 'item_audemars_royal',
    roomId: room1Id,
    title: 'Audemars Piguet Royal Oak Chronograph 26331ST Mặt Xanh Blue',
    description: 'Thiết kế kinh điển của Gerald Genta, thép không gỉ 41mm, họa tiết Grand Tapisserie xanh navy mê hoặc.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    category: 'watch',
    startingPrice: 850000000,
    currentPrice: 850000000,
    stepPrice: 15000000,
    buyNowPrice: 1200000000,
    durationSeconds: 90,
    status: 'queued',
    startTime: null,
    endTime: null,
    highestBidder: null,
    bidHistory: [],
    winnerId: null,
    finalPrice: null,
    soldType: null,
    queueOrder: 3,
    scheduledTime: 'Sau vật phẩm số 2',
  },
];

const room1: AuctionRoom = {
  id: room1Id,
  title: 'Sàn Đấu Giá Đồng Hồ & Trang Sức Hoàng Gia VIP',
  description: 'Phiên đấu giá quy tụ những tuyệt phẩm đồng hồ xa xỉ từ Thụy Sĩ: Rolex, Patek Philippe, Audemars Piguet được kiểm định minh bạch.',
  hostId: 'user_1',
  hostName: 'Nguyễn Hoàng Nhân',
  hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  category: 'watch',
  isPrivate: false,
  status: 'live',
  participants: [
    {
      userId: 'user_2',
      displayName: 'Trần Minh Quân',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      joinedAt: now - 180000,
    },
  ],
  itemsQueue: room1Queue,
  currentItem: room1CurrentItem,
  completedItems: [
    {
      id: 'item_cartier_santos',
      roomId: room1Id,
      title: 'Cartier Santos de Cartier Large WSSA0009',
      description: 'Dáng vỏ vuông huyền thoại từ Pháp, đính ốc vít đặc trưng.',
      imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
      category: 'watch',
      startingPrice: 150000000,
      currentPrice: 185000000,
      stepPrice: 5000000,
      buyNowPrice: 220000000,
      durationSeconds: 90,
      status: 'sold',
      startTime: now - 300000,
      endTime: now - 210000,
      highestBidder: {
        userId: 'user_1',
        userName: 'Nguyễn Hoàng Nhân',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        amount: 185000000,
        timestamp: now - 220000,
      },
      bidHistory: [],
      winnerId: 'user_1',
      winnerName: 'Nguyễn Hoàng Nhân',
      finalPrice: 185000000,
      soldType: 'auction',
      queueOrder: 0,
    },
  ],
  logs: [
    {
      id: 'log_1',
      timestamp: now - 180000,
      type: 'info',
      message: 'Phiên đấu giá đã được khởi tạo bởi Nguyễn Hoàng Nhân.',
    },
    {
      id: 'log_2',
      timestamp: now - 150000,
      type: 'join',
      message: 'Trần Minh Quân đã tham gia phòng đấu giá.',
    },
    {
      id: 'log_3',
      timestamp: now - 85000,
      type: 'item_start',
      message: 'Bắt đầu đấu giá vật phẩm: Rolex Submariner Date 126610LN với giá khởi điểm 280.000.000 đ.',
    },
    {
      id: 'log_4',
      timestamp: now - 5000,
      type: 'bid',
      message: 'Trần Minh Quân đã tố giá mới: 310.000.000 đ.',
    },
  ],
  createdAt: now - 600000,
};

// Room 2: Art & Antiques
const room2Id = 'room_art_antiques';
const room2CurrentItem: AuctionItem = {
  id: 'item_dongho_ceramics',
  roomId: room2Id,
  title: 'Bình Gốm Chu Đậu Vẽ Lam Men Rạn Thế Kỷ XV Triều Lê',
  description: 'Cổ vật bình hoa gốm men lam xuất xứ lò Chu Đậu Hải Dương, họa tiết hoa sen và chim thiên nga cổ, vết men rạn tự nhiên theo thời gian.',
  imageUrl: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?auto=format&fit=crop&w=800&q=80',
  category: 'antique',
  startingPrice: 65000000,
  currentPrice: 75000000,
  stepPrice: 5000000,
  buyNowPrice: 130000000,
  durationSeconds: 120,
  status: 'active',
  startTime: now - 10000,
  endTime: now + 110000,
  highestBidder: {
    userId: 'user_3',
    userName: 'Phạm Thảo Vy',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    amount: 75000000,
    timestamp: now - 5000,
  },
  bidHistory: [
    {
      id: 'bid_r2_1',
      userId: 'user_3',
      userName: 'Phạm Thảo Vy',
      userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      amount: 75000000,
      timestamp: now - 5000,
      type: 'bid',
    },
  ],
  winnerId: null,
  finalPrice: null,
  soldType: null,
  queueOrder: 1,
  scheduledTime: 'Hôm nay, 16:30',
};

const room2Queue: AuctionItem[] = [
  {
    id: 'item_painting_sen',
    roomId: room2Id,
    title: 'Tranh Lụa Cổ "Thiếu Nữ Bên Hoa Sen" Nghệ Thuật Đông Dương',
    description: 'Tác phẩm tranh lụa tả thực phong cách trường Cao đẳng Mỹ thuật Đông Dương thập niên 1940, màu sắc êm dịu, bảo quản tuyệt hảo.',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    category: 'art',
    startingPrice: 120000000,
    currentPrice: 120000000,
    stepPrice: 10000000,
    buyNowPrice: 260000000,
    durationSeconds: 120,
    status: 'queued',
    startTime: null,
    endTime: null,
    highestBidder: null,
    bidHistory: [],
    winnerId: null,
    finalPrice: null,
    soldType: null,
    queueOrder: 2,
    scheduledTime: 'Kế tiếp',
  },
];

const room2: AuctionRoom = {
  id: room2Id,
  title: 'Phiên Đấu Giá Cổ Vật & Tranh Nghệ Thuật Đông Dương',
  description: 'Không gian tôn vinh các giá trị di sản văn hóa, gốm sứ cổ truyền và tác phẩm hội họa danh họa Việt Nam.',
  hostId: 'user_3',
  hostName: 'Phạm Thảo Vy',
  hostAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  category: 'art',
  isPrivate: false,
  status: 'live',
  participants: [],
  itemsQueue: room2Queue,
  currentItem: room2CurrentItem,
  completedItems: [],
  logs: [
    {
      id: 'log_r2_1',
      timestamp: now - 120000,
      type: 'info',
      message: 'Phòng đấu giá cổ vật được tạo bởi Phạm Thảo Vy.',
    },
    {
      id: 'log_r2_2',
      timestamp: now - 10000,
      type: 'item_start',
      message: 'Bắt đầu đấu giá: Bình Gốm Chu Đậu Vẽ Lam Men Rạn Thế Kỷ XV.',
    },
  ],
  createdAt: now - 500000,
};

// Room 3: High Tech
const room3Id = 'room_tech_flagship';
const room3: AuctionRoom = {
  id: room3Id,
  title: 'Sàn Đấu Giá Đồ Công Nghệ & Flagship Độc Bản',
  description: 'Bộ sưu tập thiết bị công nghệ giới hạn, số serial may mắn, tai nghe cao cấp và laptop cấu hình khủng.',
  hostId: 'user_4',
  hostName: 'Vũ Đức Anh',
  hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  category: 'tech',
  isPrivate: false,
  status: 'live',
  participants: [],
  itemsQueue: [
    {
      id: 'item_iphone16_promax',
      roomId: room3Id,
      title: 'iPhone 16 Pro Max 1TB Sa Mạc Titan - Serial Số Đẹp VIP 8888',
      description: 'Bản quốc tế LL/A, nguyên seal hộp Apple Store, số serial kết thúc tứ quý 8 cực phong thủy.',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      category: 'tech',
      startingPrice: 38000000,
      currentPrice: 42000000,
      stepPrice: 1000000,
      buyNowPrice: 55000000,
      durationSeconds: 90,
      status: 'active',
      startTime: now - 20000,
      endTime: now + 70000,
      highestBidder: null,
      bidHistory: [],
      winnerId: null,
      finalPrice: null,
      soldType: null,
      queueOrder: 1,
      scheduledTime: 'Hôm nay, 17:00',
    },
    {
      id: 'item_macbook_m3max',
      roomId: room3Id,
      title: 'MacBook Pro 16 inch M3 Max (16 CPU / 40 GPU / 64GB / 2TB SSD)',
      description: 'Máy trạm di động khủng nhất cho đồ họa và AI, bàn phím US, màu Space Black sang trọng.',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      category: 'tech',
      startingPrice: 80000000,
      currentPrice: 80000000,
      stepPrice: 2000000,
      buyNowPrice: 110000000,
      durationSeconds: 90,
      status: 'queued',
      startTime: null,
      endTime: null,
      highestBidder: null,
      bidHistory: [],
      winnerId: null,
      finalPrice: null,
      soldType: null,
      queueOrder: 2,
      scheduledTime: 'Kế tiếp',
    },
  ],
  currentItem: null,
  completedItems: [],
  logs: [
    {
      id: 'log_r3_1',
      timestamp: now - 100000,
      type: 'info',
      message: 'Phòng đấu giá công nghệ được tạo bởi Vũ Đức Anh.',
    },
  ],
  createdAt: now - 300000,
};

// Make sure room3 currentItem is item_iphone16_promax and active
room3.currentItem = room3.itemsQueue.shift() || null;
if (room3.currentItem) {
  room3.currentItem.status = 'active';
  room3.currentItem.startTime = now;
  room3.currentItem.endTime = now + 90000;
}

rooms.set(room1.id, room1);
rooms.set(room2.id, room2);
rooms.set(room3.id, room3);

// Assign user_2 to room1
userCurrentRoomMap.set('user_2', room1.id);

// ==========================================
// BROADCAST HELPERS
// ==========================================

function broadcastToAll(message: SocketMessage) {
  const json = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

function broadcastToRoom(roomId: string, message: SocketMessage) {
  const room = rooms.get(roomId);
  if (!room) return;
  const json = JSON.stringify(message);

  // Send to all participants in this room + room host
  const recipientIds = new Set<string>();
  room.participants.forEach((p) => recipientIds.add(p.userId));
  if (room.hostId) recipientIds.add(room.hostId);

  recipientIds.forEach((userId) => {
    const ws = userSockets.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(json);
    }
  });
}

function broadcastRoomsList() {
  const roomList = Array.from(rooms.values()).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    hostId: r.hostId,
    hostName: r.hostName,
    category: r.category,
    isPrivate: r.isPrivate,
    status: r.status,
    participantCount: r.participants.length,
    currentItem: r.currentItem,
    itemsQueueCount: r.itemsQueue.length,
    completedItemsCount: r.completedItems.length,
    createdAt: r.createdAt,
  }));

  broadcastToAll({
    type: 'rooms:update',
    payload: roomList,
    timestamp: Date.now(),
  });
}

function addRoomLog(
  room: AuctionRoom,
  type: RoomLog['type'],
  message: string,
  data?: any
) {
  const log: RoomLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    type,
    message,
    data,
  };
  room.logs.unshift(log);
  if (room.logs.length > 100) room.logs.pop();

  broadcastToRoom(room.id, {
    type: 'room:log',
    payload: { roomId: room.id, log },
    timestamp: Date.now(),
  });
}

// Start an item in the room
function startItemAuction(room: AuctionRoom, item: AuctionItem) {
  const durationMs = (item.durationSeconds || 60) * 1000;
  item.status = 'active';
  item.startTime = Date.now();
  item.endTime = Date.now() + durationMs;
  room.currentItem = item;
  warned30sItems.delete(item.id);

  addRoomLog(
    room,
    'item_start',
    `Bắt đầu đấu giá vật phẩm: "${item.title}". Giá khởi điểm: ${item.startingPrice.toLocaleString('vi-VN')} đ. Thời gian: ${item.durationSeconds} giây.`,
    { itemId: item.id }
  );

  broadcastToRoom(room.id, {
    type: 'room:state',
    payload: room,
    timestamp: Date.now(),
  });
  broadcastRoomsList();
}

// Move to next item in queue
function advanceRoomQueue(room: AuctionRoom) {
  if (room.itemsQueue.length > 0) {
    const nextItem = room.itemsQueue.shift()!;
    startItemAuction(room, nextItem);
  } else {
    room.currentItem = null;
    room.status = 'completed';
    addRoomLog(
      room,
      'info',
      'Đã hoàn thành toàn bộ danh sách vật phẩm trong phiên đấu giá này!'
    );
    broadcastToRoom(room.id, {
      type: 'room:state',
      payload: room,
      timestamp: Date.now(),
    });
    broadcastRoomsList();
  }
}

// Finalize an item when time runs out or buy now occurs
function finalizeCurrentItem(
  room: AuctionRoom,
  soldType: 'auction' | 'buynow',
  forcedWinner?: { userId: string; userName: string; amount: number }
) {
  const item = room.currentItem;
  if (!item || item.status !== 'active') return;

  const winner = forcedWinner || item.highestBidder;

  if (winner) {
    item.status = 'sold';
    item.soldType = soldType;
    item.winnerId = winner.userId;
    item.winnerName = winner.userName;
    item.finalPrice = winner.amount;

    // Deduct user balance
    const user = users.get(winner.userId);
    if (user && user.balance >= winner.amount) {
      user.balance -= winner.amount;
      const ws = userSockets.get(user.id);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'user:balance_update',
            payload: { balance: user.balance },
            timestamp: Date.now(),
          })
        );
      }
    }

    room.completedItems.unshift({ ...item });

    const winMsg =
      soldType === 'buynow'
        ? `🔥 MUA NGAY THÀNH CÔNG! "${winner.userName}" đã chốt mua ngay "${item.title}" với giá ${winner.amount.toLocaleString('vi-VN')} đ mà không cần qua đấu giá!`
        : `🎉 ĐÃ BÁN! Gõ búa thành công! "${item.title}" đã thuộc về "${winner.userName}" với giá chốt ${winner.amount.toLocaleString('vi-VN')} đ!`;

    addRoomLog(room, soldType === 'buynow' ? 'buynow' : 'item_end', winMsg, {
      itemId: item.id,
      winner,
      soldType,
    });

    broadcastToRoom(room.id, {
      type: 'auction:item_sold',
      payload: {
        roomId: room.id,
        item,
        winner,
        soldType,
        message: winMsg,
      },
      timestamp: Date.now(),
    });
  } else {
    // No bids placed: Passed
    item.status = 'passed';
    room.completedItems.unshift({ ...item });

    const passMsg = `Hết thời gian đấu giá. Vật phẩm "${item.title}" không có người đặt giá và đã bị bỏ qua (Passed).`;
    addRoomLog(room, 'item_end', passMsg, { itemId: item.id });

    broadcastToRoom(room.id, {
      type: 'auction:item_passed',
      payload: {
        roomId: room.id,
        item,
        message: passMsg,
      },
      timestamp: Date.now(),
    });
  }

  // Clear current item and auto advance or await host
  room.currentItem = null;
  broadcastToRoom(room.id, {
    type: 'room:state',
    payload: room,
    timestamp: Date.now(),
  });
  broadcastRoomsList();

  // Schedule auto advance to next item in queue after 6 seconds
  setTimeout(() => {
    if (room.itemsQueue.length > 0 && !room.currentItem) {
      advanceRoomQueue(room);
    }
  }, 6000);
}

// ==========================================
// SERVER-AUTHORITATIVE TICK LOOP (Every 1s)
// ==========================================

setInterval(() => {
  const currentNow = Date.now();

  rooms.forEach((room) => {
    const item = room.currentItem;
    if (!item || item.status !== 'active' || !item.endTime) return;

    const remainingMs = item.endTime - currentNow;
    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

    // 1. Broadcast time tick to all room participants
    broadcastToRoom(room.id, {
      type: 'auction:tick',
      payload: {
        roomId: room.id,
        itemId: item.id,
        remainingSeconds,
        endTime: item.endTime,
      },
      timestamp: currentNow,
    });

    // 2. 30 Seconds warning check:
    // "Khi thời gian đấu giá còn 30 giây, gửi thông báo đến tất cả những người tham gia đấu giá thời gian sắp hết"
    if (remainingSeconds <= 30 && remainingSeconds > 0 && !warned30sItems.has(item.id)) {
      warned30sItems.add(item.id);

      const warnMsg = `⚠️ THỜI GIAN SẮP HẾT! Chỉ còn 30 giây để đặt giá cho vật phẩm "${item.title}"!`;
      addRoomLog(room, 'warning', warnMsg, {
        itemId: item.id,
        remainingSeconds,
      });

      broadcastToRoom(room.id, {
        type: 'auction:30s_warning',
        payload: {
          roomId: room.id,
          itemId: item.id,
          remainingSeconds,
          message: warnMsg,
        },
        timestamp: currentNow,
      });
    }

    // 3. Time's up check
    if (remainingSeconds <= 0) {
      finalizeCurrentItem(room, 'auction');
    }
  });
}, 1000);

// ==========================================
// WEBSOCKET DISPATCHER & PROTOCOL
// ==========================================

wss.on('connection', (ws) => {
  let authenticatedUserId: string | null = null;

  ws.on('message', (rawData) => {
    try {
      const msg: SocketMessage = JSON.parse(rawData.toString());
      const { type, payload } = msg;

      switch (type) {
        // ----------------------------------------------------
        // AUTHENTICATION
        // ----------------------------------------------------
        case 'auth': {
          const { userId } = payload || {};
          let user = users.get(userId);
          if (!user) {
            // Pick default user 1 or create
            user = users.get('user_1')!;
          }

          authenticatedUserId = user.id;
          userSockets.set(user.id, ws);
          socketUsers.set(ws, user.id);

          ws.send(
            JSON.stringify({
              type: 'auth:ack',
              payload: {
                user,
                currentRoomId: userCurrentRoomMap.get(user.id) || null,
              },
              timestamp: Date.now(),
            })
          );
          break;
        }

        // ----------------------------------------------------
        // ROOM JOIN
        // RULE: "Tại một thời điểm, mỗi người chỉ được tham gia vào 1 phòng đấu giá."
        // ----------------------------------------------------
        case 'room:join': {
          if (!authenticatedUserId) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: { message: 'Vui lòng đăng nhập trước khi tham gia phòng đấu giá!' },
              })
            );
            return;
          }

          const { roomId, accessCode } = payload || {};
          const room = rooms.get(roomId);
          if (!room) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: { message: 'Phòng đấu giá không tồn tại hoặc đã đóng!' },
              })
            );
            return;
          }

          if (room.isPrivate && room.accessCode && room.accessCode !== accessCode) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: { message: 'Mã PIN truy cập phòng riêng tư không chính xác!' },
              })
            );
            return;
          }

          const user = users.get(authenticatedUserId);
          if (!user) return;

          // Check if user is currently in another room
          const previousRoomId = userCurrentRoomMap.get(user.id);
          if (previousRoomId && previousRoomId !== roomId) {
            const prevRoom = rooms.get(previousRoomId);
            if (prevRoom) {
              prevRoom.participants = prevRoom.participants.filter(
                (p) => p.userId !== user.id
              );
              addRoomLog(
                prevRoom,
                'leave',
                `"${user.displayName}" đã rời phòng để tham gia phòng khác.`
              );
              broadcastToRoom(prevRoom.id, {
                type: 'room:user_left',
                payload: { roomId: prevRoom.id, userId: user.id },
                timestamp: Date.now(),
              });
            }
          }

          // Register in new room
          userCurrentRoomMap.set(user.id, roomId);
          user.currentRoomId = roomId;

          // Add to participant list if not already present
          if (!room.participants.some((p) => p.userId === user.id)) {
            const participant: Participant = {
              userId: user.id,
              displayName: user.displayName,
              avatar: user.avatar,
              joinedAt: Date.now(),
            };
            room.participants.push(participant);
          }

          addRoomLog(
            room,
            'join',
            `"${user.displayName}" đã tham gia phòng đấu giá.`
          );

          // Broadcast user joined
          broadcastToRoom(room.id, {
            type: 'room:user_joined',
            payload: {
              roomId: room.id,
              participant: {
                userId: user.id,
                displayName: user.displayName,
                avatar: user.avatar,
              },
            },
            timestamp: Date.now(),
          });

          // Send complete room state back to user
          ws.send(
            JSON.stringify({
              type: 'room:state',
              payload: room,
              timestamp: Date.now(),
            })
          );

          broadcastRoomsList();
          break;
        }

        // ----------------------------------------------------
        // ROOM LEAVE
        // ----------------------------------------------------
        case 'room:leave': {
          if (!authenticatedUserId) return;
          const { roomId } = payload || {};
          const room = rooms.get(roomId);
          if (room) {
            room.participants = room.participants.filter(
              (p) => p.userId !== authenticatedUserId
            );
            const user = users.get(authenticatedUserId);
            if (user) {
              addRoomLog(
                room,
                'leave',
                `"${user.displayName}" đã rời khỏi phòng đấu giá.`
              );
            }
            broadcastToRoom(room.id, {
              type: 'room:user_left',
              payload: { roomId: room.id, userId: authenticatedUserId },
              timestamp: Date.now(),
            });
          }
          userCurrentRoomMap.delete(authenticatedUserId);
          const u = users.get(authenticatedUserId);
          if (u) u.currentRoomId = null;

          broadcastRoomsList();
          break;
        }

        // ----------------------------------------------------
        // ROOM CREATE
        // ----------------------------------------------------
        case 'room:create': {
          if (!authenticatedUserId) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: { message: 'Cần đăng nhập để tạo phòng đấu giá!' },
              })
            );
            return;
          }

          const host = users.get(authenticatedUserId);
          if (!host) return;

          const newRoomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const initialItems: AuctionItem[] = (payload.items || []).map(
            (rawItem: any, index: number) => ({
              id: `item_${Date.now()}_${index}`,
              roomId: newRoomId,
              title: rawItem.title || 'Vật phẩm đấu giá',
              description: rawItem.description || '',
              imageUrl:
                rawItem.imageUrl ||
                'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
              category: rawItem.category || 'luxury',
              startingPrice: Number(rawItem.startingPrice) || 1000000,
              currentPrice: Number(rawItem.startingPrice) || 1000000,
              stepPrice: Math.max(10000, Number(rawItem.stepPrice) || 50000),
              buyNowPrice: Number(rawItem.buyNowPrice) || 0,
              durationSeconds: Number(rawItem.durationSeconds) || 90,
              status: 'queued',
              startTime: null,
              endTime: null,
              highestBidder: null,
              bidHistory: [],
              winnerId: null,
              finalPrice: null,
              soldType: null,
              queueOrder: index + 1,
              scheduledTime: rawItem.scheduledTime || 'Theo thứ tự hàng đợi',
            })
          );

          const newRoom: AuctionRoom = {
            id: newRoomId,
            title: payload.title || `Phòng đấu giá của ${host.displayName}`,
            description: payload.description || '',
            hostId: host.id,
            hostName: host.displayName,
            hostAvatar: host.avatar,
            category: payload.category || 'luxury',
            isPrivate: Boolean(payload.isPrivate),
            accessCode: payload.accessCode || '',
            status: 'waiting',
            participants: [],
            itemsQueue: initialItems,
            currentItem: null,
            completedItems: [],
            logs: [
              {
                id: `log_${Date.now()}`,
                timestamp: Date.now(),
                type: 'info',
                message: `Phòng đấu giá được tạo bởi "${host.displayName}". Số lượng vật phẩm trong hàng đợi: ${initialItems.length}.`,
              },
            ],
            createdAt: Date.now(),
          };

          // Always start first item immediately so room is actively auctioning
          if (newRoom.itemsQueue.length > 0) {
            newRoom.status = 'live';
            const firstItem = newRoom.itemsQueue.shift()!;
            startItemAuction(newRoom, firstItem);
          } else {
            newRoom.status = 'live';
          }

          rooms.set(newRoom.id, newRoom);
          broadcastRoomsList();

          ws.send(
            JSON.stringify({
              type: 'room:state',
              payload: newRoom,
              timestamp: Date.now(),
            })
          );
          break;
        }

        // ----------------------------------------------------
        // BID PLACEMENT
        // RULES:
        // - Lệnh đặt giá hợp lệ: lớn hơn giá hiện tại ít nhất 10.000 đồng
        // - Khi thời gian còn <= 30s: nếu có người trả giá mới trong 30s cuối, reset thời gian còn lại về 30s!
        // ----------------------------------------------------
        case 'bid:place': {
          if (!authenticatedUserId) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: { message: 'Vui lòng đăng nhập để tham gia đặt giá!' },
              })
            );
            return;
          }

          const { roomId, amount } = payload || {};
          const room = rooms.get(roomId);
          if (!room || !room.currentItem || room.currentItem.status !== 'active') {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: { message: 'Hiện tại không có vật phẩm nào đang mở đấu giá trong phòng này!' },
              })
            );
            return;
          }

          const item = room.currentItem;
          const user = users.get(authenticatedUserId);
          if (!user) return;

          // Rule: Chủ phòng KHÔNG THỂ đấu giá sản phẩm của chính mình!
          if (room.hostId === authenticatedUserId) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: {
                  message: 'Bạn là chủ phòng! Bạn không thể tự đấu giá sản phẩm trong phòng của chính mình.',
                },
              })
            );
            return;
          }

          const numAmount = Number(amount);
          const currentPrice = item.currentPrice;
          const minRequired = currentPrice + 10000;

          // Check minimum increment >= 10.000 VNĐ
          if (numAmount < minRequired) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: {
                  message: `Giá đặt không hợp lệ! Lệnh đặt giá phải lớn hơn giá hiện tại (${currentPrice.toLocaleString('vi-VN')} đ) ít nhất 10.000 đ. Tối thiểu cần đặt: ${minRequired.toLocaleString('vi-VN')} đ!`,
                },
              })
            );
            return;
          }

          // Check user balance
          if (user.balance < numAmount) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: {
                  message: `Số dư tài khoản không đủ (${user.balance.toLocaleString('vi-VN')} đ) để đặt mức giá ${numAmount.toLocaleString('vi-VN')} đ! Vui lòng nạp thêm tiền.`,
                },
              })
            );
            return;
          }

          // Check if user is already highest bidder
          if (item.highestBidder?.userId === user.id) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: {
                  message: 'Bạn hiện đã là người trả giá cao nhất! Hãy đợi người khác tố giá trước khi đặt tiếp.',
                },
              })
            );
            return;
          }

          // Update item current price & highest bidder
          item.currentPrice = numAmount;
          item.highestBidder = {
            userId: user.id,
            userName: user.displayName,
            userAvatar: user.avatar,
            amount: numAmount,
            timestamp: Date.now(),
          };

          const newBid: any = {
            id: `bid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: user.id,
            userName: user.displayName,
            userAvatar: user.avatar,
            amount: numAmount,
            timestamp: Date.now(),
            type: 'bid',
          };
          item.bidHistory.unshift(newBid);

          // CRITICAL REQUIREMENT:
          // "Nếu có người trả giá mới trong vòng 30 giây cuối, reset thời gian còn lại về 30 giây"
          const curNow = Date.now();
          const remainingSec = Math.max(0, Math.ceil(((item.endTime || 0) - curNow) / 1000));
          let timeReset = false;

          if (remainingSec <= 30) {
            item.endTime = curNow + 30000; // Reset exactly to 30 seconds
            timeReset = true;
            // Clear warning flag so participants get notified if it counts down again
            warned30sItems.delete(item.id);

            const resetMsg = `⚡ GIA HẠN 30S! Có mức giá mới trong 30 giây cuối từ "${user.displayName}". Thời gian đấu giá được tự động reset về 30 giây!`;
            addRoomLog(room, 'reset', resetMsg, {
              itemId: item.id,
              newEndTime: item.endTime,
            });

            broadcastToRoom(room.id, {
              type: 'auction:time_reset',
              payload: {
                roomId: room.id,
                itemId: item.id,
                newRemainingSeconds: 30,
                newEndTime: item.endTime,
                message: resetMsg,
              },
              timestamp: curNow,
            });
          }

          const bidMsg = `💰 "${user.displayName}" vừa tố giá mới: ${numAmount.toLocaleString('vi-VN')} đ cho "${item.title}"!`;
          addRoomLog(room, 'bid', bidMsg, {
            itemId: item.id,
            amount: numAmount,
            bidder: user.displayName,
          });

          // Broadcast bid success to room
          broadcastToRoom(room.id, {
            type: 'auction:bid_success',
            payload: {
              roomId: room.id,
              itemId: item.id,
              newPrice: numAmount,
              highestBidder: item.highestBidder,
              bidRecord: newBid,
              timeReset,
              newEndTime: item.endTime,
              message: bidMsg,
            },
            timestamp: curNow,
          });

          broadcastRoomsList();
          break;
        }

        // ----------------------------------------------------
        // BUY NOW (MUA TRỰC TIẾP / MUA NGAY)
        // RULE: "Nếu có người đặt mua với giá bán ngay, vật phẩm được bán mà không phải qua đấu giá."
        // ----------------------------------------------------
        case 'item:buynow': {
          if (!authenticatedUserId) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: { message: 'Vui lòng đăng nhập để mua ngay!' },
              })
            );
            return;
          }

          const { roomId } = payload || {};
          const room = rooms.get(roomId);
          if (!room || !room.currentItem || room.currentItem.status !== 'active') {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: { message: 'Không có vật phẩm nào đang mở đấu giá để mua ngay!' },
              })
            );
            return;
          }

          const item = room.currentItem;
          if (!item.buyNowPrice || item.buyNowPrice <= 0) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: { message: 'Vật phẩm này không hỗ trợ tùy chọn Giá Bán Ngay!' },
              })
            );
            return;
          }

          const user = users.get(authenticatedUserId);
          if (!user) return;

          // Rule: Chủ phòng KHÔNG THỂ tự mua sản phẩm của chính mình!
          if (room.hostId === authenticatedUserId) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: {
                  message: 'Bạn là chủ phòng! Bạn không thể tự mua ngay sản phẩm của chính mình.',
                },
              })
            );
            return;
          }

          if (user.balance < item.buyNowPrice) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: {
                  message: `Số dư không đủ để Mua Ngay với giá ${item.buyNowPrice.toLocaleString('vi-VN')} đ!`,
                },
              })
            );
            return;
          }

          // Trigger immediate finalize with buy now
          finalizeCurrentItem(room, 'buynow', {
            userId: user.id,
            userName: user.displayName,
            amount: item.buyNowPrice,
          });
          break;
        }

        // ----------------------------------------------------
        // QUEUE MANAGEMENT: ADD ITEM TO QUEUE (Tạo vật phẩm)
        // ----------------------------------------------------
        case 'item:add': {
          if (!authenticatedUserId) return;
          const { roomId, itemData } = payload || {};
          const room = rooms.get(roomId);
          if (!room) return;

          if (room.hostId !== authenticatedUserId) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: { message: 'Chỉ chủ phòng mới có quyền thêm vật phẩm vào hàng đợi!' },
              })
            );
            return;
          }

          const newItem: AuctionItem = {
            id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            roomId: room.id,
            title: itemData.title || 'Vật phẩm đấu giá mới',
            description: itemData.description || '',
            imageUrl:
              itemData.imageUrl ||
              'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
            category: itemData.category || room.category,
            startingPrice: Number(itemData.startingPrice) || 1000000,
            currentPrice: Number(itemData.startingPrice) || 1000000,
            stepPrice: Math.max(10000, Number(itemData.stepPrice) || 50000),
            buyNowPrice: Number(itemData.buyNowPrice) || 0,
            durationSeconds: Number(itemData.durationSeconds) || 90,
            status: 'queued',
            startTime: null,
            endTime: null,
            highestBidder: null,
            bidHistory: [],
            winnerId: null,
            finalPrice: null,
            soldType: null,
            queueOrder: room.itemsQueue.length + 1,
            scheduledTime: itemData.scheduledTime || 'Kế tiếp',
          };

          room.itemsQueue.push(newItem);

          // If room has no active item, host can immediately start it
          if (!room.currentItem && room.status !== 'completed') {
            const first = room.itemsQueue.shift()!;
            room.status = 'live';
            startItemAuction(room, first);
          } else {
            addRoomLog(
              room,
              'info',
              `Chủ phòng đã thêm vật phẩm "${newItem.title}" vào hàng đợi (vị trí #${room.itemsQueue.length}).`
            );
            broadcastToRoom(room.id, {
              type: 'room:state',
              payload: room,
              timestamp: Date.now(),
            });
          }

          broadcastRoomsList();
          break;
        }

        // ----------------------------------------------------
        // QUEUE MANAGEMENT: DELETE ITEM (Xóa vật phẩm trong phòng)
        // ----------------------------------------------------
        case 'item:delete': {
          if (!authenticatedUserId) return;
          const { roomId, itemId } = payload || {};
          const room = rooms.get(roomId);
          if (!room) return;

          if (room.hostId !== authenticatedUserId) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: { message: 'Chỉ chủ phòng mới có quyền xóa vật phẩm trong hàng đợi!' },
              })
            );
            return;
          }

          const itemToDelete = room.itemsQueue.find((i) => i.id === itemId);
          if (itemToDelete) {
            room.itemsQueue = room.itemsQueue.filter((i) => i.id !== itemId);
            addRoomLog(
              room,
              'info',
              `Chủ phòng đã gỡ bỏ vật phẩm "${itemToDelete.title}" khỏi hàng đợi.`
            );
            broadcastToRoom(room.id, {
              type: 'room:state',
              payload: room,
              timestamp: Date.now(),
            });
            broadcastRoomsList();
          }
          break;
        }

        // ----------------------------------------------------
        // QUEUE MANAGEMENT: START NEXT ITEM (Host trigger)
        // ----------------------------------------------------
        case 'item:start': {
          if (!authenticatedUserId) return;
          const { roomId } = payload || {};
          const room = rooms.get(roomId);
          if (!room) return;

          if (room.hostId !== authenticatedUserId) {
            ws.send(
              JSON.stringify({
                type: 'room:error',
                payload: { message: 'Chỉ chủ phòng mới có quyền kích hoạt vật phẩm tiếp theo!' },
              })
            );
            return;
          }

          advanceRoomQueue(room);
          break;
        }

        // ----------------------------------------------------
        // ROOM LIVE CHAT
        // ----------------------------------------------------
        case 'chat:send': {
          if (!authenticatedUserId) return;
          const { roomId, text } = payload || {};
          const room = rooms.get(roomId);
          const user = users.get(authenticatedUserId);
          if (!room || !user || !text?.trim()) return;

          const chatPayload = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: user.id,
            userName: user.displayName,
            userAvatar: user.avatar,
            text: text.trim(),
            timestamp: Date.now(),
          };

          broadcastToRoom(room.id, {
            type: 'chat:message',
            payload: { roomId: room.id, message: chatPayload },
            timestamp: Date.now(),
          });
          break;
        }

        // ----------------------------------------------------
        // BONUS: TOGGLE SIMULATED BOT BIDDER (For testing real-time stream!)
        // ----------------------------------------------------
        case 'bot:toggle': {
          const { roomId, enabled } = payload || {};
          const room = rooms.get(roomId);
          if (!room) return;

          if (enabled) {
            if (roomBotIntervals.has(roomId)) return;

            const botUsers = [
              { name: 'Nguyễn Văn Tuấn (Bot VIP)', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' },
              { name: 'Đặng Mai Lan (Bot Sưu Tầm)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
              { name: 'Hoàng Long (Bot Đại Gia)', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80' },
            ];

            const interval = setInterval(() => {
              const currentItem = room.currentItem;
              if (!currentItem || currentItem.status !== 'active') return;

              // Pick random bot
              const bot = botUsers[Math.floor(Math.random() * botUsers.length)];
              const curNow = Date.now();
              const remainingSec = Math.max(0, Math.ceil(((currentItem.endTime || 0) - curNow) / 1000));

              // Increment by stepPrice or random step
              const step = currentItem.stepPrice || 50000;
              const newAmount = currentItem.currentPrice + step;

              currentItem.currentPrice = newAmount;
              currentItem.highestBidder = {
                userId: `bot_${bot.name}`,
                userName: bot.name,
                userAvatar: bot.avatar,
                amount: newAmount,
                timestamp: curNow,
              };

              const newBid: any = {
                id: `bid_${curNow}`,
                userId: `bot_${bot.name}`,
                userName: bot.name,
                userAvatar: bot.avatar,
                amount: newAmount,
                timestamp: curNow,
                type: 'bid',
              };
              currentItem.bidHistory.unshift(newBid);

              // 30s reset check
              let timeReset = false;
              if (remainingSec <= 30) {
                currentItem.endTime = curNow + 30000;
                timeReset = true;
                warned30sItems.delete(currentItem.id);

                const resetMsg = `⚡ GIA HẠN 30S! "${bot.name}" vừa tố giá trong 30 giây cuối! Đã reset thời gian về 30 giây!`;
                addRoomLog(room, 'reset', resetMsg);
                broadcastToRoom(room.id, {
                  type: 'auction:time_reset',
                  payload: {
                    roomId: room.id,
                    itemId: currentItem.id,
                    newRemainingSeconds: 30,
                    newEndTime: currentItem.endTime,
                    message: resetMsg,
                  },
                  timestamp: curNow,
                });
              }

              const bidMsg = `🤖 "${bot.name}" vừa tố giá: ${newAmount.toLocaleString('vi-VN')} đ!`;
              addRoomLog(room, 'bid', bidMsg);

              broadcastToRoom(room.id, {
                type: 'auction:bid_success',
                payload: {
                  roomId: room.id,
                  itemId: currentItem.id,
                  newPrice: newAmount,
                  highestBidder: currentItem.highestBidder,
                  bidRecord: newBid,
                  timeReset,
                  newEndTime: currentItem.endTime,
                  message: bidMsg,
                },
                timestamp: curNow,
              });
            }, 8000);

            roomBotIntervals.set(roomId, interval);
            addRoomLog(room, 'info', '🤖 Đã kích hoạt Bot thử nghiệm tố giá tự động!');
          } else {
            const interval = roomBotIntervals.get(roomId);
            if (interval) {
              clearInterval(interval);
              roomBotIntervals.delete(roomId);
              addRoomLog(room, 'info', '🤖 Đã tắt Bot thử nghiệm.');
            }
          }
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('Socket message parse error:', err);
    }
  });

  ws.on('close', () => {
    if (authenticatedUserId) {
      userSockets.delete(authenticatedUserId);
      socketUsers.delete(ws);
    }
  });
});

// ==========================================
// REST APIS FOR COMPLIANCE & EXPORTS
// ==========================================

// Get all rooms
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.values()).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    hostId: r.hostId,
    hostName: r.hostName,
    category: r.category,
    isPrivate: r.isPrivate,
    status: r.status,
    participantCount: r.participants.length,
    currentItem: r.currentItem,
    itemsQueueCount: r.itemsQueue.length,
    completedItemsCount: r.completedItems.length,
    createdAt: r.createdAt,
  }));
  res.json({ success: true, rooms: roomList });
});

// Get room details
app.get('/api/rooms/:id', (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found' });
  }
  res.json({ success: true, room });
});

// Search items across all rooms
// "Tìm kiếm các vật phẩm đấu giá theo khung giờ hoặc theo thông tin vật phẩm, khi tìm được, cho phép join vào phòng đấu giá và chờ đợi đấu giá hoặc đấu giá (nếu đang diễn ra)"
app.get('/api/items/search', (req, res) => {
  const query = ((req.query.q as string) || '').toLowerCase().trim();
  const category = (req.query.category as string) || '';
  const status = (req.query.status as string) || '';

  const results: Array<{
    item: AuctionItem;
    room: {
      id: string;
      title: string;
      hostName: string;
      status: string;
      isPrivate: boolean;
    };
  }> = [];

  rooms.forEach((room) => {
    const allItems: AuctionItem[] = [];
    if (room.currentItem) allItems.push(room.currentItem);
    allItems.push(...room.itemsQueue);
    allItems.push(...room.completedItems);

    allItems.forEach((item) => {
      let matchesQuery = true;
      if (query) {
        matchesQuery = Boolean(
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.scheduledTime && item.scheduledTime.toLowerCase().includes(query))
        );
      }

      let matchesCategory = true;
      if (category && category !== 'all') {
        matchesCategory = item.category === category;
      }

      let matchesStatus = true;
      if (status && status !== 'all') {
        matchesStatus = item.status === status;
      }

      if (matchesQuery && matchesCategory && matchesStatus) {
        results.push({
          item,
          room: {
            id: room.id,
            title: room.title,
            hostName: room.hostName,
            status: room.status,
            isPrivate: room.isPrivate,
          },
        });
      }
    });
  });

  res.json({ success: true, results });
});

// User registration & management
app.post('/api/users/register', (req, res) => {
  const { username, password, displayName, email, avatar, initialBalance } = req.body;
  if (!username || !displayName) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin đăng ký!' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Mật khẩu phải có tối thiểu 6 ký tự!' });
  }

  // Check existing username
  const existing = Array.from(users.values()).find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'Tên đăng nhập đã tồn tại trong hệ thống!' });
  }

  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    username,
    displayName,
    email: email || `${username}@auction.vn`,
    avatar:
      avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    balance: Number(initialBalance) || 100000000, // 100M VND default
    currentRoomId: null,
    joinedAt: Date.now(),
    password: password || '123456',
  };

  users.set(newUser.id, newUser);
  res.json({ success: true, user: newUser });
});

// User login
app.post('/api/users/login', (req, res) => {
  const { username, password } = req.body;
  const user = Array.from(users.values()).find(
    (u) => u.username.toLowerCase() === (username || '').toLowerCase()
  );
  if (!user) {
    return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại!' });
  }

  // Check password if provided and user has a password
  if (password && user.password && user.password !== password) {
    return res.status(400).json({ success: false, message: 'Mật khẩu không chính xác! Vui lòng thử lại.' });
  }

  res.json({ success: true, user });
});

// User list for quick switch during grading
app.get('/api/users', (req, res) => {
  res.json({ success: true, users: Array.from(users.values()) });
});

// User deposit balance (Nạp tiền ví)
app.post('/api/users/:id/deposit', (req, res) => {
  const user = users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
  }
  const amount = Number(req.body.amount) || 50000000;
  user.balance += amount;

  const ws = userSockets.get(user.id);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: 'user:balance_update',
        payload: { balance: user.balance },
        timestamp: Date.now(),
      })
    );
  }

  res.json({ success: true, user });
});

// User stats
// "Xem thống kê những phiên đấu giá đã tham gia và kết quả"
app.get('/api/users/:id/stats', (req, res) => {
  const userId = req.params.id;
  const user = users.get(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  let bidsCount = 0;
  let itemsWonCount = 0;
  let totalSpent = 0;
  const wonItems: any[] = [];
  let roomsCreatedCount = 0;
  const roomsJoinedSet = new Set<string>();

  rooms.forEach((room) => {
    if (room.hostId === userId) {
      roomsCreatedCount++;
    }
    if (room.participants.some((p) => p.userId === userId)) {
      roomsJoinedSet.add(room.id);
    }

    const checkItem = (item: AuctionItem) => {
      item.bidHistory.forEach((b) => {
        if (b.userId === userId) bidsCount++;
      });
      if (item.winnerId === userId) {
        itemsWonCount++;
        totalSpent += item.finalPrice || 0;
        wonItems.push({
          item,
          roomTitle: room.title,
          date: item.endTime || Date.now(),
        });
      }
    };

    if (room.currentItem) checkItem(room.currentItem);
    room.completedItems.forEach(checkItem);
  });

  res.json({
    success: true,
    stats: {
      roomsCreatedCount,
      roomsJoinedCount: roomsJoinedSet.size,
      bidsCount,
      itemsWonCount,
      totalSpent,
      wonItems,
    },
  });
});

// ==========================================
// STATIC FILES & DEV SERVER INTEGRATION
// ==========================================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve(__dirname, 'dist'));

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, HOST, () => {
    console.log(`>>> Sàn Đấu Giá Trực Tuyến đang chạy tại http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
