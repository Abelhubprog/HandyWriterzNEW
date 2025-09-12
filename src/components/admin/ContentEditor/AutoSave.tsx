import React, { useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface AutoSaveProps {
  lastSavedAt: Date | null;
  onAutoSave: () => void;
  disabled?: boolean;
  interval?: number; // in milliseconds
}

export function AutoSave({ 
  lastSavedAt, 
  onAutoSave, 
  disabled = false, 
  interval = 30000 // default to 30 seconds
}: AutoSaveProps) {
  const autoSave = useCallback(() => {
    if (!disabled) {
      onAutoSave();
    }
  }, [disabled, onAutoSave]);

  useEffect(() => {
    const timer = setInterval(autoSave, interval);
    return () => clearInterval(timer);
  }, [autoSave, interval]);

  if (!lastSavedAt) {
    return null;
  }

  return (
    <div className="text-sm text-gray-500">
      Last saved {formatDistanceToNow(lastSavedAt, { addSuffix: true })}
    </div>
  );
}
