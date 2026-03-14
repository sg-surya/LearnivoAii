
"use client";

import React, { useState, useEffect, useRef, type MouseEvent, useMemo } from "react";
import { useWorkspace } from "@/context/workspace-context";
import {
  Folder,
  PlusCircle,
  Clock,
  Notebook,
  FolderOpen,
  ChevronRight,
  FolderTree,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import type { Asset, Folder as FolderType } from "@/context/workspace-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AssetViewer, getIconForAssetType } from "@/components/asset-viewer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";

const SpotlightCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        const card = internalRef.current;
        if (card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--x", `${x}px`);
        card.style.setProperty("--y", `${y}px`);
        }
    };

    return (
        <Card
            ref={(node) => {
                internalRef.current = node;
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
            }}
            onMouseMove={handleMouseMove}
            className={cn("spotlight-card", className)}
            {...props}
        >
            {children}
        </Card>
    );
});
SpotlightCard.displayName = "SpotlightCard";


export default function WorkspacePage() {
  const { folders, assets, addFolder, isFoldersLoading, isAssetsLoading } = useWorkspace();
  const { profile } = useUser();
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>('folder-sahayak-assets');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isSahayakAssetsOpen, setIsSahayakAssetsOpen] = useState(true);

  // Group assets by type for "Sahayak Assets" view
  const assetsByType = useMemo(() => {
    return assets.reduce((acc, asset) => {
      const type = asset.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(asset);
      return acc;
    }, {} as Record<string, Asset[]>);
  }, [assets]);
  
  const assetTypeFolders: FolderType[] = useMemo(() => 
    Object.keys(assetsByType).map(type => ({
      id: `asset-type-${type}`,
      name: type.endsWith('s') ? type : `${type}s`,
      description: `All generated ${type}s`,
      createdAt: new Date(),
    })).sort((a,b) => a.name.localeCompare(b.name)),
  [assetsByType]);

  const userFolders = folders.filter(folder => folder.id !== 'folder-sahayak-assets');
  
  const currentFolder = folders.find(f => f.id === currentFolderId) || 
                       assetTypeFolders.find(f => f.id === currentFolderId) || 
                       (currentFolderId === 'folder-sahayak-assets' ? { id: 'folder-sahayak-assets', name: 'Sahayak Assets', description: 'Default folder for all auto-saved assets, organized by type.', createdAt: new Date() } : null);

  const assetsForCurrentFolder = useMemo(() => {
    if (!currentFolder) return [];
    if (currentFolder.id === 'folder-sahayak-assets') return [];
    if (currentFolder.id.startsWith('asset-type-')) {
       const typeName = currentFolder.name.endsWith('s') ? currentFolder.name.slice(0, -1) : currentFolder.name;
      return assets.filter(asset => asset.type === typeName);
    }
    // For user-created folders, you'd need a folderId on assets
    return assets.filter(asset => asset.folderId === currentFolderId);
  }, [currentFolder, assets, currentFolderId]);


  const handleCreateFolder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    addFolder(name, description);
    setIsFolderDialogOpen(false);
  };
  
  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId);
  }

  const handleBreadcrumbClick = () => {
    setCurrentFolderId('folder-sahayak-assets');
  }
  
  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const renderContent = () => {
    if (isFoldersLoading || isAssetsLoading) {
      return (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
          <Notebook className="mb-4 h-16 w-16 animate-pulse" />
          <h3 className="text-xl font-semibold">Loading Workspace...</h3>
        </div>
      );
    }
    
    if (!currentFolder) {
      return (
         <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
            <Notebook className="mb-4 h-16 w-16" />
            <h3 className="text-xl font-semibold">Welcome to your Workspace</h3>
            <p>Start by creating a folder or generating content.</p>
          </div>
      );
    }

    if (currentFolder.id === 'folder-sahayak-assets') {
      return assetTypeFolders.length > 0 ? (
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {assetTypeFolders.map((folder) => (
              <SpotlightCard
                key={folder.id}
                className="group cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => handleFolderClick(folder.id)}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FolderOpen className="h-8 w-8 text-primary" />
                    <CardTitle className="text-lg font-semibold">{folder.name}</CardTitle>
                  </div>
                   <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{assetsByType[folder.name.slice(0,-1)]?.length || 0} item(s)</p>
                </CardContent>
              </SpotlightCard>
            ))}
          </div>
      ) : (
         <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
            <FolderOpen className="mb-4 h-16 w-16" />
            <h3 className="text-xl font-semibold">No Assets Yet</h3>
            <p>Generate content and it will be organized here by type.</p>
          </div>
      );
    }
    
    const displayAssets = currentFolder.id.startsWith('asset-type-')
      ? assets.filter(asset => asset.type === currentFolder.name.slice(0, -1))
      : assets.filter(asset => asset.folderId === currentFolderId);

    return displayAssets.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayAssets.map((asset: Asset) => (
            <SpotlightCard
              key={asset.id}
              className="flex cursor-pointer flex-col justify-between transition-shadow hover:shadow-md"
              onClick={() => handleAssetClick(asset)}
            >
              <CardHeader>
                  {getIconForAssetType(asset.type, "h-6 w-6 text-muted-foreground")}
                  <CardTitle className="pt-4 text-base font-semibold">{asset.name}</CardTitle>
                  <CardDescription>{asset.type}</CardDescription>
              </CardHeader>
              <CardFooter className="text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {asset.createdAt?.toDate && (
                  <span>
                      {formatDistanceToNow(asset.createdAt.toDate(), {
                      addSuffix: true,
                      })}
                  </span>
                  )}
                  </div>
              </CardFooter>
            </SpotlightCard>
        ))}
        </div>
    ) : (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
        <Notebook className="mb-4 h-16 w-16" />
        <h3 className="text-xl font-semibold">This Folder is Empty</h3>
        <p>Generate content and it will appear here.</p>
        </div>
    );
  }

  return (
    <>
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">My Workspace</h1>
          <p className="text-muted-foreground">
            View and manage all your generated content.
          </p>
        </div>
        <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Custom Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-headline">
                Create New Folder
              </DialogTitle>
              <DialogDescription>
                Organize your assets into custom folders.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Folder Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Grade 8 Science Final Term"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="A brief description of this folder's content."
                />
              </div>
              <Button type="submit" className="w-full">
                Create Folder
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-4">
        <SpotlightCard className="col-span-1 h-full overflow-y-auto">
          <CardHeader className="p-4">
            <CardTitle className="text-lg">My Folders</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
             <div className="flex flex-col gap-1">
              {userFolders.map((folder) => (
                <Button
                  key={folder.id}
                  variant={currentFolderId === folder.id ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => handleFolderClick(folder.id)}
                >
                  <Folder className="h-5 w-5 shrink-0" />
                  <span className="truncate">{folder.name}</span>
                </Button>
              ))}

              <Collapsible
                  open={isSahayakAssetsOpen}
                  onOpenChange={setIsSahayakAssetsOpen}
                  className="w-full"
                >
                  <CollapsibleTrigger asChild>
                      <Button
                      variant={currentFolderId === 'folder-sahayak-assets' ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3"
                      onClick={() => handleFolderClick('folder-sahayak-assets')}
                    >
                        <FolderTree className="h-5 w-5 shrink-0" />
                      <span className="truncate flex-1 text-left">Sahayak Assets</span>
                        <ChevronRight className={cn("h-4 w-4 shrink-0 transition-transform", isSahayakAssetsOpen && "rotate-90")}/>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 py-1 pl-6">
                    {assetTypeFolders.map((folder) => (
                        <Button
                        key={folder.id}
                        variant={currentFolderId === folder.id ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3"
                        onClick={() => handleFolderClick(folder.id)}
                      >
                        <FolderOpen className="h-5 w-5 shrink-0" />
                        <span className="truncate">{folder.name}</span>
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
            </div>
          </CardContent>
        </SpotlightCard>

        <div className="h-full overflow-y-auto md:col-span-3">
            {currentFolder && (
             <>
                <div className="mb-4">
                   <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink 
                          onClick={handleBreadcrumbClick}
                          className="cursor-pointer"
                        >
                          Sahayak Assets
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      {currentFolder.id !== 'folder-sahayak-assets' && (
                        <>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            <BreadcrumbPage>{currentFolder.name}</BreadcrumbPage>
                          </BreadcrumbItem>
                        </>
                      )}
                    </BreadcrumbList>
                  </Breadcrumb>
                  <p className="text-muted-foreground mt-1">{currentFolder.description}</p>
                </div>
                {renderContent()}
             </>
           )}
        </div>
      </div>
    </div>
    
    <AssetViewer 
      asset={selectedAsset}
      open={!!selectedAsset}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setSelectedAsset(null);
        }
      }}
    />
    </>
  );
}
