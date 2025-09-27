const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SBTUNI", function () {
  async function deploySBTUNIFixture() {
    const [owner, student1, student2, student3, unauthorized] = await ethers.getSigners();

    const SBTUNI = await ethers.getContractFactory("SBTUNI");
    const sbtuni = await SBTUNI.deploy("Harvard University", "HARVARD");

    return { sbtuni, owner, student1, student2, student3, unauthorized };
  }

  describe("Deployment", function () {
    it("Should deploy with correct name and symbol", async function () {
      const { sbtuni } = await loadFixture(deploySBTUNIFixture);

      expect(await sbtuni.name()).to.equal("Harvard University");
      expect(await sbtuni.symbol()).to.equal("HARVARD");
      expect(await sbtuni.universityName()).to.equal("Harvard University");
    });

    it("Should set the right owner", async function () {
      const { sbtuni, owner } = await loadFixture(deploySBTUNIFixture);

      expect(await sbtuni.owner()).to.equal(owner.address);
    });

    it("Should have zero total supply initially", async function () {
      const { sbtuni } = await loadFixture(deploySBTUNIFixture);

      expect(await sbtuni.totalSupply()).to.equal(0);
    });
  });

  describe("Single Certificate Minting", function () {
    it("Should mint a certificate successfully", async function () {
      const { sbtuni, owner, student1 } = await loadFixture(deploySBTUNIFixture);

      const metadataURI = "https://example.com/certificate/1";
      const certificateType = "Bachelor of Science";
      const studentName = "John Doe";
      const courseName = "Computer Science";
      const grade = "A+";

      await expect(sbtuni.mintCertificate(
        student1.address,
        metadataURI,
        certificateType,
        studentName,
        courseName,
        grade
      )).to.emit(sbtuni, "Attest")
        .withArgs(student1.address, 1, certificateType);

      expect(await sbtuni.ownerOf(1)).to.equal(student1.address);
      expect(await sbtuni.totalSupply()).to.equal(1);
    });

    it("Should store certificate details correctly", async function () {
      const { sbtuni, owner, student1 } = await loadFixture(deploySBTUNIFixture);

      const metadataURI = "https://example.com/certificate/1";
      const certificateType = "Master of Arts";
      const studentName = "Jane Smith";
      const courseName = "Literature";
      const grade = "B+";

      await sbtuni.mintCertificate(
        student1.address,
        metadataURI,
        certificateType,
        studentName,
        courseName,
        grade
      );

      const [uri, issuedAt, certType, name, course, gradeStored, revoked] = 
        await sbtuni.connect(student1).getCertificateDetails(1);

      expect(uri).to.equal(metadataURI);
      expect(certType).to.equal(certificateType);
      expect(name).to.equal(studentName);
      expect(course).to.equal(courseName);
      expect(gradeStored).to.equal(grade);
      expect(revoked).to.be.false;
    });

    it("Should fail when non-owner tries to mint", async function () {
      const { sbtuni, student1, student2 } = await loadFixture(deploySBTUNIFixture);

      await expect(sbtuni.connect(student1).mintCertificate(
        student2.address,
        "uri",
        "type",
        "name",
        "course",
        "grade"
      )).to.be.revertedWithCustomError(sbtuni, "OwnableUnauthorizedAccount");
    });

    it("Should fail with invalid parameters", async function () {
      const { sbtuni, owner, student1 } = await loadFixture(deploySBTUNIFixture);

      // Test with zero address
      await expect(sbtuni.mintCertificate(
        ethers.constants.AddressZero,
        "uri",
        "type",
        "name",
        "course",
        "grade"
      )).to.be.revertedWith("Invalid recipient");

      // Test with empty URI
      await expect(sbtuni.mintCertificate(
        student1.address,
        "",
        "type",
        "name",
        "course",
        "grade"
      )).to.be.revertedWith("Empty URI");

      // Test with empty certificate type
      await expect(sbtuni.mintCertificate(
        student1.address,
        "uri",
        "",
        "name",
        "course",
        "grade"
      )).to.be.revertedWith("Empty certificate type");
    });
  });

  describe("Batch Certificate Minting", function () {
    it("Should batch mint certificates successfully", async function () {
      const { sbtuni, owner, student1, student2, student3 } = await loadFixture(deploySBTUNIFixture);

      const batchData = {
        recipients: [student1.address, student2.address, student3.address],
        metadataUris: ["uri1", "uri2", "uri3"],
        studentNames: ["Student1", "Student2", "Student3"],
        courseNames: ["Course1", "Course2", "Course3"],
        grades: ["A", "B", "C"]
      };
      const certificateType = "Bachelor Degree";

      const tx = await sbtuni.batchMintCertificates(batchData, certificateType);
      const receipt = await tx.wait();

      // Check for BatchAttest event in logs
      expect(receipt.logs.length).to.be.greaterThan(0);

      expect(await sbtuni.ownerOf(1)).to.equal(student1.address);
      expect(await sbtuni.ownerOf(2)).to.equal(student2.address);
      expect(await sbtuni.ownerOf(3)).to.equal(student3.address);
      expect(await sbtuni.totalSupply()).to.equal(3);
    });

    it("Should batch mint with simple version", async function () {
      const { sbtuni, owner, student1, student2 } = await loadFixture(deploySBTUNIFixture);

      const recipients = [student1.address, student2.address];
      const metadataUris = ["uri1", "uri2"];
      const certificateType = "Diploma";

      await expect(sbtuni.batchMintCertificatesSimple(
        recipients,
        metadataUris,
        certificateType
      )).to.emit(sbtuni, "BatchAttest");

      expect(await sbtuni.totalSupply()).to.equal(2);
    });

    it("Should fail batch mint with mismatched array lengths", async function () {
      const { sbtuni, owner, student1, student2 } = await loadFixture(deploySBTUNIFixture);

      const batchData = {
        recipients: [student1.address, student2.address],
        metadataUris: ["uri1"], // Mismatched length
        studentNames: ["Student1", "Student2"],
        courseNames: ["Course1", "Course2"],
        grades: ["A", "B"]
      };

      await expect(sbtuni.batchMintCertificates(batchData, "type"))
        .to.be.revertedWith("Length mismatch: URIs");
    });

    it("Should fail batch mint with too many recipients", async function () {
      const { sbtuni, owner } = await loadFixture(deploySBTUNIFixture);

      const largeArray = new Array(101).fill("0x" + "1".repeat(40));
      const uriArray = new Array(101).fill("uri");

      await expect(sbtuni.batchMintCertificatesSimple(
        largeArray,
        uriArray,
        "type"
      )).to.be.revertedWith("Invalid batch size");
    });
  });

  describe("Soulbound Token Behavior", function () {
    it("Should prevent transfers", async function () {
      const { sbtuni, owner, student1, student2 } = await loadFixture(deploySBTUNIFixture);

      await sbtuni.mintCertificate(
        student1.address,
        "uri",
        "type",
        "name",
        "course",
        "grade"
      );

      // Try to transfer - should fail
      await expect(
        sbtuni.connect(student1).transferFrom(student1.address, student2.address, 1)
      ).to.be.revertedWith("SBT: Transfers disabled");

      await expect(
        sbtuni.connect(student1)["safeTransferFrom(address,address,uint256)"](
          student1.address, student2.address, 1
        )
      ).to.be.revertedWith("SBT: Transfers disabled");
    });

    it("Should disable approvals", async function () {
      const { sbtuni, owner, student1, student2 } = await loadFixture(deploySBTUNIFixture);

      await sbtuni.mintCertificate(
        student1.address,
        "uri",
        "type",
        "name",
        "course",
        "grade"
      );

      await expect(
        sbtuni.connect(student1).approve(student2.address, 1)
      ).to.be.revertedWith("SBT: Approvals disabled");

      await expect(
        sbtuni.connect(student1).setApprovalForAll(student2.address, true)
      ).to.be.revertedWith("SBT: Approvals disabled");

      expect(await sbtuni.getApproved(1)).to.equal(ethers.constants.AddressZero);
      expect(await sbtuni.isApprovedForAll(student1.address, student2.address)).to.be.false;
    });

    it("Should report as permanent", async function () {
      const { sbtuni } = await loadFixture(deploySBTUNIFixture);

      expect(await sbtuni.isPermanent(1)).to.be.true;
    });
  });

  describe("Certificate Management", function () {
    it("Should allow certificate revocation", async function () {
      const { sbtuni, owner, student1 } = await loadFixture(deploySBTUNIFixture);

      await sbtuni.mintCertificate(
        student1.address,
        "uri",
        "type",
        "name",
        "course",
        "grade"
      );

      await expect(sbtuni.revokeCertificate(1))
        .to.emit(sbtuni, "Revoke")
        .withArgs(student1.address, 1);

      expect(await sbtuni.isValid(1)).to.be.false;
    });

    it("Should prevent accessing revoked certificate URI", async function () {
      const { sbtuni, owner, student1 } = await loadFixture(deploySBTUNIFixture);

      await sbtuni.mintCertificate(
        student1.address,
        "uri",
        "type",
        "name",
        "course",
        "grade"
      );

      await sbtuni.revokeCertificate(1);

      await expect(sbtuni.tokenURI(1))
        .to.be.revertedWith("Certificate revoked");
    });

    it("Should allow burning certificates", async function () {
      const { sbtuni, owner, student1 } = await loadFixture(deploySBTUNIFixture);

      await sbtuni.mintCertificate(
        student1.address,
        "uri",
        "type",
        "name",
        "course",
        "grade"
      );

      await expect(sbtuni.connect(student1).burnCertificate(1))
        .to.emit(sbtuni, "Burn")
        .withArgs(student1.address, 1);

      await expect(sbtuni.ownerOf(1))
        .to.be.revertedWithCustomError(sbtuni, "ERC721NonexistentToken");
    });

    it("Should allow owner to burn any certificate", async function () {
      const { sbtuni, owner, student1 } = await loadFixture(deploySBTUNIFixture);

      await sbtuni.mintCertificate(
        student1.address,
        "uri",
        "type",
        "name",
        "course",
        "grade"
      );

      await expect(sbtuni.connect(owner).burnCertificate(1))
        .to.emit(sbtuni, "Burn")
        .withArgs(student1.address, 1);
    });

    it("Should update certificate details", async function () {
      const { sbtuni, owner, student1 } = await loadFixture(deploySBTUNIFixture);

      await sbtuni.batchMintCertificatesSimple(
        [student1.address],
        ["uri"],
        "type"
      );

      await sbtuni.updateCertificateDetails(
        1,
        "Updated Name",
        "Updated Course",
        "A+"
      );

      const [, , , name, course, grade,] = await sbtuni.connect(student1).getCertificateDetails(1);
      expect(name).to.equal("Updated Name");
      expect(course).to.equal("Updated Course");
      expect(grade).to.equal("A+");
    });
  });

  describe("Verification", function () {
    it("Should verify certificate correctly", async function () {
      const { sbtuni, owner, student1 } = await loadFixture(deploySBTUNIFixture);

      await sbtuni.mintCertificate(
        student1.address,
        "uri",
        "Bachelor",
        "name",
        "course",
        "grade"
      );

      const [owner_, certType, valid] = await sbtuni.verifyCertificate(1);
      expect(owner_).to.equal(student1.address);
      expect(certType).to.equal("Bachelor");
      expect(valid).to.be.true;
    });

    it("Should verify detailed certificate information", async function () {
      const { sbtuni, owner, student1 } = await loadFixture(deploySBTUNIFixture);

      await sbtuni.mintCertificate(
        student1.address,
        "uri",
        "Master",
        "John Doe",
        "Physics",
        "A"
      );

      const [owner_, certType, studentName, course, issued, valid] = 
        await sbtuni.verifyCertificateDetailed(1);
      
      expect(owner_).to.equal(student1.address);
      expect(certType).to.equal("Master");
      expect(studentName).to.equal("John Doe");
      expect(course).to.equal("Physics");
      expect(valid).to.be.true;
    });

    it("Should get certificates by type (owner only)", async function () {
      const { sbtuni, owner, student1, student2 } = await loadFixture(deploySBTUNIFixture);

      await sbtuni.mintCertificate(
        student1.address,
        "uri1",
        "Bachelor",
        "name1",
        "course1",
        "grade1"
      );

      await sbtuni.mintCertificate(
        student2.address,
        "uri2",
        "Bachelor",
        "name2",
        "course2",
        "grade2"
      );

      await sbtuni.mintCertificate(
        student1.address,
        "uri3",
        "Master",
        "name3",
        "course3",
        "grade3"
      );

      const bachelorCerts = await sbtuni.getCertificatesByType("Bachelor");
      expect(bachelorCerts.length).to.equal(2);
      expect(bachelorCerts[0]).to.equal(1);
      expect(bachelorCerts[1]).to.equal(2);

      const masterCerts = await sbtuni.getCertificatesByType("Master");
      expect(masterCerts.length).to.equal(1);
      expect(masterCerts[0]).to.equal(3);
    });
  });

  describe("Access Control", function () {
    it("Should restrict certificate details access", async function () {
      const { sbtuni, owner, student1, unauthorized } = await loadFixture(deploySBTUNIFixture);

      await sbtuni.mintCertificate(
        student1.address,
        "uri",
        "type",
        "name",
        "course",
        "grade"
      );

      // Owner should be able to access
      await expect(sbtuni.connect(owner).getCertificateDetails(1))
        .to.not.be.reverted;

      // Token owner should be able to access
      await expect(sbtuni.connect(student1).getCertificateDetails(1))
        .to.not.be.reverted;

      // Unauthorized user should not be able to access
      await expect(sbtuni.connect(unauthorized).getCertificateDetails(1))
        .to.be.revertedWith("Not authorized");
    });

    it("Should restrict getCertificatesByType to owner", async function () {
      const { sbtuni, owner, student1 } = await loadFixture(deploySBTUNIFixture);

      await sbtuni.mintCertificate(
        student1.address,
        "uri",
        "Bachelor",
        "name",
        "course",
        "grade"
      );

      await expect(sbtuni.connect(student1).getCertificatesByType("Bachelor"))
        .to.be.revertedWithCustomError(sbtuni, "OwnableUnauthorizedAccount");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle non-existent token queries properly", async function () {
      const { sbtuni } = await loadFixture(deploySBTUNIFixture);

      await expect(sbtuni.ownerOf(999))
        .to.be.revertedWithCustomError(sbtuni, "ERC721NonexistentToken");

      await expect(sbtuni.tokenURI(999))
        .to.be.revertedWith("Token does not exist");

      await expect(sbtuni.getCertificateDetails(999))
        .to.be.revertedWith("Token does not exist");

      expect(await sbtuni.isValid(999)).to.be.false;
    });

    it("Should prevent double revocation", async function () {
      const { sbtuni, owner, student1 } = await loadFixture(deploySBTUNIFixture);

      await sbtuni.mintCertificate(
        student1.address,
        "uri",
        "type",
        "name",
        "course",
        "grade"
      );

      await sbtuni.revokeCertificate(1);

      await expect(sbtuni.revokeCertificate(1))
        .to.be.revertedWith("Already revoked");
    });

    it("Should maintain correct total supply after burns", async function () {
      const { sbtuni, owner, student1, student2 } = await loadFixture(deploySBTUNIFixture);

      await sbtuni.batchMintCertificatesSimple(
        [student1.address, student2.address],
        ["uri1", "uri2"],
        "type"
      );

      expect(await sbtuni.totalSupply()).to.equal(2);

      await sbtuni.connect(student1).burnCertificate(1);

      // Total supply should still show the next token ID - 1
      expect(await sbtuni.totalSupply()).to.equal(2);
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should efficiently handle large batch mints", async function () {
      const { sbtuni, owner } = await loadFixture(deploySBTUNIFixture);

      // Create arrays for batch minting (testing with smaller size for CI)
      const batchSize = 50;
      const recipients = [];
      const uris = [];
      
      for (let i = 0; i < batchSize; i++) {
        recipients.push(ethers.Wallet.createRandom().address);
        uris.push(`uri${i}`);
      }

      const tx = await sbtuni.batchMintCertificatesSimple(
        recipients,
        uris,
        "Batch Test"
      );

      const receipt = await tx.wait();
      console.log(`Batch minting ${batchSize} certificates used ${receipt.gasUsed} gas`);

      expect(await sbtuni.totalSupply()).to.equal(batchSize);
    });
  });
});