import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar, navItems } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";
import { ConfirmModal } from "./components/AdminUI";

export default function Admin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Handle window resize for mobile check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true); // Always show sidebar on desktop
      } else {
        setSidebarOpen(false); // Default hide on mobile
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine current page ID from path
  const currentPath = location.pathname;
  let currentPageId = "dashboard";

  if (currentPath === "/admin" || currentPath === "/admin/") {
    currentPageId = "dashboard";
  } else {
    const pathSegment = currentPath.split("/")[2];
    if (pathSegment) {
      currentPageId = pathSegment;
    }
  }

  const pageTitle = navItems.find(n => n.id === currentPageId)?.label || "لوحة الإدارة";

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI',Tahoma,Geneva,Verdana,sans-serif", direction: "rtl" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:3px}
      `}</style>

      {/* Sidebar Component */}
      <AdminSidebar
        currentPageId={currentPageId}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Header Component */}
        <AdminHeader
          pageTitle={pageTitle}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Page content loaded via Routing */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6" style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <div className="max-w-7xl mx-auto" style={{ maxWidth: 1280, margin: "0 auto", animation: "fadeUp .25s ease" }} key={currentPageId}>
            {/* The routed child components will be injected here */}
            {/* We use an Outlet context to pass down any global admin functions like setConfirm if needed.
                For now, components that need confirm modals will manage their own state to keep things simple,
                but we can pass an outlet context if we want a global confirm modal. */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}