"use client";

import * as React from "react";
import { Film, Music, Type } from "lucide-react";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar as useSidebarUI,
} from "@/components/ui/sidebar";
import { useSidebar } from "../contexts/sidebar-context";
import { ClipsPanel } from "./clips-panel";
import { TextOverlaysPanel } from "./text-overlays-panel";
import SoundsPanel from "./sounds-panel";

/** Navigation items configuration for the main sidebar */
const data = {
  navMain: [
    {
      title: "Clips",
      url: "#",
      icon: Film,
      isActive: false,
      disabled: true,
    },
    {
      title: "Text Elements",
      url: "#",
      icon: Type,
      isActive: true,
    },
    {
      title: "Sounds",
      url: "#",
      icon: Music,
      isActive: false,
    },
  ],
};

/**
 * AppSidebar Component
 *
 * A dual-sidebar layout component for the video editor application.
 * Consists of two parts:
 * 1. A narrow icon-based sidebar on the left for main navigation
 * 2. A wider content sidebar that displays the active panel's content
 *
 * @component
 * @param props - Props extending from the base Sidebar component
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { activePanel, setActivePanel } = useSidebar();

  const { setOpen } = useSidebarUI();

  /**
   * Renders the appropriate panel component based on the active panel selection
   * @returns {React.ReactNode} The component corresponding to the active panel
   */
  const renderActivePanel = () => {
    switch (activePanel) {
      case "Text Elements":
        return <TextOverlaysPanel />;
      case "Sounds":
        return <SoundsPanel />;
      case "Clips":
        return <ClipsPanel />;
      default:
        return null;
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row bg-gray-900"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r border-gray-800 bg-gray-900"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg ">
                    <Image
                      src="/icons/logo-rve.png"
                      alt="Logo"
                      width={24}
                      height={24}
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      React Video Editor
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActivePanel(item.title);
                        setOpen(true);
                      }}
                      isActive={activePanel === item.title}
                      className="px-2.5 md:px-2 text-zinc-200 hover:bg-gray-800 data-[active=true]:bg-gray-800 data-[active=true]:text-blue-300 data-[active=true]:border-white/5"
                    >
                      <item.icon />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-white/5">{}</SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar
        collapsible="none"
        className="hidden flex-1 md:flex bg-gray-900 border-r border-gray-800"
      >
        <SidebarHeader className="gap-3.5 border-b border-gray-800 p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-zinc-100">
              {activePanel}
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="text-zinc-200 bg-gray-900">
          {renderActivePanel()}
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
