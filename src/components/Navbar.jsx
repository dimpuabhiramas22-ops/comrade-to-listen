import { Link, useLocation } from "react-router-dom";
import { Menu, Globe, HeartHandshake } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const active = (path) =>
    location.pathname === path
      ? "text-blue-600 font-semibold"
      : "text-slate-600 hover:text-blue-600";

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold text-blue-600"
        >
          <HeartHandshake size={30} />
          <span>Comrade to Listen</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">

          <Link className={active("/")} to="/">
            Home
          </Link>

          <Link className={active("/about")} to="/about">
            About
          </Link>

          <Link className={active("/volunteer")} to="/volunteer">
            Volunteer
          </Link>

          <button className="flex items-center gap-2 border rounded-lg px-3 py-2 hover:bg-slate-100">
            <Globe size={18} />
            English
          </button>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition">
            Get Started
          </button>

        </nav>

        {/* Mobile Button */}
        <button className="md:hidden">
          <Menu size={28} />
        </button>

      </div>
    </header>
  );
}