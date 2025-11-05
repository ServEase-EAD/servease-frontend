/**
 * Notification Panel Component
 * Dropdown panel for displaying notifications
 */

import { useEffect, useRef } from "react";
import { NotificationList } from "./NotificationList";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

export function NotificationPanel({
  isOpen,
  onClose,
  anchorRef,
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="absolute right-0 mt-2 w-full md:w-96 max-h-[600px] bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col overflow-hidden"
        style={{
          maxHeight: "calc(100vh - 100px)",
        }}
      >
        <NotificationList onClose={onClose} />
      </div>
    </>
  );
}
