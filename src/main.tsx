import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./newtab.css";

// Extension entry point - renders directly as new tab
createRoot(document.getElementById("root")!).render(<App />);