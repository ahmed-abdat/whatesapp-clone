import useSelectedUser from "../../store/useSelectedUser";
import SpinerLoader from "../../components/SpinerLoader";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { lazy } from "react";
import { Suspense } from "react";
// import "./home.css"; // Removed - using Tailwind CSS only

// lazy load
const ChatPageUser = lazy(() => import("../../components/ChatePage/ChatPageUser"));
const ChatPage = lazy(() => import("../../components/ChatPage"));
const HomePage = lazy(() => import("../../components/HomePage"));

export default function Home() {
  const selectedUser = useSelectedUser((state) => state.selectedUser);

  // Use media query hook for responsive behavior
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <div className="min-h-screen bg-whatsapp-bg">
      {/* WhatsApp green header bar for large screens */}
      <div className="hidden lg:block fixed top-0 left-0 w-full h-32 bg-whatsapp-primary z-0"></div>
      
      {/* Main container with Tailwind Grid */}
      <div className="relative z-10 lg:p-5 h-screen">
        <div className="h-full bg-white lg:rounded-lg lg:shadow-xl overflow-hidden
                        grid grid-cols-1 md:grid-cols-[minmax(350px,450px)_1fr]">
          
          {/* Left Sidebar - HomePage */}
          <div className={`home-page border-r border-gray-200 ${isMobile && selectedUser ? 'hidden' : 'block'}`}>
            <Suspense fallback={<SpinerLoader />}>
              <HomePage />
            </Suspense>
          </div>
          
          {/* Right Area - Chat */}
          <div className={`chat-area ${isMobile && !selectedUser ? 'hidden' : 'block'}`}>
            {selectedUser ? (
              <Suspense fallback={<SpinerLoader />}>
                <ChatPageUser />
              </Suspense>
            ) : (
              <Suspense fallback={<SpinerLoader />}>
                <ChatPage />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
