import express from 'express';
import cors from 'cors';
import { SelfBackendVerifier, AllIds, DefaultConfigStore } from "@selfxyz/core";
const app = express();

// Enable CORS for frontend requests
app.use(cors({
  origin: ['http://localhost:5173', 'https://308955f37013.ngrok-free.app'], // Vite dev server and ngrok
  credentials: true
},{
  origin: ['http://localhost:5173', 'https://308955f37013.ngrok-free.app'], // Vihttps://playground.self.xyz/api/verifyue
}));

const selfBackendVerifier = new SelfBackendVerifier(
  "self-zkverify-workshop",
  "https://308955f37013.ngrok-free.app/verify",
  true, // mockPassport: true for testing with mock passport
  AllIds,
  new DefaultConfigStore({
    minimumAge: 18,
    excludedCountries: [], // Empty array for mock passport testing
    ofac: false, // Disable OFAC for testing
  }),
  "uuid" // userIdentifierType
);

app.use(express.json());


app.get('/', (req,res) => {
    res.send("Hello world!");
})


app.post('/verify', async (req,res) => {
    try {
     const { attestationId, proof, publicSignals, userContextData } =  req.body;
     if (!proof || !publicSignals || !attestationId || !userContextData) {
      return res.status(404).json(
        {
          message: "Proof, publicSignals, attestationId and userContextData are required",
        }
      );
    }

    const result = await selfBackendVerifier.verify(
      attestationId,    // Document type (1 = passport, 2 = EU ID card, 3 = Aadhaar)
      proof,            // The zero-knowledge proof
      publicSignals,    // Public signals array
      userContextData   // User context data (hex string)
    );

    // Check if verification was successful
    if (result.isValidDetails.isValid) {
      // Verification successful - process the result
      return res.json({
        status: "success",
        result: true,
        credentialSubject: result.discloseOutput,
      });
    } else {
      // Verification failed
      return res.json(
        {
          status: "error",
          result: false,
          reason: "Verification failed",
          error_code: "VERIFICATION_FAILED",
          details: result.isValidDetails,
        },
        { status: 200 }
      );
    }

} catch(err) {
    return res.status(500).json(
      {
        status: "error",
        result: false,
        reason: err instanceof Error ? err.message : "Unknown error",
        error_code: "UNKNOWN_ERROR"
      },
    );
}
})

app.listen(3000, () => {
    console.log("Running at port 3000");
})