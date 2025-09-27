const hre = require("hardhat");

async function main() {
  // This script demonstrates how to interact with the deployed contract
  const [owner, student1, student2] = await hre.ethers.getSigners();
  
  console.log("Interacting with SBTUNI contract...");
  console.log("Owner address:", owner.address);
  console.log("Student1 address:", student1.address);
  console.log("Student2 address:", student2.address);
  
  // Get the contract factory and deploy (or connect to existing)
  const SBTUNI = await hre.ethers.getContractFactory("SBTUNI");
  const sbtuni = await SBTUNI.deploy("MIT", "MIT");
  await sbtuni.deployed();
  
  console.log(`\nContract deployed at: ${sbtuni.address}`);
  
  // Mint a single certificate
  console.log("\n=== Minting Single Certificate ===");
  const tx1 = await sbtuni.mintCertificate(
    student1.address,
    "https://example.com/metadata/1",
    "Bachelor of Computer Science",
    "Alice Johnson",
    "Computer Science",
    "A"
  );
  await tx1.wait();
  console.log("Minted certificate with token ID: 1 to", student1.address);
  
  // Batch mint certificates
  console.log("\n=== Batch Minting Certificates ===");
  const batchData = {
    recipients: [student1.address, student2.address],
    metadataUris: [
      "https://example.com/metadata/2",
      "https://example.com/metadata/3"
    ],
    studentNames: ["Alice Johnson", "Bob Smith"],
    courseNames: ["Advanced Algorithms", "Machine Learning"],
    grades: ["A+", "B+"]
  };
  
  const tx2 = await sbtuni.batchMintCertificates(batchData, "Master of Science");
  await tx2.wait();
  console.log("Batch minted 2 certificates (tokens 2 and 3)");
  
  // Check total supply
  const totalSupply = await sbtuni.totalSupply();
  console.log(`\nTotal certificates issued: ${totalSupply}`);
  
  // Verify certificates
  console.log("\n=== Verifying Certificates ===");
  for (let i = 1; i <= totalSupply; i++) {
    const [tokenOwner, certType, isValid] = await sbtuni.verifyCertificate(i);
    console.log(`Token ${i}: Owner=${tokenOwner}, Type=${certType}, Valid=${isValid}`);
  }
  
  // Get detailed certificate information
  console.log("\n=== Detailed Certificate Info (Token 1) ===");
  const [metadataURI, issuedAt, certificateType, studentName, courseName, grade, revoked] = 
    await sbtuni.connect(student1).getCertificateDetails(1);
    
  console.log(`Metadata URI: ${metadataURI}`);
  console.log(`Issued At: ${new Date(Number(issuedAt) * 1000).toLocaleString()}`);
  console.log(`Certificate Type: ${certificateType}`);
  console.log(`Student Name: ${studentName}`);
  console.log(`Course Name: ${courseName}`);
  console.log(`Grade: ${grade}`);
  console.log(`Revoked: ${revoked}`);
  
  // Try to transfer (should fail)
  console.log("\n=== Testing Soulbound Property ===");
  try {
    await sbtuni.connect(student1).transferFrom(student1.address, student2.address, 1);
    console.log("ERROR: Transfer succeeded (this should not happen!)");
  } catch (error) {
    console.log("✓ Transfer correctly blocked:", error.reason);
  }
  
  // Test revocation
  console.log("\n=== Testing Certificate Revocation ===");
  await sbtuni.revokeCertificate(1);
  console.log("Revoked certificate with token ID: 1");
  
  const isValidAfterRevocation = await sbtuni.isValid(1);
  console.log(`Certificate 1 valid after revocation: ${isValidAfterRevocation}`);
  
  // Get certificates by type (owner only)
  console.log("\n=== Certificates by Type ===");
  const bachelorCerts = await sbtuni.getCertificatesByType("Bachelor of Computer Science");
  const masterCerts = await sbtuni.getCertificatesByType("Master of Science");
  
  console.log(`Bachelor certificates: [${bachelorCerts.join(", ")}]`);
  console.log(`Master certificates: [${masterCerts.join(", ")}]`);
  
  console.log("\n=== Interaction Complete ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });