export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  balance: number;
  currentRoomId: string | null;
  joinedAt: number;
  password?: string;
}

export type ItemStatus = 'queued' | 'active' | 'sold' | 'passed';

export interface BidRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  amount: number;
  timestamp: number;
  type: 'bid' | 'buynow';
}

export interface AuctionItem {
  id: string;
  roomId: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  startingPrice: number;
  currentPrice: number;
  stepPrice: number; // Tối thiểu 10.000 VNĐ
  buyNowPrice: number; // Giá bán ngay
  durationSeconds: number; // Thời gian đấu giá (giây)
  status: ItemStatus;
  startTime: number | null;
  endTime: number | null;
  highestBidder: {
    userId: string;
    userName: string;
    userAvatar: string;
    amount: number;
    timestamp: number;
  } | null;
  bidHistory: BidRecord[];
  winnerId: string | null;
  winnerName?: string;
  finalPrice: number | null;
  soldType: 'auction' | 'buynow' | null;
  queueOrder: number;
  scheduledTime?: string;
}

export interface RoomLog {
  id: string;
  timestamp: number;
  type: 'info' | 'bid' | 'buynow' | 'warning' | 'reset' | 'join' | 'leave' | 'item_start' | 'item_end';
  message: string;
  data?: any;
}

export interface Participant {
  userId: string;
  displayName: string;
  avatar: string;
  joinedAt: number;
}

export interface AuctionRoom {
  id: string;
  title: string;
  description: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  category: string;
  isPrivate: boolean;
  accessCode?: string;
  status: 'waiting' | 'live' | 'completed';
  participants: Participant[];
  itemsQueue: AuctionItem[];
  currentItem: AuctionItem | null;
  completedItems: AuctionItem[];
  logs: RoomLog[];
  createdAt: number;
}

export interface UserStats {
  roomsCreatedCount: number;
  roomsJoinedCount: number;
  bidsCount: number;
  itemsWonCount: number;
  totalSpent: number;
  wonItems: Array<{
    item: AuctionItem;
    roomTitle: string;
    date: number;
  }>;
}

// Socket message protocol
export type ClientMessageType =
  | 'auth'
  | 'room:join'
  | 'room:leave'
  | 'room:create'
  | 'room:delete'
  | 'item:add'
  | 'item:delete'
  | 'item:start'
  | 'bid:place'
  | 'item:buynow'
  | 'chat:send'
  | 'bot:toggle';

export type ServerMessageType =
  | 'auth:ack'
  | 'rooms:update'
  | 'room:state'
  | 'room:error'
  | 'room:user_joined'
  | 'room:user_left'
  | 'room:log'
  | 'auction:tick'
  | 'auction:bid_success'
  | 'auction:30s_warning'
  | 'auction:time_reset'
  | 'auction:item_sold'
  | 'auction:item_passed'
  | 'auction:next_item'
  | 'chat:message'
  | 'user:balance_update';

export interface SocketMessage<T = any> {
  type: ClientMessageType | ServerMessageType;
  payload: T;
  timestamp?: number;
}
