import { getAPIUrl } from "@/config/api";
import axios from "axios";

// --- PUBLIC INSTANCE ---
// For public routes (login, register)
export const apiClient = axios.create({
  baseURL: getAPIUrl(""), // Base URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// --- PRIVATE INSTANCE ---
// For secured routes (anything requiring auth)
export const apiPrivate = axios.create({
  baseURL: getAPIUrl(""),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// We will configure interceptors in AuthContext,
// as they need access to the auth state (login/logout).