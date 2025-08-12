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
    <div className="relative w-full h-screen bg-gray-200 p-0 lg:p-5 overflow-hidden">
      {/* Green navigation bar - desktop only */}
      <div className="absolute top-0 left-0 w-full h-32 bg-whatsapp-primary z-0 hidden lg:block"></div>
      
      {/* Main container - direct Tailwind classes */}
      <div className="relative w-full h-full lg:h-[calc(100vh-2.5rem)] bg-gray-100 grid grid-cols-1 md:grid-cols-[400px_1fr] lg:grid-cols-[minmax(350px,450px)_1fr] overflow-hidden z-10">
        
        {/* Left Sidebar - User List */}
        <div className={`relative bg-white flex flex-col h-full overflow-hidden border-r border-gray-200 ${
          isMobile && selectedUser ? 'hidden' : 'flex'
        }`}>
          <Suspense fallback={<SpinerLoader />}>
            <HomePage />
          </Suspense>
        </div>
        
        {/* Right Chat Area */}
        <div className={`relative w-full h-full flex flex-col items-center justify-center text-gray-500 font-light bg-white overflow-hidden md:shadow-sm md:border-l border-gray-200 ${
          isMobile && !selectedUser ? 'hidden' : 'flex'
        }`}>
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
  );
}
