/**
 * Customer Hook
 * Custom hook for managing customer data and operations
 */
import { useState, useEffect } from "react";
import type { Customer, CustomerCreateRequest, CustomerUpdateRequest } from "../types";
import {
  getCurrentCustomerProfile,
  createCustomerProfile,
  updateCustomerProfile,
  checkCustomerProfileExists,
} from "../services/customerService";
import { getUserFromToken } from "../services/authService";

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
}

export const useCustomer = (): UseCustomerReturn => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileCheckLoading, setProfileCheckLoading] = useState(false);

  const user = getUserFromToken();

  /**
   * Load customer profile
   */
  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const profile = await getCurrentCustomerProfile();
      setCustomer(profile);
      setHasProfile(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if customer profile exists
   */
  const checkProfileExists = async () => {
    if (!user) return;

    setProfileCheckLoading(true);
    setError(null);

    try {
      const result = await checkCustomerProfileExists(user.id);
      setHasProfile(result.profile_exists);

      if (result.profile_exists) {
        // Load the profile data
        await loadProfile();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check profile");
      setHasProfile(false);
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

  // Initial profile check on mount
  useEffect(() => {
    if (user) {
      checkProfileExists();
    }
  }, [user?.id]);

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
  };
};