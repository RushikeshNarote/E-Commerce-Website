import { useCallback, useEffect, useState } from "react";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const tokenStorageKey = "legends-account-token-v1";

export function useAccount() {
  const [storedSession] = useState(() => {
    try {
      return { token: localStorage.getItem(tokenStorageKey) || "", error: "" };
    } catch {
      return { token: "", error: "Browser storage is unavailable; your sign-in cannot be restored after refresh." };
    }
  });
  const [token, setToken] = useState(storedSession.token);
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [sessionError, setSessionError] = useState(storedSession.error);
  const [loading, setLoading] = useState(Boolean(token));

  const request = useCallback(async (path, options = {}, includeAuth = true) => {
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(includeAuth && token ? { Authorization: "Bearer " + token } : {}),
        ...options.headers,
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401 && token && includeAuth) {
      setToken("");
      setUser(null);
      setAddresses([]);
      setSessionError("Your session expired or is no longer valid. Please sign in again.");
    }
    if (!response.ok) {
      const error = new Error(payload.error || "The request could not be completed.");
      error.status = response.status;
      throw error;
    }
    return payload;
  }, [token]);

  const refresh = useCallback(async () => {
    if (!token) {
      setUser(null);
      setAddresses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setSessionError("");
    try {
      const { user: account } = await request("/auth/me");
      setUser(account);
      setAddresses(account.addresses || []);
    } catch (error) {
      setUser(null);
      setAddresses([]);
      setSessionError(error.message);
    } finally {
      setLoading(false);
    }
  }, [request, token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    try {
      if (token) localStorage.setItem(tokenStorageKey, token);
      else localStorage.removeItem(tokenStorageKey);
    } catch {
      setSessionError("Browser storage is unavailable; your sign-in cannot be restored after refresh.");
      return undefined;
    }
    return undefined;
  }, [token]);

  async function authenticate(path, values) {
    const { token: nextToken, user: account } = await request(path, {
      method: "POST",
      body: JSON.stringify(values),
    }, false);
    setToken(nextToken);
    setUser(account);
    setAddresses(account.addresses || []);
    setSessionError("");
    return account;
  }

  function signOut() {
    setToken("");
    setUser(null);
    setAddresses([]);
    setSessionError("");
  }

  function clearSessionError() {
    setSessionError("");
  }

  async function updateAddresses(path, method, values) {
    const result = await request(path, {
      method,
      body: values ? JSON.stringify(values) : undefined,
    });
    setAddresses(result.addresses || (result.address ? [...addresses, result.address] : []));
    return result;
  }

  return {
    addresses,
    authenticate,
    clearSessionError,
    isAuthenticated: Boolean(token && user),
    loading,
    refresh,
    request,
    setAddresses,
    sessionError,
    signOut,
    token,
    updateAddresses,
    user,
    setUser,
  };
}
