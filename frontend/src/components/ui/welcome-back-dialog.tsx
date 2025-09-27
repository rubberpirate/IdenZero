import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

interface WelcomeBackDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardPath: string;
}

export function WelcomeBackDialog({ isOpen, onOpenChange, dashboardPath }: WelcomeBackDialogProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed top-[72px] left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-zinc-900/95 backdrop-blur-sm rounded-lg border border-zinc-800 p-4 shadow-lg min-w-[300px]">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white font-medium">Welcome back!</h3>
          <button
            onClick={() => onOpenChange(false)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-zinc-400 text-sm mb-3">
          Would you like to go to your dashboard?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(dashboardPath)}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 px-3 py-1.5 rounded text-sm font-medium transition-colors"
          >
            Stay Here
          </button>
        </div>
      </div>
    </div>
  );
} 