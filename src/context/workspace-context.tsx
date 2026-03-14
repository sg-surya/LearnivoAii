
"use client";

import React, { createContext, useContext, ReactNode, useMemo, useCallback } from "react";
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from "@/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

export type Asset = {
  id: string;
  type: string;
  name: string;
  content: any;
  createdAt: any;
  folderId?: string;
};

export type Folder = {
  id: string;
  name: string;
  description: string;
  createdAt: any;
  assets: Asset[];
};

interface WorkspaceState {
  folders: Folder[];
  assets: Asset[];
  isFoldersLoading: boolean;
  isAssetsLoading: boolean;
  addFolder: (name: string, description: string) => Promise<string | null>;
  addAsset: (asset: Omit<Asset, "id" | "createdAt">) => Promise<string | null>;
}

const WorkspaceContext = createContext<WorkspaceState | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading, isProfileLoading } = useUser();
  const firestore = useFirestore();

  const foldersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "userProfiles", user.uid, "folders"), orderBy("createdAt", "desc"));
  }, [firestore, user]);

  const assetsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "userProfiles", user.uid, "assets"), orderBy("createdAt", "desc"));
  }, [firestore, user]);

  const { data: foldersData, isLoading: isFoldersLoading } = useCollection<Omit<Folder, 'assets'>>(foldersQuery);
  const { data: assetsData, isLoading: isAssetsLoading } = useCollection<Asset>(assetsQuery);
  
  const addFolder = useCallback(async (name: string, description: string) => {
    if (!firestore || !user) return null;
    const foldersCol = collection(firestore, "userProfiles", user.uid, "folders");
    const newDocRef = await addDoc(foldersCol, {
      name,
      description,
      createdAt: serverTimestamp(),
    });
    return newDocRef.id;
  }, [firestore, user]);

  const addAsset = useCallback(async (asset: Omit<Asset, "id" | "createdAt">): Promise<string | null> => {
    if (!firestore || !user) return null;
    
    const assetTypeFolderName = asset.type.endsWith('s') ? asset.type : `${asset.type}s`;
    const folderId = foldersData?.find(f => f.name === assetTypeFolderName)?.id || await addFolder(assetTypeFolderName, `Auto-organized ${asset.type}s`);

    if (!folderId) return null;
    
    const assetsCol = collection(firestore, "userProfiles", user.uid, "assets");
    const newDocRef = await addDoc(assetsCol, {
      ...asset,
      folderId: folderId,
      createdAt: serverTimestamp(),
    });
    return newDocRef.id;
  }, [firestore, user, foldersData, addFolder]);

  const foldersWithAssets = useMemo(() => {
    if (!foldersData || !assetsData) return [];
    
    const assetMap = assetsData.reduce((acc, asset) => {
        const fId = asset.folderId || 'unorganized';
        if (!acc[fId]) acc[fId] = [];
        acc[fId].push(asset);
        return acc;
    }, {} as Record<string, Asset[]>);

    return foldersData.map(folder => ({
        ...folder,
        assets: assetMap[folder.id] || []
    }));
  }, [foldersData, assetsData]);

  const value = useMemo(() => ({
    folders: foldersWithAssets,
    assets: assetsData || [],
    isFoldersLoading: isFoldersLoading || isUserLoading || isProfileLoading,
    isAssetsLoading: isAssetsLoading || isUserLoading || isProfileLoading,
    addFolder,
    addAsset,
  }), [foldersWithAssets, assetsData, isFoldersLoading, isAssetsLoading, isUserLoading, isProfileLoading, addFolder, addAsset]);

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return context;
};
