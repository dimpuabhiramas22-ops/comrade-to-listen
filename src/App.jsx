import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Volunteer from "./pages/Volunteer";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/volunteer" element={<Volunteer />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;