import "./home.css";
// import HomePage from "../../components/HomePage";
// import ChatPage from "../../components/ChatPage";
import useSelectedUser from "../../store/useSelectedUser";
import SpinerLoader from "../../components/SpinerLoader";
// import ChatPageUser from "../../components/ChatPageUser";
import { lazy } from "react";
import { Suspense } from "react";
import { useEffect } from "react";
import { useState } from "react";

// lazy load
const ChatPageUser = lazy(() => import("../../components/ChatPageUser"));
const ChatPage = lazy(() => import("../../components/ChatPage"));
const HomePage = lazy(() => import("../../components/HomePage"));

export default function Home() {
  const selectedUser = useSelectedUser((state) => state.selectedUser);

  // is Mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }else {
      setIsMobile(false);
    }
  }, []);

  return (
    <div className="large-screen">
      <div className="green-nav"> </div>

      <main className="main--container">
        {/* home page */}
        <Suspense fallback={<SpinerLoader />}>
          <HomePage />
        </Suspense>
        {/* chat page */}
        {
          isMobile && selectedUser ? (
            <Suspense fallback={<SpinerLoader />}>
            <ChatPageUser />
          </Suspense>
          ) : isMobile && !selectedUser ? (
            null
          ) : !isMobile && selectedUser ? (
            <Suspense fallback={<SpinerLoader />}>
            <ChatPageUser />
          </Suspense>
          ) : <Suspense fallback={<SpinerLoader />}>
          <ChatPage />
        </Suspense>

}
          
    
      </main>
    </div>
  );
}
