const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("SimpleJobPortal", function () {
  // Deployment fixture
  async function deploySimpleJobPortalFixture() {
    const [owner, backend, employer1, employer2, jobSeeker1, jobSeeker2, both1] = await ethers.getSigners();

    const SimpleJobPortal = await ethers.getContractFactory("SimpleJobPortal");
    const jobPortal = await SimpleJobPortal.deploy();

    return { 
      jobPortal, 
      owner, 
      backend, 
      employer1, 
      employer2, 
      jobSeeker1, 
      jobSeeker2, 
      both1 
    };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { jobPortal, owner } = await loadFixture(deploySimpleJobPortalFixture);
      expect(await jobPortal.owner()).to.equal(owner.address);
    });

    it("Should initialize counters to 0", async function () {
      const { jobPortal } = await loadFixture(deploySimpleJobPortalFixture);
      expect(await jobPortal.jobIdCounter()).to.equal(0);
      expect(await jobPortal.applicationIdCounter()).to.equal(0);
    });

    it("Should have no backend address initially", async function () {
      const { jobPortal } = await loadFixture(deploySimpleJobPortalFixture);
      expect(await jobPortal.backendAddress()).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Backend Management", function () {
    it("Should allow owner to set backend address", async function () {
      const { jobPortal, owner, backend } = await loadFixture(deploySimpleJobPortalFixture);
      
      await expect(jobPortal.connect(owner).setBackendAddress(backend.address))
        .to.emit(jobPortal, "BackendAddressUpdated")
        .withArgs(ethers.ZeroAddress, backend.address);
        
      expect(await jobPortal.getBackendAddress()).to.equal(backend.address);
    });

    it("Should not allow non-owner to set backend address", async function () {
      const { jobPortal, backend, employer1 } = await loadFixture(deploySimpleJobPortalFixture);
      
      await expect(jobPortal.connect(employer1).setBackendAddress(backend.address))
        .to.be.revertedWith("Only owner can call this function");
    });

    it("Should not allow setting zero address as backend", async function () {
      const { jobPortal, owner } = await loadFixture(deploySimpleJobPortalFixture);
      
      await expect(jobPortal.connect(owner).setBackendAddress(ethers.ZeroAddress))
        .to.be.revertedWith("Backend address cannot be zero");
    });
  });

  describe("User Registration", function () {
    it("Should register a new job seeker", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(deploySimpleJobPortalFixture);

      await expect(jobPortal.connect(jobSeeker1).registerUserBasic(
        "John Doe",
        "john@example.com",
        0 // JobSeeker
      )).to.emit(jobPortal, "UserRegistered")
        .withArgs(jobSeeker1.address, "John Doe", 0);

      const user = await jobPortal.users(jobSeeker1.address);
      expect(user.name).to.equal("John Doe");
      expect(user.email).to.equal("john@example.com");
      expect(user.userType).to.equal(0);
      expect(user.isActive).to.be.true;
      expect(user.isVerified).to.be.false;
    });

    it("Should register a new employer", async function () {
      const { jobPortal, employer1 } = await loadFixture(deploySimpleJobPortalFixture);

      await expect(jobPortal.connect(employer1).registerUserBasic(
        "ABC Company",
        "hr@abc.com",
        1 // Employer
      )).to.emit(jobPortal, "UserRegistered")
        .withArgs(employer1.address, "ABC Company", 1);

      const user = await jobPortal.users(employer1.address);
      expect(user.userType).to.equal(1);
    });

    it("Should register a user with Both type", async function () {
      const { jobPortal, both1 } = await loadFixture(deploySimpleJobPortalFixture);

      await jobPortal.connect(both1).registerUserBasic(
        "Freelancer",
        "freelancer@example.com",
        2 // Both
      );

      const user = await jobPortal.users(both1.address);
      expect(user.userType).to.equal(2);
    });

    it("Should not allow empty name", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(deploySimpleJobPortalFixture);

      await expect(jobPortal.connect(jobSeeker1).registerUserBasic(
        "",
        "john@example.com",
        0
      )).to.be.revertedWith("Name cannot be empty");
    });

    it("Should not allow empty email", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(deploySimpleJobPortalFixture);

      await expect(jobPortal.connect(jobSeeker1).registerUserBasic(
        "John Doe",
        "",
        0
      )).to.be.revertedWith("Email cannot be empty");
    });

    it("Should not allow double registration", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(deploySimpleJobPortalFixture);

      await jobPortal.connect(jobSeeker1).registerUserBasic(
        "John Doe",
        "john@example.com",
        0
      );

      await expect(jobPortal.connect(jobSeeker1).registerUserBasic(
        "John Doe Updated",
        "john.new@example.com",
        0
      )).to.be.revertedWith("User already registered");
    });

    it("Should allow setting user details after registration", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(deploySimpleJobPortalFixture);

      await jobPortal.connect(jobSeeker1).registerUserBasic(
        "John Doe",
        "john@example.com",
        0
      );

      await jobPortal.connect(jobSeeker1).setUserDetails(
        "+1234567890",
        "QmProfileHash123"
      );

      const user = await jobPortal.users(jobSeeker1.address);
      expect(user.phone).to.equal("+1234567890");
      expect(user.profileHash).to.equal("QmProfileHash123");
    });

    it("Should allow updating profile", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(deploySimpleJobPortalFixture);

      await jobPortal.connect(jobSeeker1).registerUserBasic(
        "John Doe",
        "john@example.com",
        0
      );

      await jobPortal.connect(jobSeeker1).updateProfile(
        "John Doe Updated",
        "john.new@example.com",
        "+1234567890",
        "QmNewProfileHash456"
      );

      const user = await jobPortal.users(jobSeeker1.address);
      expect(user.name).to.equal("John Doe Updated");
      expect(user.email).to.equal("john.new@example.com");
      expect(user.phone).to.equal("+1234567890");
      expect(user.profileHash).to.equal("QmNewProfileHash456");
    });
  });

  describe("User Verification", function () {
    it("Should allow backend to verify users", async function () {
      const { jobPortal, owner, backend, jobSeeker1 } = await loadFixture(deploySimpleJobPortalFixture);

      // Set backend address
      await jobPortal.connect(owner).setBackendAddress(backend.address);

      // Register user
      await jobPortal.connect(jobSeeker1).registerUserBasic(
        "John Doe",
        "john@example.com",
        0
      );

      // Verify user
      await expect(jobPortal.connect(backend).markVerified(jobSeeker1.address))
        .to.emit(jobPortal, "UserVerified")
        .withArgs(jobSeeker1.address);

      expect(await jobPortal.isUserVerified(jobSeeker1.address)).to.be.true;
    });

    it("Should not allow non-backend to verify users", async function () {
      const { jobPortal, owner, backend, jobSeeker1, employer1 } = await loadFixture(deploySimpleJobPortalFixture);

      await jobPortal.connect(owner).setBackendAddress(backend.address);
      await jobPortal.connect(jobSeeker1).registerUserBasic("John Doe", "john@example.com", 0);

      await expect(jobPortal.connect(employer1).markVerified(jobSeeker1.address))
        .to.be.revertedWith("Only backend can call this function");
    });

    it("Should allow backend to remove verification", async function () {
      const { jobPortal, owner, backend, jobSeeker1 } = await loadFixture(deploySimpleJobPortalFixture);

      await jobPortal.connect(owner).setBackendAddress(backend.address);
      await jobPortal.connect(jobSeeker1).registerUserBasic("John Doe", "john@example.com", 0);
      await jobPortal.connect(backend).markVerified(jobSeeker1.address);

      await jobPortal.connect(backend).removeVerification(jobSeeker1.address);
      expect(await jobPortal.isUserVerified(jobSeeker1.address)).to.be.false;
    });
  });

  describe("Job Posting", function () {
    async function setupUsersFixture() {
      const { jobPortal, owner, backend, employer1, employer2, jobSeeker1, jobSeeker2, both1 } = await loadFixture(deploySimpleJobPortalFixture);

      // Register users
      await jobPortal.connect(employer1).registerUserBasic("ABC Company", "hr@abc.com", 1);
      await jobPortal.connect(employer2).registerUserBasic("XYZ Corp", "jobs@xyz.com", 1);
      await jobPortal.connect(jobSeeker1).registerUserBasic("John Doe", "john@example.com", 0);
      await jobPortal.connect(jobSeeker2).registerUserBasic("Jane Smith", "jane@example.com", 0);
      await jobPortal.connect(both1).registerUserBasic("Freelancer", "freelancer@example.com", 2);

      return { jobPortal, owner, backend, employer1, employer2, jobSeeker1, jobSeeker2, both1 };
    }

    it("Should allow employer to post a job", async function () {
      const { jobPortal, employer1 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400; // 1 day from now

      await expect(jobPortal.connect(employer1).postJobBasic(
        "Software Engineer",
        "We are looking for a skilled software engineer",
        deadline
      )).to.emit(jobPortal, "JobPosted")
        .withArgs(1, employer1.address, "Software Engineer");

      const jobBasic = await jobPortal.jobBasics(1);
      expect(jobBasic.title).to.equal("Software Engineer");
      expect(jobBasic.description).to.equal("We are looking for a skilled software engineer");
      expect(jobBasic.employer).to.equal(employer1.address);
      expect(jobBasic.status).to.equal(0); // Active
      expect(jobBasic.applicationsCount).to.equal(0);

      expect(await jobPortal.jobIdCounter()).to.equal(1);
    });

    it("Should not allow job seeker to post a job", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await expect(jobPortal.connect(jobSeeker1).postJobBasic(
        "Software Engineer",
        "Description",
        deadline
      )).to.be.revertedWith("Only employers can call this function");
    });

    it("Should allow 'Both' type user to post a job", async function () {
      const { jobPortal, both1 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await expect(jobPortal.connect(both1).postJobBasic(
        "Freelance Project",
        "Looking for a freelancer",
        deadline
      )).to.emit(jobPortal, "JobPosted");
    });

    it("Should not allow empty title", async function () {
      const { jobPortal, employer1 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await expect(jobPortal.connect(employer1).postJobBasic(
        "",
        "Description",
        deadline
      )).to.be.revertedWith("Title cannot be empty");
    });

    it("Should not allow empty description", async function () {
      const { jobPortal, employer1 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await expect(jobPortal.connect(employer1).postJobBasic(
        "Title",
        "",
        deadline
      )).to.be.revertedWith("Description cannot be empty");
    });

    it("Should not allow past deadline", async function () {
      const { jobPortal, employer1 } = await loadFixture(setupUsersFixture);

      const pastDeadline = Math.floor(Date.now() / 1000) - 86400; // 1 day ago

      await expect(jobPortal.connect(employer1).postJobBasic(
        "Software Engineer",
        "Description",
        pastDeadline
      )).to.be.revertedWith("Deadline must be in future");
    });

    it("Should allow setting job details", async function () {
      const { jobPortal, employer1 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJobBasic("Software Engineer", "Description", deadline);

      await jobPortal.connect(employer1).setJobDetails(
        1,
        "Technology",
        "JavaScript, React, Node.js",
        "Remote"
      );

      const jobDetails = await jobPortal.jobDetails(1);
      expect(jobDetails.category).to.equal("Technology");
      expect(jobDetails.skillsRequired).to.equal("JavaScript, React, Node.js");
      expect(jobDetails.location).to.equal("Remote");
    });

    it("Should allow setting more job details", async function () {
      const { jobPortal, employer1 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJobBasic("Software Engineer", "Description", deadline);

      await jobPortal.connect(employer1).setJobMoreDetails(
        1,
        "$80,000 - $120,000",
        "Full-time",
        "QmJobMetadataHash123"
      );

      const jobDetails = await jobPortal.jobDetails(1);
      expect(jobDetails.salaryRange).to.equal("$80,000 - $120,000");
      expect(jobDetails.jobType).to.equal("Full-time");
      expect(jobDetails.metadataHash).to.equal("QmJobMetadataHash123");
    });

    it("Should allow job poster to update job", async function () {
      const { jobPortal, employer1 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJobBasic("Software Engineer", "Description", deadline);

      const newDeadline = Math.floor(Date.now() / 1000) + 172800; // 2 days from now
      await expect(jobPortal.connect(employer1).updateJobBasic(
        1,
        "Senior Software Engineer",
        "Updated description",
        newDeadline
      )).to.emit(jobPortal, "JobUpdated")
        .withArgs(1, "Senior Software Engineer");

      const jobBasic = await jobPortal.jobBasics(1);
      expect(jobBasic.title).to.equal("Senior Software Engineer");
      expect(jobBasic.description).to.equal("Updated description");
    });

    it("Should not allow non-poster to update job", async function () {
      const { jobPortal, employer1, employer2 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJobBasic("Software Engineer", "Description", deadline);

      const newDeadline = Math.floor(Date.now() / 1000) + 172800;
      await expect(jobPortal.connect(employer2).updateJobBasic(
        1,
        "Updated Title",
        "Updated description",
        newDeadline
      )).to.be.revertedWith("Only job poster can call this function");
    });

    it("Should allow job poster to close job", async function () {
      const { jobPortal, employer1 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJobBasic("Software Engineer", "Description", deadline);

      await expect(jobPortal.connect(employer1).closeJob(1))
        .to.emit(jobPortal, "JobClosed")
        .withArgs(1);

      const jobBasic = await jobPortal.jobBasics(1);
      expect(jobBasic.status).to.equal(1); // Closed
    });
  });

  describe("Job Applications", function () {
    async function setupJobsFixture() {
      const fixture = await loadFixture(deploySimpleJobPortalFixture);
      const { jobPortal, employer1, employer2, jobSeeker1, jobSeeker2, both1 } = fixture;

      // Register users
      await jobPortal.connect(employer1).registerUserBasic("ABC Company", "hr@abc.com", 1);
      await jobPortal.connect(employer2).registerUserBasic("XYZ Corp", "jobs@xyz.com", 1);
      await jobPortal.connect(jobSeeker1).registerUserBasic("John Doe", "john@example.com", 0);
      await jobPortal.connect(jobSeeker2).registerUserBasic("Jane Smith", "jane@example.com", 0);
      await jobPortal.connect(both1).registerUserBasic("Freelancer", "freelancer@example.com", 2);

      // Post some jobs
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJobBasic("Software Engineer", "Description 1", deadline);
      await jobPortal.connect(employer2).postJobBasic("Data Scientist", "Description 2", deadline);

      return { ...fixture, deadline };
    }

    it("Should allow job seeker to apply for a job", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(setupJobsFixture);

      await expect(jobPortal.connect(jobSeeker1).applyForJobBasic(1))
        .to.emit(jobPortal, "ApplicationSubmitted")
        .withArgs(1, 1, jobSeeker1.address, "John Doe");

      const application = await jobPortal.applications(1);
      expect(application.jobId).to.equal(1);
      expect(application.applicant).to.equal(jobSeeker1.address);
      expect(application.applicantName).to.equal("John Doe");
      expect(application.status).to.equal(0); // Pending

      expect(await jobPortal.applicationIdCounter()).to.equal(1);

      // Check that application count is updated
      const jobBasic = await jobPortal.jobBasics(1);
      expect(jobBasic.applicationsCount).to.equal(1);
    });

    it("Should allow 'Both' type user to apply for a job", async function () {
      const { jobPortal, both1 } = await loadFixture(setupJobsFixture);

      await expect(jobPortal.connect(both1).applyForJobBasic(1))
        .to.emit(jobPortal, "ApplicationSubmitted");
    });

    it("Should not allow employer to apply for a job", async function () {
      const { jobPortal, employer2 } = await loadFixture(setupJobsFixture);

      await expect(jobPortal.connect(employer2).applyForJobBasic(1))
        .to.be.revertedWith("Only job seekers can call this function");
    });

    it("Should not allow applying to own job", async function () {
      const { jobPortal, both1 } = await loadFixture(setupJobsFixture);

      // Post a job with both1 (who can be both employer and job seeker)
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(both1).postJobBasic("Freelance Job", "Description", deadline);

      await expect(jobPortal.connect(both1).applyForJobBasic(3))
        .to.be.revertedWith("Cannot apply to own job");
    });

    it("Should not allow duplicate applications", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(setupJobsFixture);

      await jobPortal.connect(jobSeeker1).applyForJobBasic(1);

      await expect(jobPortal.connect(jobSeeker1).applyForJobBasic(1))
        .to.be.revertedWith("Already applied for this job");
    });

    it("Should not allow applying to closed job", async function () {
      const { jobPortal, employer1, jobSeeker1 } = await loadFixture(setupJobsFixture);

      await jobPortal.connect(employer1).closeJob(1);

      await expect(jobPortal.connect(jobSeeker1).applyForJobBasic(1))
        .to.be.revertedWith("Job is not active");
    });

    it("Should not allow applying after deadline", async function () {
      const { jobPortal, employer1, jobSeeker1 } = await loadFixture(setupJobsFixture);

      // Post job with short deadline (1 hour from now)
      const currentTime = Math.floor(Date.now() / 1000);
      const shortDeadline = currentTime + 3600; // 1 hour
      await jobPortal.connect(employer1).postJobBasic("Quick Job", "Description", shortDeadline);

      // Fast forward time past the deadline using Hardhat network helpers
      const { time } = require("@nomicfoundation/hardhat-network-helpers");
      await time.increaseTo(shortDeadline + 1);

      await expect(jobPortal.connect(jobSeeker1).applyForJobBasic(3))
        .to.be.revertedWith("Application deadline has passed");
    });

    it("Should allow setting application details", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(setupJobsFixture);

      await jobPortal.connect(jobSeeker1).applyForJobBasic(1);

      await jobPortal.connect(jobSeeker1).setApplicationDetails(
        1,
        "I am very interested in this position...",
        "QmResumeHash123"
      );

      const appDetails = await jobPortal.applicationDetails(1);
      expect(appDetails.coverLetter).to.equal("I am very interested in this position...");
      expect(appDetails.resumeHash).to.equal("QmResumeHash123");
    });

    it("Should allow setting application experience", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(setupJobsFixture);

      await jobPortal.connect(jobSeeker1).applyForJobBasic(1);

      await jobPortal.connect(jobSeeker1).setApplicationExperience(
        1,
        "5 years in software development",
        "Senior Developer at TechCorp"
      );

      const appDetails = await jobPortal.applicationDetails(1);
      expect(appDetails.experience).to.equal("5 years in software development");
      expect(appDetails.currentPosition).to.equal("Senior Developer at TechCorp");
    });

    it("Should allow employer to mark application as reviewed", async function () {
      const { jobPortal, employer1, jobSeeker1 } = await loadFixture(setupJobsFixture);

      await jobPortal.connect(jobSeeker1).applyForJobBasic(1);

      await expect(jobPortal.connect(employer1).markApplicationReviewed(1))
        .to.emit(jobPortal, "ApplicationReviewed")
        .withArgs(1, 1);

      const application = await jobPortal.applications(1);
      expect(application.status).to.equal(1); // Reviewed
    });

    it("Should not allow non-employer to mark application as reviewed", async function () {
      const { jobPortal, employer2, jobSeeker1 } = await loadFixture(setupJobsFixture);

      await jobPortal.connect(jobSeeker1).applyForJobBasic(1);

      await expect(jobPortal.connect(employer2).markApplicationReviewed(1))
        .to.be.revertedWith("Only job poster can mark applications as reviewed");
    });
  });

  describe("View Functions", function () {
    async function setupCompleteFixture() {
      const fixture = await loadFixture(deploySimpleJobPortalFixture);
      const { jobPortal, employer1, employer2, jobSeeker1, jobSeeker2 } = fixture;

      // Register users
      await jobPortal.connect(employer1).registerUserBasic("ABC Company", "hr@abc.com", 1);
      await jobPortal.connect(employer2).registerUserBasic("XYZ Corp", "jobs@xyz.com", 1);
      await jobPortal.connect(jobSeeker1).registerUserBasic("John Doe", "john@example.com", 0);
      await jobPortal.connect(jobSeeker2).registerUserBasic("Jane Smith", "jane@example.com", 0);

      // Post jobs
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJobBasic("Software Engineer", "Description 1", deadline);
      await jobPortal.connect(employer2).postJobBasic("Data Scientist", "Description 2", deadline);
      await jobPortal.connect(employer1).postJobBasic("Frontend Developer", "Description 3", deadline);

      // Set job categories
      await jobPortal.connect(employer1).setJobDetails(1, "Technology", "React, Node.js", "Remote");
      await jobPortal.connect(employer2).setJobDetails(2, "Data Science", "Python, ML", "NYC");
      await jobPortal.connect(employer1).setJobDetails(3, "Technology", "JavaScript, CSS", "SF");

      // Apply for jobs
      await jobPortal.connect(jobSeeker1).applyForJobBasic(1);
      await jobPortal.connect(jobSeeker2).applyForJobBasic(1);
      await jobPortal.connect(jobSeeker1).applyForJobBasic(2);

      // Close one job
      await jobPortal.connect(employer1).closeJob(3);

      return fixture;
    }

    it("Should return user jobs", async function () {
      const { jobPortal, employer1 } = await loadFixture(setupCompleteFixture);

      const userJobs = await jobPortal.getUserJobs(employer1.address);
      expect(userJobs).to.have.lengthOf(2);
      expect(userJobs[0]).to.equal(1);
      expect(userJobs[1]).to.equal(3);
    });

    it("Should return user applications", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(setupCompleteFixture);

      const userApps = await jobPortal.getUserApplications(jobSeeker1.address);
      expect(userApps).to.have.lengthOf(2);
      expect(userApps[0]).to.equal(1);
      expect(userApps[1]).to.equal(3);
    });

    it("Should return job applications", async function () {
      const { jobPortal } = await loadFixture(setupCompleteFixture);

      const jobApps = await jobPortal.getJobApplications(1);
      expect(jobApps).to.have.lengthOf(2);
      expect(jobApps[0]).to.equal(1);
      expect(jobApps[1]).to.equal(2);
    });

    it("Should return active jobs", async function () {
      const { jobPortal } = await loadFixture(setupCompleteFixture);

      const activeJobs = await jobPortal.getActiveJobs();
      expect(activeJobs).to.have.lengthOf(2);
      expect(activeJobs[0]).to.equal(1);
      expect(activeJobs[1]).to.equal(2);
    });

    it("Should return jobs by category", async function () {
      const { jobPortal } = await loadFixture(setupCompleteFixture);

      const techJobs = await jobPortal.getJobsByCategory("Technology");
      expect(techJobs).to.have.lengthOf(2);
      expect(techJobs[0]).to.equal(1);
      expect(techJobs[1]).to.equal(3);

      const dataJobs = await jobPortal.getJobsByCategory("Data Science");
      expect(dataJobs).to.have.lengthOf(1);
      expect(dataJobs[0]).to.equal(2);
    });

    it("Should return contract stats", async function () {
      const { jobPortal } = await loadFixture(setupCompleteFixture);

      const [totalJobs, totalApplications, activeJobs] = await jobPortal.getContractStats();
      expect(totalJobs).to.equal(3);
      expect(totalApplications).to.equal(3);
      expect(activeJobs).to.equal(2);
    });

    it("Should return complete job data", async function () {
      const { jobPortal } = await loadFixture(setupCompleteFixture);

      const [jobBasic, jobDetails] = await jobPortal.getCompleteJob(1);
      expect(jobBasic.title).to.equal("Software Engineer");
      expect(jobDetails.category).to.equal("Technology");
      expect(jobDetails.skillsRequired).to.equal("React, Node.js");
    });

    it("Should return complete application data", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(setupCompleteFixture);

      // Add application details
      await jobPortal.connect(jobSeeker1).setApplicationDetails(1, "Cover letter", "QmResumeHash");
      await jobPortal.connect(jobSeeker1).setApplicationExperience(1, "5 years", "Senior Dev");

      const [app, appDetails] = await jobPortal.getCompleteApplication(1);
      expect(app.applicant).to.equal(jobSeeker1.address);
      expect(appDetails.coverLetter).to.equal("Cover letter");
      expect(appDetails.experience).to.equal("5 years");
    });
  });

  describe("Edge Cases and Security", function () {
    it("Should handle invalid job ID", async function () {
      const { jobPortal, employer1 } = await loadFixture(deploySimpleJobPortalFixture);

      await jobPortal.connect(employer1).registerUserBasic("ABC Company", "hr@abc.com", 1);

      await expect(jobPortal.connect(employer1).closeJob(999))
        .to.be.revertedWith("Invalid job ID");
    });

    it("Should handle invalid application ID", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(deploySimpleJobPortalFixture);

      await expect(jobPortal.connect(jobSeeker1).setApplicationDetails(
        999,
        "Cover letter",
        "QmResumeHash"
      )).to.be.revertedWith("Invalid application ID");
    });

    it("Should not allow unregistered users to perform actions", async function () {
      const { jobPortal, employer1 } = await loadFixture(deploySimpleJobPortalFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await expect(jobPortal.connect(employer1).postJobBasic(
        "Software Engineer",
        "Description",
        deadline
      )).to.be.revertedWith("User must be registered and active");
    });

    it("Should maintain correct counters after multiple operations", async function () {
      const { jobPortal, employer1, jobSeeker1, jobSeeker2 } = await loadFixture(deploySimpleJobPortalFixture);

      // Register users
      await jobPortal.connect(employer1).registerUserBasic("ABC Company", "hr@abc.com", 1);
      await jobPortal.connect(jobSeeker1).registerUserBasic("John Doe", "john@example.com", 0);
      await jobPortal.connect(jobSeeker2).registerUserBasic("Jane Smith", "jane@example.com", 0);

      // Post jobs
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJobBasic("Job 1", "Description 1", deadline);
      await jobPortal.connect(employer1).postJobBasic("Job 2", "Description 2", deadline);

      expect(await jobPortal.jobIdCounter()).to.equal(2);

      // Apply for jobs
      await jobPortal.connect(jobSeeker1).applyForJobBasic(1);
      await jobPortal.connect(jobSeeker2).applyForJobBasic(1);
      await jobPortal.connect(jobSeeker1).applyForJobBasic(2);

      expect(await jobPortal.applicationIdCounter()).to.equal(3);

      // Check job application counts
      const job1 = await jobPortal.jobBasics(1);
      const job2 = await jobPortal.jobBasics(2);
      expect(job1.applicationsCount).to.equal(2);
      expect(job2.applicationsCount).to.equal(1);

      // Check user totals
      const employer = await jobPortal.users(employer1.address);
      const seeker1 = await jobPortal.users(jobSeeker1.address);
      const seeker2 = await jobPortal.users(jobSeeker2.address);
      
      expect(employer.totalJobsPosted).to.equal(2);
      expect(seeker1.totalApplications).to.equal(2);
      expect(seeker2.totalApplications).to.equal(1);
    });
  });
});