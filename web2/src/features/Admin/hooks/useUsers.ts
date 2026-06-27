import { useCallback, useEffect, useState } from "react";
import {
  getUsers,
  suspendUser as suspendUserApi,
  activateUser as activateUserApi,
  getUserDetails,
} from "../api/api";
import type {
  AdminUserListItem,
  AdminUserDetailsResponse,
  UserListQuery,
} from "../types/admin.types";

const defaultPageSize = 10;

const parseError = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;
  return fallback;
};

export const useUsers = (initialQuery?: UserListQuery) => {
  const [query, setQuery] = useState<UserListQuery>({ page: 1, limit: defaultPageSize, ...initialQuery });
  const [items, setItems] = useState<AdminUserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUsers(query);
      if (res.success) {
        setItems(res.data);
        setTotal(res.total);
      }
    } catch (err) {
      setError(parseError(err, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const suspendUser = async (id: string) => {
    try {
      const res = await suspendUserApi(id);
      if (res.success) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === id ? { ...item, status: "suspended" } : item
          )
        );
      } else {
        await fetchUsers();
      }
    } catch (err) {
      console.error("Failed to suspend user", err);
      await fetchUsers();
    }
  };

  const activateUser = async (id: string) => {
    try {
      const res = await activateUserApi(id);
      if (res.success) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === id ? { ...item, status: "active" } : item
          )
        );
      } else {
        await fetchUsers();
      }
    } catch (err) {
      console.error("Failed to activate user", err);
      await fetchUsers();
    }
  };

  return { items, total, loading, error, query, setQuery, refetch: fetchUsers, suspendUser, activateUser };
};

export const useUserDetails = (id: string | undefined) => {
  const [data, setData] = useState<AdminUserDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getUserDetails(id);
      if (res.success) setData(res.data);
    } catch (err) {
      setError(parseError(err, "Failed to load user details"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  return { data, loading, error, refetch: fetchUserDetails };
};
