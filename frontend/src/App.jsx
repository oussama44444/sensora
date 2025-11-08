import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import LanguageSwitcher from "./components/LanguageSwitcher";
import LanguageSelector from "./components/LanguageSelector";
import WelcomeScreen from "./components/WelcomeScreen";
import StorySelection from "./components/StorySelection";
import StoryPlayer from "./components/StoryPlayer";
import './index.css';
import { useEffect } from "react";
import axios from "axios";

function App() {
  useEffect(() => {
    // Compute API base: use env var if provided, else use current host with port 5000
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    const fallbackApi = `${protocol}//${host}:5000`;
    const apiBase = (import.meta?.env?.VITE_API_URL || fallbackApi).replace(/\/+$/, "");

    // Set axios base URL for all relative requests
    axios.defaults.baseURL = apiBase;

    // Rewrite hardcoded 'http://localhost:5000' XHR calls to the computed API base
    const origOpen = window.XMLHttpRequest && window.XMLHttpRequest.prototype.open;
    if (origOpen) {
      window.XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        try {
          if (typeof url === "string" && url.startsWith("http://localhost:5000")) {
            url = url.replace("http://localhost:5000", apiBase);
          }
        } catch {}
        return origOpen.call(this, method, url, async, user, password);
      };
    }

    // Optional: log once so you can verify on phone
    console.log("📡 API base URL set to:", apiBase);
  }, []);

  // Helper component to conditionally show the switcher within BrowserRouter
  const LanguageControls = () => {
    const location = useLocation();
    const show = location.pathname === "/" || location.pathname === "/stories";
    return show ? <LanguageSwitcher /> : null;
  };

  return (
    <div className="app">
      <LanguageProvider>
        <BrowserRouter>
          {/* Only show on Welcome and Story Selection */}
          <LanguageControls />
          {/* Keep selector mounted globally; opens only when the button dispatches the event */}
          <LanguageSelector />
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/stories" element={<StorySelection />} />
            <Route path="/story/:id" element={<StoryPlayer />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </div>
  );
}

export default App;