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

    // Handle browser back button and tab close (native browser behavior)
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
        // Important: set dirty to false BEFORE proceeding, otherwise it might double block
        // Actually, proceed() will ignore the blocker for this navigation
        if (blocker.state === 'blocked') {
            blocker.proceed();
        }
        // We also want to reset dirty state since we are leaving
        setIsDirty(false);
    }, [blocker]);

    const cancelNavigation = useCallback(() => {
        setShowModal(false);
        if (blocker.state === 'blocked') {
            blocker.reset();
        }
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
