import { useState, useEffect, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';

interface UseUnsavedChangesReturn {
    isDirty: boolean;
    setIsDirty: (dirty: boolean) => void;
    showModal: boolean;
    confirmNavigation: () => void;
    cancelNavigation: () => void;
    markAsSaved: () => void;
}

export const useUnsavedChanges = (initialDirty = false): UseUnsavedChangesReturn => {
    const [isDirty, setIsDirty] = useState(initialDirty);
    const [showModal, setShowModal] = useState(false);

    // Block navigation when form is dirty
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            isDirty && currentLocation.pathname !== nextLocation.pathname
    );

    // Show modal when blocker is active
    useEffect(() => {
        if (blocker.state === 'blocked') {
            setShowModal(true);
        }
    }, [blocker.state]);

    // Handle browser back button and tab close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const confirmNavigation = useCallback(() => {
        setShowModal(false);
        setIsDirty(false);
        blocker.proceed?.();
    }, [blocker]);

    const cancelNavigation = useCallback(() => {
        setShowModal(false);
        blocker.reset?.();
    }, [blocker]);

    const markAsSaved = useCallback(() => {
        setIsDirty(false);
    }, []);

    return {
        isDirty,
        setIsDirty,
        showModal,
        confirmNavigation,
        cancelNavigation,
        markAsSaved,
    };
};

export default useUnsavedChanges;
