import "./home.css";
import HomePage from "../../components/HomePage";
import ChatPage from "../../components/ChatPage";
import useSelectedUser from "../../store/useSelectedUser";
import ChatPageUser from "../../components/ChatPageUser";

export default function Home() {

  const selectedUser = useSelectedUser((state) => state.selectedUser);


  return (
    <div className="large-screen">
      <div className="green-nav"> </div>

      <main className="main--container">
        {/* home page */}
        <HomePage />
        {/* chat page */}
        {selectedUser ? <ChatPageUser /> : <ChatPage />}
      </main>
    </div>
  );
}
