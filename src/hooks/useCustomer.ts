/**
 * Customer Hook
 * Custom hook for managing customer data and operations
 */
import { useState, useEffect } from "react";
import type {
  Customer,
  CustomerCreateRequest,
  CustomerUpdateRequest,
} from "../types";
import {
  getCurrentCustomerProfile,
  createCustomerProfile,
  updateCustomerProfile,
  checkCustomerProfileExists,
} from "../services/customerService";
import {
  getUserFromToken,
  getAccessToken,
  isTokenExpired,
  isAuthenticated,
} from "../services/authService";

const CUSTOMER_CACHE_KEY = "customer_profile_cache";
const PROFILE_CHECK_CACHE_KEY = "customer_profile_check_cache";
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

// Helper function to get user-specific cache keys
const getUserCacheKey = (baseKey: string, userId: string | undefined) => {
  return userId ? `${baseKey}_${userId}` : baseKey;
};

// Helper function to clear all cache for any user
const clearAllUserCaches = () => {
  // Get all keys from localStorage
  const allKeys = Object.keys(localStorage);
  
  // Remove all customer cache keys
  allKeys.forEach(key => {
    if (key.startsWith(CUSTOMER_CACHE_KEY) || key.startsWith(PROFILE_CHECK_CACHE_KEY)) {
      localStorage.removeItem(key);
    }
  });
};

interface UseCustomerReturn {
  customer: Customer | null;
  loading: boolean;
  error: string | null;
  hasProfile: boolean;
  profileCheckLoading: boolean;
  createProfile: (data: CustomerCreateRequest) => Promise<void>;
  updateProfile: (data: CustomerUpdateRequest) => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkProfileExists: () => Promise<void>;
  retryConnection: () => Promise<void>;
  clearProfile: () => void;
}

