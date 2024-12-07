import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import RenderControls from "./render-controls";
import { useEditorContext } from "../contexts/editor-context";

// ... imports remain the same ...

/**
 * EditorHeader component renders the top navigation bar of the editor interface.
 * It includes a sidebar trigger button, a separator, and an export video button.
 * The header is sticky-positioned at the top of the viewport.
 *
 * @returns {JSX.Element} A header element containing navigation controls
 */
export function EditorHeader() {
  const { renderMedia, state } = useEditorContext();
  return (
    <header className="sticky top-0 flex shrink-0 items-center gap-2  bg-gray-900 p-3.5">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-5 bg-gray-300" />

      <div className="flex-grow" />
      <RenderControls handleRender={renderMedia} state={state} />
    </header>
  );
}
