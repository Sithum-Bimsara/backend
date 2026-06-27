/**
 * ─── View Types (Output Only) ───
 */
export interface IViewDealRequest {
  id: string;
  userId: string;
  message: string;
  contactNumber: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}


