import "./home.css";
import HomePage from "../../components/HomePage";
// import ChatPage from "../../components/ChatPage";
import useSelectedUser from "../../store/useSelectedUser";
import SpinerLoader from "../../components/SpinerLoader";
// import ChatPageUser from "../../components/ChatPageUser";
import { lazy } from "react";
import { Suspense } from "react";

// lazy load
const ChatPageUser = lazy(() => import("../../components/ChatPageUser"));
const ChatPage = lazy(() => import("../../components/ChatPage"));

export default function Home() {
  const selectedUser = useSelectedUser((state) => state.selectedUser);

  return (
    <div className="large-screen">
      <div className="green-nav"> </div>

      <main className="main--container">
        {/* home page */}
        <HomePage />
        {/* chat page */}
        {selectedUser ? (
          <Suspense fallback={<SpinerLoader />}>
            <ChatPageUser />
          </Suspense>
        ) : (
          <Suspense fallback={<SpinerLoader />}>
            <ChatPage />
          </Suspense>
        )}
      </main>
    </div>
  );
}
