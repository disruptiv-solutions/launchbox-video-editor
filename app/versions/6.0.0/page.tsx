import ReactVideoEditor from "@/components/editor/version-6.0.0/react-video-editor";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Version6() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      {" "}
      <ReactVideoEditor />
    </SidebarProvider>
  );
}