export const useCustomer = (): UseCustomerReturn => {
  const user = getUserFromToken();
  const userId = user?.id;

  const [customer, setCustomer] = useState<Customer | null>(() => {
    // Initialize from user-specific cache if available
    if (!userId) return null;
    
    const cached = localStorage.getItem(getUserCacheKey(CUSTOMER_CACHE_KEY, userId));
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      } catch (e) {
        console.error("Error parsing cached customer:", e);
      }
    }
    return null;
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [hasProfile, setHasProfile] = useState(() => {
    // Initialize from user-specific cache if available
    if (!userId) return false;
    
    const cached = localStorage.getItem(getUserCacheKey(PROFILE_CHECK_CACHE_KEY, userId));
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      } catch (e) {
        console.error("Error parsing cached profile check:", e);
      }
    }
    return false;
  });
  
  const [profileCheckLoading, setProfileCheckLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(userId);

  // Effect to handle user changes and clear caches
  useEffect(() => {
    if (currentUserId !== userId) {
      console.log("User changed from", currentUserId, "to", userId);
      
      // Clear all caches when user changes
      clearAllUserCaches();
      
      // Reset all state
      setCustomer(null);
      setHasProfile(false);
      setError(null);
      setLoading(false);
      setProfileCheckLoading(false);
      
      // Update current user
      setCurrentUserId(userId);
      
      // If there's a new user, start fresh check
      if (userId) {
        console.log("Starting fresh profile check for new user:", userId);
        setTimeout(() => checkProfileExists(), 0); // Use setTimeout to avoid React warnings
      }
    }
  }, [userId, currentUserId]); // Add currentUserId to dependencies

  /**
   * Load customer profile
   */
  const loadProfile = async () => {
    if (!user) {
      console.log("No user found, skipping profile load");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Loading customer profile with auth data integration");
      const profile = await getCurrentCustomerProfile();
      console.log("Profile loaded successfully with auth data merged:", {
        profile_id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        full_name: profile.full_name,
        phone_number: profile.phone_number,
      });

      // Note: API now returns user_id as 'id' field due to logical consolidation
      console.log("Profile ID (should be user_id):", profile.id);
      console.log("User ID from auth:", user.id);
      console.log("IDs match:", profile.id === user.id);
      console.log("Auth data integration:", {
        has_email: !!profile.email,
        has_first_name: !!profile.first_name,
        has_last_name: !!profile.last_name,
        has_phone: !!profile.phone_number,
      });

      setCustomer(profile);
      setHasProfile(true);

      // Cache the profile with timestamp using user-specific key
      if (userId) {
        localStorage.setItem(
          getUserCacheKey(CUSTOMER_CACHE_KEY, userId),
          JSON.stringify({
            data: profile,
            timestamp: Date.now(),
          })
        );
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load profile";

      // If it's a network error, provide better context
      if (errorMessage.includes("No response from server")) {
        setError(
          "Unable to connect to customer service. Please check your connection and try again."
        );
      } else if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized")
      ) {
        setError("Authentication required. Please log in again.");
        // Clear tokens and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return;
      } else if (
        errorMessage.includes("404") ||
        errorMessage.includes("Not Found")
      ) {
        setError("Customer profile not found. Please create your profile.");
        setHasProfile(false);
      } else {
        setError(errorMessage);
      }
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if customer profile exists
   */
  const checkProfileExists = async () => {
    if (!user) {
      console.log("No user found, skipping profile check");
      return;
    }

    // Check if user is authenticated with valid token
    if (!isAuthenticated()) {
      console.log("User not authenticated or token expired");
      setError("Your session has expired. Please log in again.");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      return;
    }

    const token = getAccessToken();
    console.log("Token details:", {
      hasToken: !!token,
      isExpired: token ? isTokenExpired(token) : "no token",
      tokenLength: token?.length || 0,
    });

    setProfileCheckLoading(true);
    setError(null);

    try {
      console.log("Checking profile exists for user:", user.id);
      const result = await checkCustomerProfileExists(user.id);
      console.log("Profile check result:", result);
      setHasProfile(result.profile_exists);

      // Cache the profile check result using user-specific key
      if (userId) {
        localStorage.setItem(
          getUserCacheKey(PROFILE_CHECK_CACHE_KEY, userId),
          JSON.stringify({
            data: result.profile_exists,
            timestamp: Date.now(),
          })
        );
      }

      if (result.profile_exists) {
        // Load the profile data
        console.log("Profile exists, loading profile data");
        await loadProfile();
      } else {
        console.log("No profile found for user");
      }
    } catch (err) {
      console.error("Error checking profile exists:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to check profile";

      // If it's a network error, provide better context but don't assume no profile exists
      if (
        errorMessage.includes("No response from server") ||
        errorMessage.includes("Network Error")
      ) {
        setError(
          "Unable to connect to customer service. Please check your connection and try again."
        );
        // Don't set hasProfile to false on network errors - we don't know if profile exists
        console.log("Network error occurred, not changing hasProfile state");
      } else if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized")
      ) {
        setError("Authentication required. Please log in again.");
        // Clear tokens and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return;
      } else if (
        errorMessage.includes("404") ||
        errorMessage.includes("Not Found")
      ) {
        // Only set hasProfile to false for legitimate 404 responses
        setError("Customer profile not found. Please create your profile.");
        setHasProfile(false);
      } else {
        setError(errorMessage);
        // For other errors, don't assume profile doesn't exist
        console.log("Unknown error occurred, not changing hasProfile state");
      }
    } finally {
      setProfileCheckLoading(false);
    }
  };

  /**
   * Create customer profile
   */
  const createProfile = async (data: CustomerCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const newProfile = await createCustomerProfile(data);
      setCustomer(newProfile);
      setHasProfile(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update customer profile
   */
  const updateProfile = async (data: CustomerUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const updatedProfile = await updateCustomerProfile(data);
      setCustomer(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh profile data
   */
  const refreshProfile = async () => {
    await loadProfile();
  };

  /**
   * Retry connection - attempt to check profile again
   */
  const retryConnection = async () => {
    console.log("Retrying connection...");
    setError(null);
    await checkProfileExists();
  };

  /**
   * Clear profile data and cache
   */
  const clearProfile = () => {
    console.log("Clearing profile data and cache for user:", userId);
    setCustomer(null);
    setHasProfile(false);
    setError(null);
    
    // Clear user-specific caches
    if (userId) {
      localStorage.removeItem(getUserCacheKey(CUSTOMER_CACHE_KEY, userId));
      localStorage.removeItem(getUserCacheKey(PROFILE_CHECK_CACHE_KEY, userId));
    }
  };

  // Initial profile check on mount
  useEffect(() => {
    if (user && userId) {
      // Only fetch if cache is expired or doesn't exist
      const profileCached = localStorage.getItem(getUserCacheKey(CUSTOMER_CACHE_KEY, userId));
      const checkCached = localStorage.getItem(getUserCacheKey(PROFILE_CHECK_CACHE_KEY, userId));
      let shouldFetch = true;

      if (profileCached && checkCached) {
        try {
          const { timestamp: profileTimestamp } = JSON.parse(profileCached);
          const { timestamp: checkTimestamp } = JSON.parse(checkCached);
          const now = Date.now();

          if (
            now - profileTimestamp < CACHE_DURATION &&
            now - checkTimestamp < CACHE_DURATION
          ) {
            shouldFetch = false;
          }
        } catch (e) {
          console.error("Error checking cache:", e);
        }
      }

      if (shouldFetch) {
        setTimeout(() => checkProfileExists(), 0); // Use setTimeout to avoid React warnings
      }
    }
  }, [user?.id, userId]); // Include userId in dependencies

  return {
    customer,
    loading,
    error,
    hasProfile,
    profileCheckLoading,
    createProfile,
    updateProfile,
    refreshProfile,
    checkProfileExists,
    retryConnection,
    clearProfile,
  };
};
