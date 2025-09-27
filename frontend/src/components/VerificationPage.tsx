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
    <div className="verification-container">
      <h1>Verify Your Identity</h1>
      <p>Scan this QR code with the Self app</p>
      
      {selfApp ? (
        <SelfQRcodeWrapper
          selfApp={selfApp}
          onSuccess={handleSuccessfulVerification}
          onError={(error) => {
            console.error("Error: Failed to verify identity", error);
            console.error("Full error details:", JSON.stringify(error, null, 2));
          }}
        />
      ) : (
        <div>Loading QR Code...</div>
      )}
    </div>
  );
}

export default VerificationPage;