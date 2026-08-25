import { useState } from "react";

export function useNavigation() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);

  return {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    showModal,
    setShowModal,
  };
}

export type UseNavigationReturn = ReturnType<typeof useNavigation>;
