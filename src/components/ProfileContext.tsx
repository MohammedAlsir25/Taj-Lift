import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type AppTheme = 'dark' | 'light';

export interface AvatarPreset {
  id: string;
  url: string;
  label: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'avatar-1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    label: 'Sarah (Admin)'
  },
  {
    id: 'avatar-2',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    label: 'Alex (Lead Tech)'
  },
  {
    id: 'avatar-3',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    label: 'John (Supervisor)'
  },
  {
    id: 'avatar-4',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    label: 'Elena (Director)'
  },
  {
    id: 'avatar-5',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    label: 'Marcus (Tech II)'
  }
];

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  phone: string;
  region: string;
  profilePic: string;
}

const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-sarah',
    name: 'Sarah Connor',
    email: 'sarah@tajlifts.com',
    password: 'password123',
    role: 'Taj Operations Lead',
    phone: '+971 50 123 4567',
    region: 'Dubai Marina & JBR',
    profilePic: AVATAR_PRESETS[0].url
  }
];

interface ProfileContextType {
  currentUser: UserAccount | null;
  users: UserAccount[];
  profilePic: string;
  setProfilePic: (url: string) => void;
  name: string;
  setName: (name: string) => void;
  role: string;
  setRole: (role: string) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isAvailable: boolean;
  setIsAvailable: (status: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  phone: string;
  setPhone: (phone: string) => void;
  region: string;
  setRegion: (region: string) => void;
  isBiometricallyVerified: boolean;
  setIsBiometricallyVerified: (status: boolean) => void;
  lockSession: () => void;
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string, role: string, phone: string, region: string, profilePic: string) => boolean;
  logout: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('taj_users_db');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('taj_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [profilePic, setProfilePic] = useState<string>(() => {
    return localStorage.getItem('taj_profile_pic') || AVATAR_PRESETS[0].url;
  });
  const [name, setName] = useState<string>(() => {
    return localStorage.getItem('taj_profile_name') || 'Sarah Connor';
  });
  const [role, setRole] = useState<string>(() => {
    return localStorage.getItem('taj_profile_role') || 'Taj Operations Lead';
  });
  const [theme, setTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('taj_theme') as AppTheme) || 'dark';
  });
  const [isAvailable, setIsAvailable] = useState<boolean>(() => {
    const saved = localStorage.getItem('taj_profile_avail');
    return saved !== null ? saved === 'true' : true;
  });
  const [phone, setPhone] = useState<string>(() => {
    return localStorage.getItem('taj_profile_phone') || '+971 50 123 4567';
  });
  const [region, setRegion] = useState<string>(() => {
    return localStorage.getItem('taj_profile_region') || 'Dubai Marina & JBR';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [isBiometricallyVerified, setIsBiometricallyVerified] = useState<boolean>(() => {
    return sessionStorage.getItem('taj_biometric_verified') === 'true';
  });

  const lockSession = () => {
    sessionStorage.removeItem('taj_biometric_verified');
    setIsBiometricallyVerified(false);
  };

  // Sync isBiometricallyVerified state
  useEffect(() => {
    if (isBiometricallyVerified) {
      sessionStorage.setItem('taj_biometric_verified', 'true');
    } else {
      sessionStorage.removeItem('taj_biometric_verified');
    }
  }, [isBiometricallyVerified]);

  // 1. Real-time Firestore synchronization for users collection
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      if (snapshot.empty) {
        // If Firestore is completely fresh, seed it with the default admin user
        DEFAULT_USERS.forEach((u) => {
          setDoc(doc(db, "users", u.id), u).catch(err => console.error("Error seeding default user:", err));
        });
      } else {
        const list: UserAccount[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as UserAccount);
        });
        setUsers(list);
      }
    }, (error) => {
      console.error("Firestore onSnapshot users error:", error);
    });
    return () => unsubscribe();
  }, []);

  // Sync users list to localStorage as a fallback
  useEffect(() => {
    localStorage.setItem('taj_users_db', JSON.stringify(users));
  }, [users]);

  // Sync current user session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('taj_current_user', JSON.stringify(currentUser));
      // Populate active profile state fields
      setProfilePic(currentUser.profilePic);
      setName(currentUser.name);
      setRole(currentUser.role);
      setPhone(currentUser.phone);
      setRegion(currentUser.region);
    } else {
      localStorage.removeItem('taj_current_user');
    }
  }, [currentUser]);

  // Sync individual profile changes back to current user object & users database
  useEffect(() => {
    if (currentUser) {
      const updatedUser = { ...currentUser, name, role, phone, region, profilePic };
      
      // Deep equal check to avoid infinite feedback loops
      if (
        currentUser.name !== name ||
        currentUser.role !== role ||
        currentUser.phone !== phone ||
        currentUser.region !== region ||
        currentUser.profilePic !== profilePic
      ) {
        setCurrentUser(updatedUser);
        setUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u));
        
        // Save profile modifications to Firestore
        setDoc(doc(db, "users", currentUser.id), updatedUser).catch(console.error);
      }
    }
  }, [name, role, phone, region, profilePic]);

  // Sync state to localstorage
  useEffect(() => {
    localStorage.setItem('taj_profile_pic', profilePic);
  }, [profilePic]);

  useEffect(() => {
    localStorage.setItem('taj_profile_name', name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem('taj_profile_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('taj_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('taj_profile_avail', String(isAvailable));
  }, [isAvailable]);

  useEffect(() => {
    localStorage.setItem('taj_profile_phone', phone);
  }, [phone]);

  useEffect(() => {
    localStorage.setItem('taj_profile_region', region);
  }, [region]);

  const login = (email: string, password: string): boolean => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const signup = (
    name: string,
    email: string,
    password: string,
    role: string,
    phone: string,
    region: string,
    profilePic: string
  ): boolean => {
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return false;

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name,
      email,
      password,
      role,
      phone,
      region,
      profilePic
    };

    // Optimistic update
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);

    // Save to real Firestore database immediately
    setDoc(doc(db, "users", newUser.id), newUser).catch((err) => {
      console.error("Firestore user creation failed:", err);
    });

    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsBiometricallyVerified(false);
    sessionStorage.removeItem('taj_biometric_verified');
  };

  return (
    <ProfileContext.Provider
      value={{
        currentUser,
        users,
        profilePic,
        setProfilePic,
        name,
        setName,
        role,
        setRole,
        theme,
        setTheme,
        isAvailable,
        setIsAvailable,
        isSettingsOpen,
        setIsSettingsOpen,
        phone,
        setPhone,
        region,
        setRegion,
        isBiometricallyVerified,
        setIsBiometricallyVerified,
        lockSession,
        login,
        signup,
        logout
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
