import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ProfilePictureContextType {
  profilePicture: string | null;
  setProfilePicture: (url: string | null) => void;
  updateProfilePicture: (url: string) => void;
}

const ProfilePictureContext = createContext<ProfilePictureContextType | undefined>(undefined);

export const ProfilePictureProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profilePicture, setProfilePictureState] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem('admin_profile_picture');
    if (cached) {
      setProfilePictureState(cached);
    }
  }, []);

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_profile_picture') {
        setProfilePictureState(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for custom events (same-tab sync)
  useEffect(() => {
    const handleProfilePictureUpdate = (e: CustomEvent) => {
      setProfilePictureState(e.detail);
    };

    window.addEventListener('profilePictureUpdated', handleProfilePictureUpdate as EventListener);
    return () => window.removeEventListener('profilePictureUpdated', handleProfilePictureUpdate as EventListener);
  }, []);

  const setProfilePicture = (url: string | null) => {
    if (url) {
      localStorage.setItem('admin_profile_picture', url);
    } else {
      localStorage.removeItem('admin_profile_picture');
    }
    setProfilePictureState(url);
    
    // Dispatch custom event for same-tab sync
    window.dispatchEvent(new CustomEvent('profilePictureUpdated', { detail: url }));
  };

  const updateProfilePicture = (url: string) => {
    setProfilePicture(url);
  };

  return (
    <ProfilePictureContext.Provider value={{ profilePicture, setProfilePicture, updateProfilePicture }}>
      {children}
    </ProfilePictureContext.Provider>
  );
};

export const useProfilePicture = () => {
  const context = useContext(ProfilePictureContext);
  if (context === undefined) {
    throw new Error('useProfilePicture must be used within a ProfilePictureProvider');
  }
  return context;
};


