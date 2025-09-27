// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleJobPortal
 * @dev A simple job portal for job posting and applications (Maximum Stack Optimization)
 * @author Your Name
 */
contract SimpleJobPortal {
    // ============ STATE VARIABLES ============
    
    address public owner;
    address public backendAddress;
    uint256 public jobIdCounter = 0;
    uint256 public applicationIdCounter = 0;
    
    // ============ ENUMS ============
    
    enum JobStatus { Active, Closed }
    enum ApplicationStatus { Pending, Reviewed }
    enum UserType { JobSeeker, Employer, Both }
    
    // ============ STRUCTS ============
    
    struct User {
        address userAddress;
        string name;
        string email;
        string phone;
        string profileHash; // IPFS hash for profile data
        UserType userType;
        uint256 totalJobsPosted;
        uint256 totalApplications;
        bool isActive;
        bool isVerified; // Verified by backend
        uint256 registrationDate;
    }
    
    // Split job struct into smaller parts to avoid stack issues
    struct JobBasic {
        uint256 jobId;
        address employer;
        string title;
        string description;
        JobStatus status;
        uint256 applicationsCount;
        uint256 createdAt;
        uint256 deadline;
    }
    
    struct JobDetails {
        string category;
        string skillsRequired;
        string location;
        string salaryRange;
        string jobType;
        string metadataHash;
    }
    
    struct Application {
        uint256 applicationId;
        uint256 jobId;
        address applicant;
        string applicantName;
        string applicantEmail;
        string applicantPhone;
        ApplicationStatus status;
        uint256 appliedAt;
    }
    
    struct ApplicationDetails {
        string coverLetter;
        string resumeHash;
        string experience;
        string currentPosition;
    }
    
    // ============ MAPPINGS ============
    
    mapping(address => User) public users;
    mapping(uint256 => JobBasic) public jobBasics;
    mapping(uint256 => JobDetails) public jobDetails;
    mapping(uint256 => Application) public applications;
    mapping(uint256 => ApplicationDetails) public applicationDetails;
    mapping(address => uint256[]) public userJobs;
    mapping(address => uint256[]) public userApplications;
    mapping(uint256 => uint256[]) public jobApplications;
    
    // ============ EVENTS ============
    
    event UserRegistered(address indexed user, string name, UserType userType);
    event UserVerified(address indexed user);
    event BackendAddressUpdated(address indexed oldBackend, address indexed newBackend);
    event JobPosted(uint256 indexed jobId, address indexed employer, string title);
    event JobUpdated(uint256 indexed jobId, string title);
    event JobClosed(uint256 indexed jobId);
    event ApplicationSubmitted(uint256 indexed applicationId, uint256 indexed jobId, address indexed applicant, string applicantName);
    event ApplicationReviewed(uint256 indexed applicationId, uint256 indexed jobId);
    
    // ============ MODIFIERS ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyRegistered() {
        require(users[msg.sender].isActive, "User must be registered and active");
        _;
    }
    
    modifier onlyEmployer() {
        UserType userType = users[msg.sender].userType;
        require(
            userType == UserType.Employer || userType == UserType.Both, 
            "Only employers can call this function"
        );
        _;
    }
    
    modifier onlyJobSeeker() {
        UserType userType = users[msg.sender].userType;
        require(
            userType == UserType.JobSeeker || userType == UserType.Both, 
            "Only job seekers can call this function"
        );
        _;
    }
    
    modifier validJob(uint256 _jobId) {
        require(_jobId > 0 && _jobId <= jobIdCounter, "Invalid job ID");
        _;
    }
    
    modifier onlyJobPoster(uint256 _jobId) {
        require(jobBasics[_jobId].employer == msg.sender, "Only job poster can call this function");
        _;
    }
    
    modifier onlyBackend() {
        require(msg.sender == backendAddress, "Only backend can call this function");
        require(backendAddress != address(0), "Backend address not set");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        owner = msg.sender;
    }
    
    // ============ USER MANAGEMENT FUNCTIONS ============
    
    /**
     * @dev Register a new user - Step 1: Basic info
     */
    function registerUserBasic(
        string calldata _name,
        string calldata _email,
        UserType _userType
    ) external {
        require(!users[msg.sender].isActive, "User already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");
        
        User storage newUser = users[msg.sender];
        newUser.userAddress = msg.sender;
        newUser.name = _name;
        newUser.email = _email;
        newUser.userType = _userType;
        newUser.totalJobsPosted = 0;
        newUser.totalApplications = 0;  
        newUser.isActive = true;
        newUser.isVerified = false;
        newUser.registrationDate = block.timestamp;
        
        emit UserRegistered(msg.sender, _name, _userType);
    }
    
    /**
     * @dev Register a new user - Step 2: Additional details
     */
    function setUserDetails(
        string calldata _phone,
        string calldata _profileHash
    ) external onlyRegistered {
        User storage user = users[msg.sender];
        user.phone = _phone;
        user.profileHash = _profileHash;
    }
    
    /**
     * @dev Update user profile
     */
    function updateProfile(
        string calldata _name,
        string calldata _email,
        string calldata _phone,
        string calldata _profileHash
    ) external onlyRegistered {
        User storage user = users[msg.sender];
        user.name = _name;
        user.email = _email;
        user.phone = _phone;
        user.profileHash = _profileHash;
    }
    
    // ============ JOB MANAGEMENT FUNCTIONS ============
    
    /**
     * @dev Post a new job - Step 1: Basic info
     */
    function postJobBasic(
        string calldata _title,
        string calldata _description,
        uint256 _deadline
    ) external onlyRegistered onlyEmployer returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_deadline > block.timestamp, "Deadline must be in future");
        
        unchecked {
            ++jobIdCounter;
        }
        
        JobBasic storage newJob = jobBasics[jobIdCounter];
        newJob.jobId = jobIdCounter;
        newJob.employer = msg.sender;
        newJob.title = _title;
        newJob.description = _description;
        newJob.status = JobStatus.Active;
        newJob.applicationsCount = 0;
        newJob.createdAt = block.timestamp;
        newJob.deadline = _deadline;
        
        userJobs[msg.sender].push(jobIdCounter);
        unchecked {
            ++users[msg.sender].totalJobsPosted;
        }
        
        emit JobPosted(jobIdCounter, msg.sender, _title);
        return jobIdCounter;
    }
    
    /**
     * @dev Post a new job - Step 2: Additional details
     */
    function setJobDetails(
        uint256 _jobId,
        string calldata _category,
        string calldata _skillsRequired,
        string calldata _location
    ) external validJob(_jobId) onlyJobPoster(_jobId) {
        JobDetails storage details = jobDetails[_jobId];
        details.category = _category;
        details.skillsRequired = _skillsRequired;
        details.location = _location;
    }
    
    /**
     * @dev Post a new job - Step 3: More details
     */
    function setJobMoreDetails(
        uint256 _jobId,
        string calldata _salaryRange,
        string calldata _jobType,
        string calldata _metadataHash
    ) external validJob(_jobId) onlyJobPoster(_jobId) {
        JobDetails storage details = jobDetails[_jobId];
        details.salaryRange = _salaryRange;
        details.jobType = _jobType;
        details.metadataHash = _metadataHash;
    }
    
    /**
     * @dev Update job basic info
     */
    function updateJobBasic(
        uint256 _jobId,
        string calldata _title,
        string calldata _description,
        uint256 _deadline
    ) external validJob(_jobId) onlyJobPoster(_jobId) {
        JobBasic storage job = jobBasics[_jobId];
        require(job.status == JobStatus.Active, "Can only update active jobs");
        require(_deadline > block.timestamp, "Deadline must be in future");
        
        job.title = _title;
        job.description = _description;
        job.deadline = _deadline;
        
        emit JobUpdated(_jobId, _title);
    }
    
    /**
     * @dev Update job salary
     */
    function updateJobSalary(
        uint256 _jobId,
        string calldata _salaryRange
    ) external validJob(_jobId) onlyJobPoster(_jobId) {
        require(jobBasics[_jobId].status == JobStatus.Active, "Can only update active jobs");
        jobDetails[_jobId].salaryRange = _salaryRange;
    }
    
    /**
     * @dev Close a job
     */
    function closeJob(uint256 _jobId) external validJob(_jobId) onlyJobPoster(_jobId) {
        JobBasic storage job = jobBasics[_jobId];
        require(job.status == JobStatus.Active, "Job is not active");
        
        job.status = JobStatus.Closed;
        emit JobClosed(_jobId);
    }
    
    // ============ APPLICATION FUNCTIONS ============
    
    /**
     * @dev Apply for a job - Step 1: Basic application
     */
    function applyForJobBasic(uint256 _jobId) external validJob(_jobId) onlyRegistered onlyJobSeeker returns (uint256) {
        JobBasic storage job = jobBasics[_jobId];
        require(job.status == JobStatus.Active, "Job is not active");
        require(job.employer != msg.sender, "Cannot apply to own job");
        require(block.timestamp <= job.deadline, "Application deadline has passed");
        
        _checkDuplicateApplication(_jobId);
        
        unchecked {
            ++applicationIdCounter;
        }
        
        Application storage newApp = applications[applicationIdCounter];
        User storage user = users[msg.sender];
        
        newApp.applicationId = applicationIdCounter;
        newApp.jobId = _jobId;
        newApp.applicant = msg.sender;
        newApp.applicantName = user.name;
        newApp.applicantEmail = user.email;
        newApp.applicantPhone = user.phone;
        newApp.status = ApplicationStatus.Pending;
        newApp.appliedAt = block.timestamp;
        
        jobApplications[_jobId].push(applicationIdCounter);
        userApplications[msg.sender].push(applicationIdCounter);
        unchecked {
            ++job.applicationsCount;
            ++user.totalApplications;
        }
        
        emit ApplicationSubmitted(applicationIdCounter, _jobId, msg.sender, user.name);
        return applicationIdCounter;
    }
    
    /**
     * @dev Apply for a job - Step 2: Add application details
     */
    function setApplicationDetails(
        uint256 _applicationId,
        string calldata _coverLetter,
        string calldata _resumeHash
    ) external {
        require(_applicationId > 0 && _applicationId <= applicationIdCounter, "Invalid application ID");
        require(applications[_applicationId].applicant == msg.sender, "Only applicant can set details");
        
        ApplicationDetails storage details = applicationDetails[_applicationId];
        details.coverLetter = _coverLetter;
        details.resumeHash = _resumeHash;
    }
    
    /**
     * @dev Apply for a job - Step 3: Add experience details
     */
    function setApplicationExperience(
        uint256 _applicationId,
        string calldata _experience,
        string calldata _currentPosition
    ) external {
        require(_applicationId > 0 && _applicationId <= applicationIdCounter, "Invalid application ID");
        require(applications[_applicationId].applicant == msg.sender, "Only applicant can set details");
        
        ApplicationDetails storage details = applicationDetails[_applicationId];
        details.experience = _experience;
        details.currentPosition = _currentPosition;
    }

    /**
     * @dev Internal function to check for duplicate applications
     */
    function _checkDuplicateApplication(uint256 _jobId) internal view {
        uint256[] storage userApps = userApplications[msg.sender];
        uint256 length = userApps.length;
        
        for (uint256 i; i < length;) {
            if (applications[userApps[i]].jobId == _jobId) {
                revert("Already applied for this job");
            }
            unchecked {
                ++i;
            }
        }
    }
    
    /**
     * @dev Mark application as reviewed by employer
     */
    function markApplicationReviewed(uint256 _applicationId) external {
        require(_applicationId > 0 && _applicationId <= applicationIdCounter, "Invalid application ID");
        
        Application storage app = applications[_applicationId];
        require(jobBasics[app.jobId].employer == msg.sender, "Only job poster can mark applications as reviewed");
        require(app.status == ApplicationStatus.Pending, "Application is not pending");
        
        app.status = ApplicationStatus.Reviewed;
        
        emit ApplicationReviewed(_applicationId, app.jobId);
    }
    
    // ============ VERIFICATION FUNCTIONS ============
    
    function markVerified(address _user) external onlyBackend {
        User storage user = users[_user];
        require(user.isActive, "User must be registered");
        require(!user.isVerified, "User already verified");
        
        user.isVerified = true;
        emit UserVerified(_user);
    }
    
    function removeVerification(address _user) external onlyBackend {
        User storage user = users[_user];
        require(user.isActive, "User must be registered");
        require(user.isVerified, "User not verified");
        
        user.isVerified = false;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function setBackendAddress(address _backendAddress) external onlyOwner {
        require(_backendAddress != address(0), "Backend address cannot be zero");
        
        address oldBackend = backendAddress;
        backendAddress = _backendAddress;
        
        emit BackendAddressUpdated(oldBackend, _backendAddress);
    }
    
    function getBackendAddress() external view returns (address) {
        return backendAddress;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getUserJobs(address _user) external view returns (uint256[] memory) {
        return userJobs[_user];
    }
    
    function getUserApplications(address _user) external view returns (uint256[] memory) {
        return userApplications[_user];
    }
    
    function getJobApplications(uint256 _jobId) external view returns (uint256[] memory) {
        return jobApplications[_jobId];
    }
    
    function getActiveJobs() external view returns (uint256[] memory) {
        uint256 count;
        uint256 totalJobs = jobIdCounter;
        
        for (uint256 i = 1; i <= totalJobs;) {
            if (jobBasics[i].status == JobStatus.Active) {
                unchecked { ++count; }
            }
            unchecked { ++i; }
        }
        
        uint256[] memory activeJobs = new uint256[](count);
        uint256 index;
        
        for (uint256 i = 1; i <= totalJobs;) {
            if (jobBasics[i].status == JobStatus.Active) {
                activeJobs[index] = i;
                unchecked { ++index; }
            }
            unchecked { ++i; }
        }
        
        return activeJobs;
    }
    
    function getJobsByCategory(string calldata _category) external view returns (uint256[] memory) {
        uint256 count;
        bytes32 categoryHash = keccak256(abi.encodePacked(_category));
        uint256 totalJobs = jobIdCounter;
        
        for (uint256 i = 1; i <= totalJobs;) {
            if (keccak256(abi.encodePacked(jobDetails[i].category)) == categoryHash) {
                unchecked { ++count; }
            }
            unchecked { ++i; }
        }
        
        uint256[] memory categoryJobs = new uint256[](count);
        uint256 index;
        
        for (uint256 i = 1; i <= totalJobs;) {
            if (keccak256(abi.encodePacked(jobDetails[i].category)) == categoryHash) {
                categoryJobs[index] = i;
                unchecked { ++index; }
            }
            unchecked { ++i; }
        }
        
        return categoryJobs;
    }
    
    function isUserVerified(address _user) external view returns (bool) {
        return users[_user].isVerified;
    }
    
    function getContractStats() external view returns (
        uint256 totalJobs,
        uint256 totalApplications,
        uint256 activeJobs
    ) {
        uint256 activeCount;
        uint256 totalJobsCount = jobIdCounter;
        
        for (uint256 i = 1; i <= totalJobsCount;) {
            if (jobBasics[i].status == JobStatus.Active) {
                unchecked { ++activeCount; }
            }
            unchecked { ++i; }
        }
        
        return (totalJobsCount, applicationIdCounter, activeCount);
    }
    
    // ============ GETTER FUNCTIONS FOR COMPLETE DATA ============
    
    function getCompleteJob(uint256 _jobId) external view validJob(_jobId) returns (
        JobBasic memory basic,
        JobDetails memory details
    ) {
        return (jobBasics[_jobId], jobDetails[_jobId]);
    }
    
    function getCompleteApplication(uint256 _applicationId) external view returns (
        Application memory app,
        ApplicationDetails memory details
    ) {
        require(_applicationId > 0 && _applicationId <= applicationIdCounter, "Invalid application ID");
        return (applications[_applicationId], applicationDetails[_applicationId]);
    }
}