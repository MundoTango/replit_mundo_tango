// API Response Types for consistent data handling

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Group {
  id: number;
  name: string;
  slug: string;
  type: 'city' | 'role' | 'practice' | 'festival' | 'topic';
  role_type?: string;
  emoji?: string;
  imageUrl?: string;
  coverImage?: string | null;
  description: string;
  isPrivate: boolean;
  city: string;
  country: string;
  memberCount: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  membershipStatus?: 'member' | 'not_member' | 'pending';
  isJoined?: boolean;
  isFollowing?: boolean;
}

export interface GroupMember {
  id: number;
  username: string;
  name: string;
  profileImage?: string;
  joinedAt: string;
  role?: string;
}

export interface GroupActivity {
  id: string;
  type: 'post' | 'event' | 'member_joined' | 'announcement';
  content: string;
  userId: number;
  userName: string;
  userUsername: string;
  userProfileImage?: string;
  createdAt: string;
  metadata?: any;
}