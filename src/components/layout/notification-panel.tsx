
"use client";

import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck } from "lucide-react";
import { useNotificationStore, type Notification } from "@/stores/notification-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function NotificationPanel() {
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotificationStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Button variant="ghost" size="icon">
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 md:w-96" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-headline text-lg">Notifications</span>
          {notifications.length > 0 && (
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto"
              onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }}
            >
              <CheckCheck className="mr-1 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {notifications.length > 0 ? (
            <ScrollArea className="h-auto max-h-[400px]">
              {notifications.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className={cn(
                    "flex-col items-start gap-1 whitespace-normal",
                    !notif.read && "bg-accent/50"
                  )}
                  onSelect={() => markAsRead(notif.id)}
                >
                  <p className="font-semibold">{notif.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {notif.description}
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    {formatDistanceToNow(notif.createdAt, {
                      addSuffix: true,
                    })}
                  </p>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              You have no new notifications.
            </div>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
