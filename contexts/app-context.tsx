import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { LiquorStore, BourbonFind, User, Speakeasy } from "@/types";
import { POINT_REWARDS } from "@/constants/levels";
import { mockStores, mockFinds } from "@/mocks/bourbon-data";
import { mockSpeakeasies } from "@/mocks/speakeasy-data";

const STORAGE_KEYS = {
  USER: "bourbon_hunter_user",
  STORES: "bourbon_hunter_stores",
  FINDS: "bourbon_hunter_finds",
  SPEAKEASIES: "bourbon_hunter_speakeasies",
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [stores, setStores] = useState<LiquorStore[]>([]);
  const [finds, setFinds] = useState<BourbonFind[]>([]);
  const [speakeasies, setSpeakeasies] = useState<Speakeasy[]>([]);

  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    },
  });

  const storesQuery = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.STORES);
      return stored ? JSON.parse(stored) : mockStores;
    },
  });

  const findsQuery = useQuery({
    queryKey: ["finds"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.FINDS);
      return stored ? JSON.parse(stored) : mockFinds;
    },
  });

  const speakeasiesQuery = useQuery({
    queryKey: ["speakeasies"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SPEAKEASIES);
      return stored ? JSON.parse(stored) : mockSpeakeasies;
    },
  });

  useEffect(() => {
    if (userQuery.data !== undefined) {
      setUser(userQuery.data);
    }
  }, [userQuery.data]);

  useEffect(() => {
    if (storesQuery.data) {
      setStores(storesQuery.data);
    }
  }, [storesQuery.data]);

  useEffect(() => {
    if (findsQuery.data) {
      setFinds(findsQuery.data);
    }
  }, [findsQuery.data]);

  useEffect(() => {
    if (speakeasiesQuery.data) {
      setSpeakeasies(speakeasiesQuery.data);
    }
  }, [speakeasiesQuery.data]);

  const signInMutation = useMutation({
    mutationFn: async (userData: { name: string; email: string }) => {
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        avatar: `https://i.pravatar.cc/150?u=${userData.email}`,
        points: 0,
        joinedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      return newUser;
    },
    onSuccess: (data) => {
      setUser(data);
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    },
    onSuccess: () => {
      setUser(null);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<User>) => {
      if (!user) throw new Error("No user logged in");
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      return updatedUser;
    },
    onSuccess: (data) => {
      setUser(data);
    },
  });

  const addStoreMutation = useMutation({
    mutationFn: async (store: LiquorStore) => {
      const updated = [...stores, store];
      await AsyncStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(updated));
      
      if (user) {
        const updatedUser = { ...user, points: user.points + POINT_REWARDS.ADD_STORE };
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      
      return updated;
    },
    onSuccess: (data) => {
      setStores(data);
    },
  });

  const addFindMutation = useMutation({
    mutationFn: async (find: BourbonFind) => {
      const updated = [find, ...finds];
      await AsyncStorage.setItem(STORAGE_KEYS.FINDS, JSON.stringify(updated));
      
      if (user) {
        const updatedUser = { ...user, points: user.points + POINT_REWARDS.ADD_FIND };
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      
      return updated;
    },
    onSuccess: (data) => {
      setFinds(data);
    },
  });

  const addSpeakeasyMutation = useMutation({
    mutationFn: async (speakeasy: Speakeasy) => {
      const updated = [speakeasy, ...speakeasies];
      await AsyncStorage.setItem(STORAGE_KEYS.SPEAKEASIES, JSON.stringify(updated));
      
      if (user) {
        const updatedUser = { ...user, points: user.points + POINT_REWARDS.ADD_SPEAKEASY };
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      
      return updated;
    },
    onSuccess: (data) => {
      setSpeakeasies(data);
    },
  });

  const isLoading =
    userQuery.isLoading || storesQuery.isLoading || findsQuery.isLoading || speakeasiesQuery.isLoading;

  return {
    user,
    stores,
    finds,
    speakeasies,
    isLoading,
    signIn: (data: { name: string; email: string }) =>
      signInMutation.mutate(data),
    signOut: () => signOutMutation.mutate(),
    updateProfile: (updates: Partial<User>) => updateProfileMutation.mutate(updates),
    addStore: (store: LiquorStore) => addStoreMutation.mutate(store),
    addFind: (find: BourbonFind) => addFindMutation.mutate(find),
    addSpeakeasy: (speakeasy: Speakeasy) => addSpeakeasyMutation.mutate(speakeasy),
    isSigningIn: signInMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isAddingStore: addStoreMutation.isPending,
    isAddingFind: addFindMutation.isPending,
    isAddingSpeakeasy: addSpeakeasyMutation.isPending,
  };
});

export function useUserFinds() {
  const { finds, user } = useApp();
  return useMemo(
    () => finds.filter((find) => find.hunterName === user?.name),
    [finds, user?.name]
  );
}
