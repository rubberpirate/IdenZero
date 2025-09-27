import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SelfQRcodeWrapper, SelfAppBuilder } from "@selfxyz/qrcode";
import { ethers } from "ethers";

function VerificationPage() {
  const [selfApp, setSelfApp] = useState(null);
  const [userId] = useState(ethers.ZeroAddress);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const scope = import.meta.env.VITE_SELF_SCOPE || "self-zkverify-workshop";
      console.log("Using scope:", scope);
      console.log("Endpoint:", import.meta.env.VITE_SELF_ENDPOINT);
      
      const app = new SelfAppBuilder({
        version: 2,
        appName: import.meta.env.VITE_SELF_APP_NAME || "Self Workshop",
        scope: scope,
        endpoint: `${import.meta.env.VITE_SELF_ENDPOINT}`,
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: userId,
        endpointType: "staging_https",
        userIdType: "hex",
        userDefinedData: "Hello World",
        disclosures: {
          //check the API reference for more disclose attributes!
          minimumAge: 18,
          nationality: true,
          gender: true,
        }
      }).build();

      setSelfApp(app);
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
    }
  }, [userId]);

  const handleSuccessfulVerification = () => {
    console.log("Verification successful!");
    // Redirect to success page after successful verification
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Background grid effect */}
      <div className="grid-background"></div>
      
      {/* Main content container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-md w-full sm:max-w-lg">
          {/* Header section */}
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Verify Your Identity
            </h1>
            <p className="text-gray-400 text-base md:text-lg max-w-sm mx-auto leading-relaxed">
              Scan the QR code below with the Self app to complete your verification
            </p>
          </div>
          
          {/* QR Code section */}
          <div className="glass-card rounded-2xl p-8 border border-white/10 bg-white/5 backdrop-blur-lg">
            {selfApp ? (
              <div className="flex flex-col items-center space-y-6">
                {/* QR Code container with white background for visibility */}
                <div className="verification-qr-container">
                  <div className="qr-code-wrapper">
                    <SelfQRcodeWrapper
                      selfApp={selfApp}
                      onSuccess={handleSuccessfulVerification}
                      onError={(error) => {
                        console.error("Error: Failed to verify identity", error);
                        console.error("Full error details:", JSON.stringify(error, null, 2));
                      }}
                    />
                  </div>
                </div>
                
                {/* Instructions */}
                <div className="text-center max-w-xs mx-auto">
                  <p className="text-gray-300 text-sm mb-2 font-medium">
                    Open the Self app on your mobile device
                  </p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Point your camera at the QR code to start verification
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 verification-loading">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                <p className="text-gray-300 text-lg">Loading QR Code...</p>
                <p className="text-gray-500 text-sm mt-2">Please wait while we prepare your verification</p>
              </div>
            )}
          </div>
          
          {/* Footer info */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm leading-relaxed">
              Don't have the Self app?{' '}
              <span className="text-gray-400 font-medium">Download it from your app store</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationPage;