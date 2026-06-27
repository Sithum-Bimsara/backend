import { useState, useEffect } from 'react';
import axios from 'axios';
import type { IReview } from '../types/reviews.types';

/**
 * Fetches the latest high-rated reviews from both deals and accommodation
 * via the unified GET /public-deals/featured-reviews endpoint.
 *
 * @param dealLimit   - Max deal reviews to include (default 3, capped at 10 on server)
 * @param accommLimit - Max accommodation reviews to include (default 3, capped at 10 on server)
 */
export function useFeaturedReviews(dealLimit = 3, accommLimit = 3) {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_PUBLIC_API_BASE_URL}/public-deals/featured-reviews`,
          {
            params: { dealLimit, accommLimit },
            withCredentials: true,
          }
        );
        if (response.data.success) {
          setReviews(response.data.data);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
              'Failed to fetch featured reviews';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [dealLimit, accommLimit]);

  return { reviews, loading, error };
}
