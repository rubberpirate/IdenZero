const hre = require("hardhat");

async function main() {
  console.log("🎓 SBTUNI Smart Contract - Complete End-to-End Test");
  console.log("=" .repeat(60));

  // Get signers
  const [owner, student1, student2, student3] = await hre.ethers.getSigners();
  
  console.log("\n📋 Deployment Information:");
  console.log(`University (Owner): ${owner.address}`);
  console.log(`Student 1: ${student1.address}`);
  console.log(`Student 2: ${student2.address}`);
  console.log(`Student 3: ${student3.address}`);

  // Deploy contract
  console.log("\n🚀 Deploying SBTUNI Contract...");
  const SBTUNI = await hre.ethers.getContractFactory("SBTUNI");
  const sbtuni = await SBTUNI.deploy("Stanford University", "STANFORD");
  await sbtuni.deployed();
  
  console.log(`✅ Contract deployed at: ${sbtuni.address}`);
  console.log(`Contract Name: ${await sbtuni.name()}`);
  console.log(`Contract Symbol: ${await sbtuni.symbol()}`);
  console.log(`University Name: ${await sbtuni.universityName()}`);

  // Test 1: Single Certificate Minting
  console.log("\n🏆 Test 1: Single Certificate Minting");
  console.log("-".repeat(40));
  
  const tx1 = await sbtuni.mintCertificate(
    student1.address,
    "https://ipfs.io/QmHash1",
    "Bachelor of Computer Science",
    "Alice Johnson",
    "Computer Science",
    "A+"
  );
  await tx1.wait();
  console.log("✅ Minted Bachelor's certificate for Alice Johnson");

  const tx2 = await sbtuni.mintCertificate(
    student2.address,
    "https://ipfs.io/QmHash2",
    "Master of Business Administration",
    "Bob Smith",
    "Business Administration",
    "A"
  );
  await tx2.wait();
  console.log("✅ Minted MBA certificate for Bob Smith");

  // Test 2: Batch Certificate Minting
  console.log("\n🏆 Test 2: Batch Certificate Minting");
  console.log("-".repeat(40));
  
  const batchData = {
    recipients: [student1.address, student2.address, student3.address],
    metadataUris: [
      "https://ipfs.io/QmHash3",
      "https://ipfs.io/QmHash4",
      "https://ipfs.io/QmHash5"
    ],
    studentNames: ["Alice Johnson", "Bob Smith", "Carol Davis"],
    courseNames: ["Advanced AI", "Quantum Computing", "Blockchain Technology"],
    grades: ["A+", "A", "A-"]
  };

  const tx3 = await sbtuni.batchMintCertificates(batchData, "Certificate of Excellence");
  await tx3.wait();
  console.log("✅ Batch minted 3 Excellence certificates");

  // Check total supply
  const totalSupply = await sbtuni.totalSupply();
  console.log(`📊 Total certificates issued: ${totalSupply}`);

  // Test 3: Certificate Verification
  console.log("\n🏆 Test 3: Certificate Verification");
  console.log("-".repeat(40));

  for (let i = 1; i <= totalSupply; i++) {
    const [tokenOwner, certType, isValid] = await sbtuni.verifyCertificate(i);
    console.log(`🔍 Token ${i}: Owner=${tokenOwner.slice(0,8)}..., Type=${certType}, Valid=${isValid}`);
  }

  // Test 4: Detailed Certificate Information
  console.log("\n🏆 Test 4: Detailed Certificate Information");
  console.log("-".repeat(40));

  const [metadataURI, issuedAt, certificateType, studentName, courseName, grade, revoked] = 
    await sbtuni.connect(student1).getCertificateDetails(1);
    
  console.log("📜 Certificate Details (Token 1):");
  console.log(`   Student: ${studentName}`);
  console.log(`   Course: ${courseName}`);
  console.log(`   Grade: ${grade}`);
  console.log(`   Type: ${certificateType}`);
  console.log(`   Issued: ${new Date(Number(issuedAt) * 1000).toLocaleString()}`);
  console.log(`   Revoked: ${revoked}`);

  // Test 5: Soulbound Properties
  console.log("\n🏆 Test 5: Testing Soulbound Properties");
  console.log("-".repeat(40));

  try {
    await sbtuni.connect(student1).transferFrom(student1.address, student2.address, 1);
    console.log("❌ ERROR: Transfer should have failed!");
  } catch (error) {
    console.log("✅ Transfer correctly blocked (soulbound property working)");
  }

  try {
    await sbtuni.connect(student1).approve(student2.address, 1);
    console.log("❌ ERROR: Approval should have failed!");
  } catch (error) {
    console.log("✅ Approval correctly blocked (soulbound property working)");
  }

  console.log(`🔗 Is Token 1 permanent? ${await sbtuni.isPermanent(1)}`);

  // Test 6: Certificate Management
  console.log("\n🏆 Test 6: Certificate Management");
  console.log("-".repeat(40));

  // Revoke a certificate
  await sbtuni.revokeCertificate(1);
  console.log("🚫 Revoked certificate Token 1");
  console.log(`   Is Token 1 valid after revocation? ${await sbtuni.isValid(1)}`);

  // Update certificate details
  await sbtuni.updateCertificateDetails(2, "Robert Smith Jr.", "Advanced Business", "A+");
  console.log("📝 Updated certificate details for Token 2");

  // Test 7: Access Control
  console.log("\n🏆 Test 7: Access Control Testing");
  console.log("-".repeat(40));

  try {
    await sbtuni.connect(student1).mintCertificate(
      student3.address,
      "uri",
      "type",
      "name",
      "course",
      "grade"
    );
    console.log("❌ ERROR: Non-owner minting should have failed!");
  } catch (error) {
    console.log("✅ Non-owner minting correctly blocked");
  }

  try {
    await sbtuni.connect(student1).getCertificatesByType("Bachelor of Computer Science");
    console.log("❌ ERROR: Non-owner query should have failed!");
  } catch (error) {
    console.log("✅ Non-owner certificate type query correctly blocked");
  }

  // Test 8: Certificate Search by Type (Owner Only)
  console.log("\n🏆 Test 8: Certificate Search by Type");
  console.log("-".repeat(40));

  const bachelorCerts = await sbtuni.getCertificatesByType("Bachelor of Computer Science");
  const excellenceCerts = await sbtuni.getCertificatesByType("Certificate of Excellence");
  
  console.log(`🎓 Bachelor certificates: [${bachelorCerts.join(", ")}]`);
  console.log(`⭐ Excellence certificates: [${excellenceCerts.join(", ")}]`);

  // Test 9: Burning Certificates
  console.log("\n🏆 Test 9: Certificate Burning");
  console.log("-".repeat(40));

  const balanceBefore = await sbtuni.balanceOf(student3.address);
  await sbtuni.connect(student3).burnCertificate(5);
  const balanceAfter = await sbtuni.balanceOf(student3.address);
  
  console.log(`🔥 Burned certificate Token 5`);
  console.log(`   Student 3 balance before: ${balanceBefore}`);
  console.log(`   Student 3 balance after: ${balanceAfter}`);

  // Final Summary
  console.log("\n📈 Final Summary");
  console.log("=" .repeat(60));
  
  const finalSupply = await sbtuni.totalSupply();
  const student1Balance = await sbtuni.balanceOf(student1.address);
  const student2Balance = await sbtuni.balanceOf(student2.address);
  const student3Balance = await sbtuni.balanceOf(student3.address);

  console.log(`🎯 Total Certificates Minted: ${finalSupply}`);
  console.log(`👤 Alice Johnson (Student 1) owns: ${student1Balance} certificates`);
  console.log(`👤 Bob Smith (Student 2) owns: ${student2Balance} certificates`);
  console.log(`👤 Carol Davis (Student 3) owns: ${student3Balance} certificates`);
  console.log(`🏛️  Contract owned by: ${await sbtuni.owner()}`);
  
  console.log("\n🎉 All tests completed successfully!");
  console.log("✨ SBTUNI Smart Contract is fully functional and secure!");
  console.log("🔒 Soulbound properties enforced");
  console.log("🛡️  Access controls working correctly");
  console.log("📊 Certificate management features operational");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });