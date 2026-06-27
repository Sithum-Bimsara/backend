export interface IUserAuthor {
  id: string;
  name: string;
}

export interface ICommunityMedia {
  id: string;
  url: string;
}

export interface ICommunityPost {
  id: string;
  userId: string;
  topic: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  user: IUserAuthor;
  media?: ICommunityMedia[];
  _count: {
    likes: number;
    comments: number;
    reports: number;
  };
  isLiked: boolean;
  isReported: boolean;
}

export interface ICommunityComment {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  user: IUserAuthor;
  media?: ICommunityMedia[];
  _count: {
    likes: number;
    replies: number;
    reports: number;
  };
  isLiked: boolean;
  isReported: boolean;
}

export interface IReportedCommunityComment extends ICommunityComment {
  post: {
    id: string;
    content: string;
    user: IUserAuthor;
  };
}

export interface IPaginatedResponse<T> {
  success: boolean;
  data?: T[];
  items?: T[];
  total: number;
}
