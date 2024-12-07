import React from "react";
import { Button } from "@/components/ui/button";
import { FilmIcon, Type, Music } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SideNavigationProps {
  activeSidePanel: "text" | "sound" | "assets" | null;
  toggleSidePanel: (panel: "text" | "sound" | "assets") => void;
}

const SideNavigation: React.FC<SideNavigationProps> = ({
  activeSidePanel,
  toggleSidePanel,
}) => {
  return (
    <div className="w-16 bg-gray-800 flex flex-col items-center py-4">
      <Sheet
        open={activeSidePanel === "assets"}
        onOpenChange={() => toggleSidePanel("assets")}
      >
        <SheetTrigger asChild>
          <Button
            variant={activeSidePanel === "assets" ? "secondary" : "ghost"}
            size="icon"
            className="mb-4"
          >
            <FilmIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <h2 className="text-lg font-semibold mb-4">Assets</h2>
          {/* Add your assets panel content here */}
        </SheetContent>
      </Sheet>

      <Sheet
        open={activeSidePanel === "text"}
        onOpenChange={() => toggleSidePanel("text")}
      >
        <SheetTrigger asChild>
          <Button
            variant={activeSidePanel === "text" ? "secondary" : "ghost"}
            size="icon"
            className="mb-4"
          >
            <Type className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <h2 className="text-lg font-semibold mb-4">Text</h2>
          {/* Add your text panel content here */}
        </SheetContent>
      </Sheet>

      <Sheet
        open={activeSidePanel === "sound"}
        onOpenChange={() => toggleSidePanel("sound")}
      >
        <SheetTrigger asChild>
          <Button
            variant={activeSidePanel === "sound" ? "secondary" : "ghost"}
            size="icon"
            className="mb-4"
          >
            <Music className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <h2 className="text-lg font-semibold mb-4">Sound</h2>
          {/* Add your sound panel content here */}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SideNavigation;
