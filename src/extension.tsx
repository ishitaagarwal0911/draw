import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize the extension new tab page
createRoot(document.getElementById("root")!).render(<App isNewTab={true} />);