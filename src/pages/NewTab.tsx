import { WhiteboardCanvas } from "../components/WhiteboardCanvas";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { useEffect } from "react";

const NewTab = () => {
  useEffect(() => {
    // Set page title
    document.title = "New tab";
    
    // Handle beforeunload to warn about unsaved changes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if there are unsaved changes by looking for the AutoSaveStatus component showing "Saving..."
      const autoSaveStatus = document.querySelector('[data-testid="auto-save-status"]');
      const isSaving = autoSaveStatus?.textContent?.includes('Saving');
      
      if (isSaving) {
        e.preventDefault();
        e.returnValue = "Your changes are still being saved. Are you sure you want to leave?";
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