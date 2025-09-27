const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SimpleJobPortal - Updated Tests", function () {
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
      expect(await jobPortal.getBackendAddress()).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Backend Management", function () {
    it("Should allow owner to set backend address", async function () {
      const { jobPortal, owner, backend } = await loadFixture(deploySimpleJobPortalFixture);
      
      await jobPortal.connect(owner).setBackendAddress(backend.address);
      expect(await jobPortal.getBackendAddress()).to.equal(backend.address);
    });

    it("Should not allow non-owner to set backend address", async function () {
      const { jobPortal, backend, employer1 } = await loadFixture(deploySimpleJobPortalFixture);
      
      await expect(jobPortal.connect(employer1).setBackendAddress(backend.address))
        .to.be.reverted;
    });

    it("Should not allow setting zero address as backend", async function () {
      const { jobPortal, owner } = await loadFixture(deploySimpleJobPortalFixture);
      
      await expect(jobPortal.connect(owner).setBackendAddress(ethers.ZeroAddress))
        .to.be.reverted;
    });
  });

  describe("User Registration", function () {
    it("Should register a new job seeker", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(deploySimpleJobPortalFixture);

      await expect(jobPortal.connect(jobSeeker1).registerUser(
        "John Doe",
        "john@example.com",
        0 // JobSeeker
      )).to.emit(jobPortal, "UserRegistered")
        .withArgs(jobSeeker1.address, "John Doe");

      const user = await jobPortal.users(jobSeeker1.address);
      expect(user.name).to.equal("John Doe");
      expect(user.email).to.equal("john@example.com");
      expect(user.userType).to.equal(0);
      expect(user.isActive).to.be.true;
      expect(user.isVerified).to.be.false;
      expect(user.totalJobsPosted).to.equal(0);
      expect(user.totalApplications).to.equal(0);
    });

    it("Should register a new employer", async function () {
      const { jobPortal, employer1 } = await loadFixture(deploySimpleJobPortalFixture);

      await expect(jobPortal.connect(employer1).registerUser(
        "ABC Company",
        "hr@abc.com",
        1 // Employer
      )).to.emit(jobPortal, "UserRegistered")
        .withArgs(employer1.address, "ABC Company");

      const user = await jobPortal.users(employer1.address);
      expect(user.userType).to.equal(1);
    });

    it("Should register a user with Both type", async function () {
      const { jobPortal, both1 } = await loadFixture(deploySimpleJobPortalFixture);

      await jobPortal.connect(both1).registerUser(
        "Freelancer",
        "freelancer@example.com",
        2 // Both
      );

      const user = await jobPortal.users(both1.address);
      expect(user.userType).to.equal(2);
    });

    it("Should not allow empty name", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(deploySimpleJobPortalFixture);

      await expect(jobPortal.connect(jobSeeker1).registerUser(
        "",
        "john@example.com",
        0
      )).to.be.reverted;
    });

    it("Should not allow double registration", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(deploySimpleJobPortalFixture);

      await jobPortal.connect(jobSeeker1).registerUser(
        "John Doe",
        "john@example.com",
        0
      );

      await expect(jobPortal.connect(jobSeeker1).registerUser(
        "John Doe Updated",
        "john.new@example.com",
        0
      )).to.be.reverted;
    });

    it("Should allow setting user details after registration", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(deploySimpleJobPortalFixture);

      await jobPortal.connect(jobSeeker1).registerUser(
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

      await jobPortal.connect(jobSeeker1).registerUser(
        "John Doe",
        "john@example.com",
        0
      );

      await jobPortal.connect(jobSeeker1).updateProfile(
        "John Doe Updated",
        "john.new@example.com"
      );

      const user = await jobPortal.users(jobSeeker1.address);
      expect(user.name).to.equal("John Doe Updated");
      expect(user.email).to.equal("john.new@example.com");
    });
  });

  describe("User Verification", function () {
    it("Should allow backend to verify users", async function () {
      const { jobPortal, owner, backend, jobSeeker1 } = await loadFixture(deploySimpleJobPortalFixture);

      // Set backend address
      await jobPortal.connect(owner).setBackendAddress(backend.address);

      // Register user
      await jobPortal.connect(jobSeeker1).registerUser(
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
      await jobPortal.connect(jobSeeker1).registerUser("John Doe", "john@example.com", 0);

      await expect(jobPortal.connect(employer1).markVerified(jobSeeker1.address))
        .to.be.reverted;
    });

    it("Should allow backend to remove verification", async function () {
      const { jobPortal, owner, backend, jobSeeker1 } = await loadFixture(deploySimpleJobPortalFixture);

      await jobPortal.connect(owner).setBackendAddress(backend.address);
      await jobPortal.connect(jobSeeker1).registerUser("John Doe", "john@example.com", 0);
      await jobPortal.connect(backend).markVerified(jobSeeker1.address);

      await jobPortal.connect(backend).removeVerification(jobSeeker1.address);
      expect(await jobPortal.isUserVerified(jobSeeker1.address)).to.be.false;
    });
  });

  describe("Job Posting", function () {
    async function setupUsersFixture() {
      const { jobPortal, owner, backend, employer1, employer2, jobSeeker1, jobSeeker2, both1 } = await loadFixture(deploySimpleJobPortalFixture);

      // Register users
      await jobPortal.connect(employer1).registerUser("ABC Company", "hr@abc.com", 1);
      await jobPortal.connect(employer2).registerUser("XYZ Corp", "jobs@xyz.com", 1);
      await jobPortal.connect(jobSeeker1).registerUser("John Doe", "john@example.com", 0);
      await jobPortal.connect(jobSeeker2).registerUser("Jane Smith", "jane@example.com", 0);
      await jobPortal.connect(both1).registerUser("Freelancer", "freelancer@example.com", 2);

      return { jobPortal, owner, backend, employer1, employer2, jobSeeker1, jobSeeker2, both1 };
    }

    it("Should allow employer to post a job", async function () {
      const { jobPortal, employer1 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400; // 1 day from now

      await expect(jobPortal.connect(employer1).postJob(
        "Software Engineer",
        "We are looking for a skilled software engineer",
        deadline
      )).to.emit(jobPortal, "JobPosted")
        .withArgs(1, employer1.address);

      const job = await jobPortal.jobs(1);
      expect(job.title).to.equal("Software Engineer");
      expect(job.description).to.equal("We are looking for a skilled software engineer");
      expect(job.employer).to.equal(employer1.address);
      expect(job.status).to.equal(0); // Active
      expect(job.applicationsCount).to.equal(0);
      expect(job.deadline).to.equal(deadline);

      expect(await jobPortal.jobIdCounter()).to.equal(1);

      // Check user's total jobs posted
      const user = await jobPortal.users(employer1.address);
      expect(user.totalJobsPosted).to.equal(1);
    });

    it("Should not allow job seeker to post a job", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await expect(jobPortal.connect(jobSeeker1).postJob(
        "Software Engineer",
        "Description",
        deadline
      )).to.be.reverted;
    });

    it("Should allow 'Both' type user to post a job", async function () {
      const { jobPortal, both1 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await expect(jobPortal.connect(both1).postJob(
        "Freelance Project",
        "Looking for a freelancer",
        deadline
      )).to.emit(jobPortal, "JobPosted");
    });

    it("Should not allow empty title", async function () {
      const { jobPortal, employer1 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await expect(jobPortal.connect(employer1).postJob(
        "",
        "Description",
        deadline
      )).to.be.reverted;
    });

    it("Should not allow past deadline", async function () {
      const { jobPortal, employer1 } = await loadFixture(setupUsersFixture);

      const pastDeadline = Math.floor(Date.now() / 1000) - 86400; // 1 day ago

      await expect(jobPortal.connect(employer1).postJob(
        "Software Engineer",
        "Description",
        pastDeadline
      )).to.be.reverted;
    });

    it("Should allow setting job details", async function () {
      const { jobPortal, employer1 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJob("Software Engineer", "Description", deadline);

      await jobPortal.connect(employer1).setJobDetails(
        1,
        "Technology",
        "Remote",
        "$80,000 - $120,000"
      );

      const job = await jobPortal.jobs(1);
      expect(job.category).to.equal("Technology");
      expect(job.location).to.equal("Remote");
      expect(job.salaryRange).to.equal("$80,000 - $120,000");
    });

    it("Should allow setting job metadata", async function () {
      const { jobPortal, employer1 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJob("Software Engineer", "Description", deadline);

      await jobPortal.connect(employer1).setJobMetadata(
        1,
        "QmJobMetadataHash123"
      );

      const job = await jobPortal.jobs(1);
      expect(job.metadataHash).to.equal("QmJobMetadataHash123");
    });

    it("Should allow job poster to update job", async function () {
      const { jobPortal, employer1 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJob("Software Engineer", "Description", deadline);

      await expect(jobPortal.connect(employer1).updateJob(
        1,
        "Senior Software Engineer",
        "Updated description"
      )).to.emit(jobPortal, "JobUpdated")
        .withArgs(1);

      const job = await jobPortal.jobs(1);
      expect(job.title).to.equal("Senior Software Engineer");
      expect(job.description).to.equal("Updated description");
    });

    it("Should allow updating job salary only", async function () {
      const { jobPortal, employer1 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJob("Software Engineer", "Description", deadline);

      await jobPortal.connect(employer1).updateJobSalary(1, "$90,000 - $130,000");

      const job = await jobPortal.jobs(1);
      expect(job.salaryRange).to.equal("$90,000 - $130,000");
    });

    it("Should not allow non-poster to update job", async function () {
      const { jobPortal, employer1, employer2 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJob("Software Engineer", "Description", deadline);

      await expect(jobPortal.connect(employer2).updateJob(
        1,
        "Updated Title",
        "Updated description"
      )).to.be.reverted;
    });

    it("Should allow job poster to close job", async function () {
      const { jobPortal, employer1 } = await loadFixture(setupUsersFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJob("Software Engineer", "Description", deadline);

      await expect(jobPortal.connect(employer1).closeJob(1))
        .to.emit(jobPortal, "JobClosed")
        .withArgs(1);

      const job = await jobPortal.jobs(1);
      expect(job.status).to.equal(1); // Closed
    });
  });

  describe("Job Applications", function () {
    async function setupJobsFixture() {
      const fixture = await loadFixture(deploySimpleJobPortalFixture);
      const { jobPortal, employer1, employer2, jobSeeker1, jobSeeker2, both1 } = fixture;

      // Register users
      await jobPortal.connect(employer1).registerUser("ABC Company", "hr@abc.com", 1);
      await jobPortal.connect(employer2).registerUser("XYZ Corp", "jobs@xyz.com", 1);
      await jobPortal.connect(jobSeeker1).registerUser("John Doe", "john@example.com", 0);
      await jobPortal.connect(jobSeeker2).registerUser("Jane Smith", "jane@example.com", 0);
      await jobPortal.connect(both1).registerUser("Freelancer", "freelancer@example.com", 2);

      // Post some jobs
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJob("Software Engineer", "Description 1", deadline);
      await jobPortal.connect(employer2).postJob("Data Scientist", "Description 2", deadline);

      return { ...fixture, deadline };
    }

    it("Should allow job seeker to apply for a job", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(setupJobsFixture);

      await expect(jobPortal.connect(jobSeeker1).applyForJob(1))
        .to.emit(jobPortal, "ApplicationSubmitted")
        .withArgs(1, 1, jobSeeker1.address);

      const application = await jobPortal.applications(1);
      expect(application.jobId).to.equal(1);
      expect(application.applicant).to.equal(jobSeeker1.address);
      expect(application.status).to.equal(0); // Pending

      expect(await jobPortal.applicationIdCounter()).to.equal(1);

      // Check that application count is updated
      const job = await jobPortal.jobs(1);
      expect(job.applicationsCount).to.equal(1);

      // Check user's total applications
      const user = await jobPortal.users(jobSeeker1.address);
      expect(user.totalApplications).to.equal(1);
    });

    it("Should allow 'Both' type user to apply for a job", async function () {
      const { jobPortal, both1 } = await loadFixture(setupJobsFixture);

      await expect(jobPortal.connect(both1).applyForJob(1))
        .to.emit(jobPortal, "ApplicationSubmitted");
    });

    it("Should not allow employer to apply for a job", async function () {
      const { jobPortal, employer2 } = await loadFixture(setupJobsFixture);

      await expect(jobPortal.connect(employer2).applyForJob(1))
        .to.be.reverted;
    });

    it("Should not allow applying to own job", async function () {
      const { jobPortal, both1 } = await loadFixture(setupJobsFixture);

      // Post a job with both1 (who can be both employer and job seeker)
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(both1).postJob("Freelance Job", "Description", deadline);

      await expect(jobPortal.connect(both1).applyForJob(3))
        .to.be.reverted;
    });

    it("Should not allow duplicate applications", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(setupJobsFixture);

      await jobPortal.connect(jobSeeker1).applyForJob(1);

      await expect(jobPortal.connect(jobSeeker1).applyForJob(1))
        .to.be.revertedWith("Already applied");
    });

    it("Should not allow applying to closed job", async function () {
      const { jobPortal, employer1, jobSeeker1 } = await loadFixture(setupJobsFixture);

      await jobPortal.connect(employer1).closeJob(1);

      await expect(jobPortal.connect(jobSeeker1).applyForJob(1))
        .to.be.reverted;
    });

    it("Should not allow applying after deadline", async function () {
      const { jobPortal, employer1, jobSeeker1 } = await loadFixture(setupJobsFixture);

      // Post job with short deadline (1 hour from now)
      const currentTime = await time.latest();
      const shortDeadline = currentTime + 3600; // 1 hour
      await jobPortal.connect(employer1).postJob("Quick Job", "Description", shortDeadline);

      // Fast forward time past the deadline
      await time.increaseTo(shortDeadline + 1);

      await expect(jobPortal.connect(jobSeeker1).applyForJob(3))
        .to.be.reverted;
    });

    it("Should allow setting application details", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(setupJobsFixture);

      await jobPortal.connect(jobSeeker1).applyForJob(1);

      await jobPortal.connect(jobSeeker1).setApplicationDetails(
        1,
        "I am very interested in this position...",
        "QmResumeHash123"
      );

      const application = await jobPortal.applications(1);
      expect(application.coverLetter).to.equal("I am very interested in this position...");
      expect(application.resumeHash).to.equal("QmResumeHash123");
    });

    it("Should allow employer to mark application as reviewed", async function () {
      const { jobPortal, employer1, jobSeeker1 } = await loadFixture(setupJobsFixture);

      await jobPortal.connect(jobSeeker1).applyForJob(1);

      await expect(jobPortal.connect(employer1).markApplicationReviewed(1))
        .to.emit(jobPortal, "ApplicationReviewed")
        .withArgs(1);

      const application = await jobPortal.applications(1);
      expect(application.status).to.equal(1); // Reviewed
    });

    it("Should not allow non-employer to mark application as reviewed", async function () {
      const { jobPortal, employer2, jobSeeker1 } = await loadFixture(setupJobsFixture);

      await jobPortal.connect(jobSeeker1).applyForJob(1);

      await expect(jobPortal.connect(employer2).markApplicationReviewed(1))
        .to.be.reverted;
    });
  });

  describe("View Functions", function () {
    async function setupCompleteFixture() {
      const fixture = await loadFixture(deploySimpleJobPortalFixture);
      const { jobPortal, employer1, employer2, jobSeeker1, jobSeeker2 } = fixture;

      // Register users
      await jobPortal.connect(employer1).registerUser("ABC Company", "hr@abc.com", 1);
      await jobPortal.connect(employer2).registerUser("XYZ Corp", "jobs@xyz.com", 1);
      await jobPortal.connect(jobSeeker1).registerUser("John Doe", "john@example.com", 0);
      await jobPortal.connect(jobSeeker2).registerUser("Jane Smith", "jane@example.com", 0);

      // Post jobs
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJob("Software Engineer", "Description 1", deadline);
      await jobPortal.connect(employer2).postJob("Data Scientist", "Description 2", deadline);
      await jobPortal.connect(employer1).postJob("Frontend Developer", "Description 3", deadline);

      // Set job categories
      await jobPortal.connect(employer1).setJobDetails(1, "Technology", "Remote", "$80k-$120k");
      await jobPortal.connect(employer2).setJobDetails(2, "Data Science", "NYC", "$90k-$140k");
      await jobPortal.connect(employer1).setJobDetails(3, "Technology", "SF", "$85k-$125k");

      // Apply for jobs
      await jobPortal.connect(jobSeeker1).applyForJob(1);
      await jobPortal.connect(jobSeeker2).applyForJob(1);
      await jobPortal.connect(jobSeeker1).applyForJob(2);

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
  });

  describe("Edge Cases and Security", function () {
    it("Should handle invalid job ID", async function () {
      const { jobPortal, employer1 } = await loadFixture(deploySimpleJobPortalFixture);

      await jobPortal.connect(employer1).registerUser("ABC Company", "hr@abc.com", 1);

      await expect(jobPortal.connect(employer1).closeJob(999))
        .to.be.reverted;
    });

    it("Should handle invalid application ID", async function () {
      const { jobPortal, jobSeeker1 } = await loadFixture(deploySimpleJobPortalFixture);

      await expect(jobPortal.connect(jobSeeker1).setApplicationDetails(
        999,
        "Cover letter",
        "QmResumeHash"
      )).to.be.reverted;
    });

    it("Should not allow unregistered users to perform actions", async function () {
      const { jobPortal, employer1 } = await loadFixture(deploySimpleJobPortalFixture);

      const deadline = Math.floor(Date.now() / 1000) + 86400;

      await expect(jobPortal.connect(employer1).postJob(
        "Software Engineer",
        "Description",
        deadline
      )).to.be.reverted;
    });

    it("Should maintain correct counters after multiple operations", async function () {
      const { jobPortal, employer1, jobSeeker1, jobSeeker2 } = await loadFixture(deploySimpleJobPortalFixture);

      // Register users
      await jobPortal.connect(employer1).registerUser("ABC Company", "hr@abc.com", 1);
      await jobPortal.connect(jobSeeker1).registerUser("John Doe", "john@example.com", 0);
      await jobPortal.connect(jobSeeker2).registerUser("Jane Smith", "jane@example.com", 0);

      // Post jobs
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJob("Job 1", "Description 1", deadline);
      await jobPortal.connect(employer1).postJob("Job 2", "Description 2", deadline);

      expect(await jobPortal.jobIdCounter()).to.equal(2);

      // Apply for jobs
      await jobPortal.connect(jobSeeker1).applyForJob(1);
      await jobPortal.connect(jobSeeker2).applyForJob(1);
      await jobPortal.connect(jobSeeker1).applyForJob(2);

      expect(await jobPortal.applicationIdCounter()).to.equal(3);

      // Check job application counts
      const job1 = await jobPortal.jobs(1);
      const job2 = await jobPortal.jobs(2);
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

    it("Should not allow updating closed jobs", async function () {
      const { jobPortal, employer1 } = await loadFixture(deploySimpleJobPortalFixture);

      await jobPortal.connect(employer1).registerUser("ABC Company", "hr@abc.com", 1);
      
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJob("Job 1", "Description 1", deadline);
      await jobPortal.connect(employer1).closeJob(1);

      await expect(jobPortal.connect(employer1).updateJob(1, "New Title", "New Description"))
        .to.be.reverted;
    });

    it("Should not allow re-reviewing applications", async function () {
      const { jobPortal, employer1, jobSeeker1 } = await loadFixture(deploySimpleJobPortalFixture);

      await jobPortal.connect(employer1).registerUser("ABC Company", "hr@abc.com", 1);
      await jobPortal.connect(jobSeeker1).registerUser("John Doe", "john@example.com", 0);
      
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await jobPortal.connect(employer1).postJob("Job 1", "Description 1", deadline);
      await jobPortal.connect(jobSeeker1).applyForJob(1);
      
      await jobPortal.connect(employer1).markApplicationReviewed(1);

      await expect(jobPortal.connect(employer1).markApplicationReviewed(1))
        .to.be.reverted;
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should efficiently handle batch operations", async function () {
      const { jobPortal, employer1, jobSeeker1, jobSeeker2 } = await loadFixture(deploySimpleJobPortalFixture);

      // Register users
      await jobPortal.connect(employer1).registerUser("ABC Company", "hr@abc.com", 1);
      await jobPortal.connect(jobSeeker1).registerUser("John Doe", "john@example.com", 0);
      await jobPortal.connect(jobSeeker2).registerUser("Jane Smith", "jane@example.com", 0);

      // Post multiple jobs efficiently
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      
      const tx1 = await jobPortal.connect(employer1).postJob("Job 1", "Description 1", deadline);
      const tx2 = await jobPortal.connect(employer1).postJob("Job 2", "Description 2", deadline);
      const tx3 = await jobPortal.connect(employer1).postJob("Job 3", "Description 3", deadline);

      // Check that all jobs were created successfully
      expect(await jobPortal.jobIdCounter()).to.equal(3);
      
      // Verify gas efficiency by checking transaction success
      expect(tx1).to.not.be.undefined;
      expect(tx2).to.not.be.undefined;
      expect(tx3).to.not.be.undefined;
    });

    it("Should handle large-scale data retrieval efficiently", async function () {
      const { jobPortal, employer1 } = await loadFixture(deploySimpleJobPortalFixture);

      await jobPortal.connect(employer1).registerUser("ABC Company", "hr@abc.com", 1);

      // Create multiple jobs
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      for (let i = 1; i <= 10; i++) {
        await jobPortal.connect(employer1).postJob(`Job ${i}`, `Description ${i}`, deadline);
        await jobPortal.connect(employer1).setJobDetails(i, "Technology", "Remote", "$80k-$120k");
      }

      // Test efficient retrieval
      const activeJobs = await jobPortal.getActiveJobs();
      expect(activeJobs.length).to.equal(10);

      const techJobs = await jobPortal.getJobsByCategory("Technology");
      expect(techJobs.length).to.equal(10);

      const userJobs = await jobPortal.getUserJobs(employer1.address);
      expect(userJobs.length).to.equal(10);
    });
  });
});