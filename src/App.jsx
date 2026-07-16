import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Volunteer from "./pages/Volunteer";
import Language from "./pages/Language";
import RoleSelection from "./pages/RoleSelection";
import MoodSelection from "./pages/MoodSelection";
import Matching from "./pages/Matching";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/about" element={<About />} />

      <Route path="/volunteer" element={<Volunteer />} />

      <Route path="/language" element={<Language />} />

      <Route path="/role" element={<RoleSelection />} />

      <Route path="/mood" element={<MoodSelection />} />

      <Route path="/matching" element={<Matching />} />

      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

export default App;