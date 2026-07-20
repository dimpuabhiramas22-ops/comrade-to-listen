import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Volunteer from "./pages/Volunteer";
import Language from "./pages/Language";
import ProblemSelection from "./pages/ProblemSelection";
import RoleSelection from "./pages/RoleSelection";
import MoodSelection from "./pages/MoodSelection";
import ListenerRole from "./pages/ListenerRole";
import ListenerTopics from "./pages/ListenerTopics";
import Matching from "./pages/Matching";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* General */}
      <Route path="/about" element={<About />} />
      <Route path="/volunteer" element={<Volunteer />} />

      {/* Support User Flow */}
      <Route path="/language" element={<Language />} />
      <Route path="/problem" element={<ProblemSelection />} />
      <Route path="/mood" element={<MoodSelection />} />
      <Route path="/role" element={<RoleSelection />} />

      {/* Listener Flow */}
      <Route path="/listener-role" element={<ListenerRole />} />
      <Route path="/listener-topics" element={<ListenerTopics />} />

      {/* Shared */}
      <Route path="/matching" element={<Matching />} />
      <Route path="/chat" element={<Chat />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;