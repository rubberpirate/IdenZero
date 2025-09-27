import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, X, CheckCircle, Shield, Code, GitBranch, Users } from 'lucide-react';

interface GithubConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
  loading?: boolean;
  error?: string | null;
}

export function GithubConnectDialog({ isOpen, onClose, onConnect, loading = false, error = null }: GithubConnectDialogProps) {
  const [step, setStep] = useState<'info' | 'connecting' | 'success' | 'error'>('info');

  React.useEffect(() => {
    if (loading) {
      setStep('connecting');
    } else if (error) {
      setStep('error');
    } else {
      setStep('info');
    }
  }, [loading, error]);

  const handleConnect = () => {
    onConnect();
  };

  const handleClose = () => {
    if (step !== 'connecting') {
      onClose();
      setStep('info');
    }
  };

  const handleRetry = () => {
    setStep('info');
    onConnect();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md mx-4"
          >
            <Card className="bg-black border-gray-800 p-6">
              {step === 'info' && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                        <Github className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">Connect GitHub</h3>
                        <p className="text-sm text-gray-400">Enhance your IdenZero profile</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClose}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-white/5 border border-gray-800 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3">We'll analyze your:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 text-sm">
                          <Code className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-300">Programming languages & frameworks</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                          <GitBranch className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">Code quality & contribution patterns</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-300">Open source collaboration</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                          <Shield className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-300">Project complexity & skills</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Shield className="w-4 h-4 text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-blue-300 text-sm font-medium">Privacy Protected</p>
                          <p className="text-blue-200/70 text-xs mt-1">
                            We only access public repository metadata. Private repos and sensitive data remain secure.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={handleConnect}
                      className="flex-1 bg-white text-black hover:bg-gray-200"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      Connect with GitHub
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}

              {step === 'connecting' && (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Github className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-medium text-white mb-2">Connecting to GitHub</h3>
                  <p className="text-gray-400 text-sm">
                    Redirecting to GitHub for authorization...
                  </p>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </motion.div>
                  <h3 className="text-lg font-medium text-white mb-2">Connected Successfully!</h3>
                  <p className="text-gray-400 text-sm">
                    Your GitHub account has been linked. Analyzing repositories...
                  </p>
                </div>
              )}

              {step === 'error' && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <X className="w-8 h-8 text-red-400" />
                  </motion.div>
                  <h3 className="text-lg font-medium text-white mb-2">Connection Failed</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {error || 'Failed to connect to GitHub. Please try again.'}
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleRetry}
                      className="flex-1 bg-white text-black hover:bg-gray-200"
                    >
                      Try Again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}