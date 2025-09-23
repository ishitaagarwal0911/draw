import { WhiteboardCanvas } from "../components/WhiteboardCanvas";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { useEffect } from "react";

const NewTab = () => {
  useEffect(() => {
    // Set page title
    document.title = "Canvas by Recess Club";
    
    // Handle beforeunload to warn about unsaved changes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if there are unsaved changes
      const hasUnsaved = document.querySelector('[data-dirty="true"]');
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <ErrorBoundary>
      <WhiteboardCanvas />
    </ErrorBoundary>
  );
};

export default NewTab;