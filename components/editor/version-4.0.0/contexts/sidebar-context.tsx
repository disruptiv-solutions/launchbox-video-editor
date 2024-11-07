import React, { createContext, useContext, useState } from "react";

// Define the shape of our context data
type SidebarContextType = {
  activePanel: string; // Stores the currently active panel name
  setActivePanel: (panel: string) => void; // Function to update the active panel
};

// Create the context with undefined as initial value
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Custom hook to consume the sidebar context
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  // Ensure the hook is used within a provider
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

// Provider component that wraps parts of the app that need access to sidebar state
export const SidebarProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  // Initialize state with "Text Elements" as the default active panel
  const [activePanel, setActivePanel] = useState("Text Elements");

  // Provide the sidebar context value to all children components
  return (
    <SidebarContext.Provider value={{ activePanel, setActivePanel }}>
      {children}
    </SidebarContext.Provider>
  );
};
