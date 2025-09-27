// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleJobPortal
 * @dev Optimized job portal contract - Stack optimized version
 */
contract SimpleJobPortal {
    // ============ STATE VARIABLES ============
    
    address public owner;
    address public backendAddress;
    uint256 public jobIdCounter;
    uint256 public applicationIdCounter;
    
    // ============ ENUMS ============
    
    enum JobStatus { Active, Closed }
    enum ApplicationStatus { Pending, Reviewed }
    enum UserType { JobSeeker, Employer, Both }
    
    // ============ STRUCTS ============
    
    struct User {
        string name;
        string email;
        string phone;
        string profileHash;
        UserType userType;
        uint32 totalJobsPosted;
        uint32 totalApplications;
        uint32 registrationDate;
        bool isActive;
        bool isVerified;
    }
    
    struct Job {
        address employer;
        string title;
        string description;
        string category;
        string location;
        string salaryRange;
        string metadataHash;
        uint32 applicationsCount;
        uint32 createdAt;
        uint32 deadline;
        JobStatus status;
    }
    
    struct Application {
        uint256 jobId;
        address applicant;
        string coverLetter;
        string resumeHash;
        uint32 appliedAt;
        ApplicationStatus status;
    }
    
    // ============ MAPPINGS ============
    
    mapping(address => User) public users;
    mapping(uint256 => Job) public jobs;
    mapping(uint256 => Application) public applications;
    mapping(address => uint256[]) public userJobs;
    mapping(address => uint256[]) public userApplications;
    mapping(uint256 => uint256[]) public jobApplications;
    
    // ============ EVENTS ============
    
    event UserRegistered(address indexed user, string name);
    event UserVerified(address indexed user);
    event JobPosted(uint256 indexed jobId, address indexed employer);
    event JobUpdated(uint256 indexed jobId);
    event JobClosed(uint256 indexed jobId);
    event ApplicationSubmitted(uint256 indexed applicationId, uint256 indexed jobId, address indexed applicant);
    event ApplicationReviewed(uint256 indexed applicationId);
    
    // ============ MODIFIERS ============
    
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    modifier onlyRegistered() {
        require(users[msg.sender].isActive);
        _;
    }
    
    modifier onlyEmployer() {
        UserType ut = users[msg.sender].userType;
        require(ut == UserType.Employer || ut == UserType.Both);
        _;
    }
    
    modifier onlyJobSeeker() {
        UserType ut = users[msg.sender].userType;
        require(ut == UserType.JobSeeker || ut == UserType.Both);
        _;
    }
    
    modifier validJob(uint256 _jobId) {
        require(_jobId > 0 && _jobId <= jobIdCounter);
        _;
    }
    
    modifier onlyJobPoster(uint256 _jobId) {
        require(jobs[_jobId].employer == msg.sender);
        _;
    }
    
    modifier onlyBackend() {
        require(msg.sender == backendAddress && backendAddress != address(0));
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        owner = msg.sender;
    }
    
    // ============ USER MANAGEMENT ============
    
    function registerUser(
        string calldata _name,
        string calldata _email,
        UserType _userType
    ) external {
        require(!users[msg.sender].isActive);
        require(bytes(_name).length > 0);
        
        User storage user = users[msg.sender];
        user.name = _name;
        user.email = _email;
        user.userType = _userType;
        user.totalJobsPosted = 0;
        user.totalApplications = 0;
        user.registrationDate = uint32(block.timestamp);
        user.isActive = true;
        user.isVerified = false;
        
        emit UserRegistered(msg.sender, _name);
    }
    
    function setUserDetails(
        string calldata _phone,
        string calldata _profileHash
    ) external onlyRegistered {
        User storage user = users[msg.sender];
        user.phone = _phone;
        user.profileHash = _profileHash;
    }
    
    function updateProfile(
        string calldata _name,
        string calldata _email
    ) external onlyRegistered {
        User storage user = users[msg.sender];
        user.name = _name;
        user.email = _email;
    }
    
    // ============ JOB MANAGEMENT ============
    
    function postJob(
        string calldata _title,
        string calldata _description,
        uint256 _deadline
    ) external onlyRegistered onlyEmployer returns (uint256) {
        require(bytes(_title).length > 0);
        require(_deadline > block.timestamp);
        
        unchecked { ++jobIdCounter; }
        
        Job storage job = jobs[jobIdCounter];
        job.employer = msg.sender;
        job.title = _title;
        job.description = _description;
        job.applicationsCount = 0;
        job.createdAt = uint32(block.timestamp);
        job.deadline = uint32(_deadline);
        job.status = JobStatus.Active;
        
        userJobs[msg.sender].push(jobIdCounter);
        unchecked { ++users[msg.sender].totalJobsPosted; }
        
        emit JobPosted(jobIdCounter, msg.sender);
        return jobIdCounter;
    }
    
    function setJobDetails(
        uint256 _jobId,
        string calldata _category,
        string calldata _location,
        string calldata _salaryRange
    ) external validJob(_jobId) onlyJobPoster(_jobId) {
        Job storage job = jobs[_jobId];
        job.category = _category;
        job.location = _location;
        job.salaryRange = _salaryRange;
    }
    
    function setJobMetadata(
        uint256 _jobId,
        string calldata _metadataHash
    ) external validJob(_jobId) onlyJobPoster(_jobId) {
        jobs[_jobId].metadataHash = _metadataHash;
    }
    
    function updateJob(
        uint256 _jobId,
        string calldata _title,
        string calldata _description
    ) external validJob(_jobId) onlyJobPoster(_jobId) {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Active);
        
        job.title = _title;
        job.description = _description;
        
        emit JobUpdated(_jobId);
    }
    
    function updateJobSalary(
        uint256 _jobId,
        string calldata _salaryRange
    ) external validJob(_jobId) onlyJobPoster(_jobId) {
        require(jobs[_jobId].status == JobStatus.Active);
        jobs[_jobId].salaryRange = _salaryRange;
    }
    
    function closeJob(uint256 _jobId) external validJob(_jobId) onlyJobPoster(_jobId) {
        require(jobs[_jobId].status == JobStatus.Active);
        jobs[_jobId].status = JobStatus.Closed;
        emit JobClosed(_jobId);
    }
    
    // ============ APPLICATION MANAGEMENT ============
    
    function applyForJob(uint256 _jobId) external validJob(_jobId) onlyRegistered onlyJobSeeker returns (uint256) {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Active);
        require(job.employer != msg.sender);
        require(block.timestamp <= job.deadline);
        
        _checkDuplicateApplication(_jobId);
        
        unchecked { ++applicationIdCounter; }
        
        Application storage app = applications[applicationIdCounter];
        app.jobId = _jobId;
        app.applicant = msg.sender;
        app.appliedAt = uint32(block.timestamp);
        app.status = ApplicationStatus.Pending;
        
        jobApplications[_jobId].push(applicationIdCounter);
        userApplications[msg.sender].push(applicationIdCounter);
        unchecked {
            ++job.applicationsCount;
            ++users[msg.sender].totalApplications;
        }
        
        emit ApplicationSubmitted(applicationIdCounter, _jobId, msg.sender);
        return applicationIdCounter;
    }
    
    function setApplicationDetails(
        uint256 _applicationId,
        string calldata _coverLetter,
        string calldata _resumeHash
    ) external {
        require(_applicationId > 0 && _applicationId <= applicationIdCounter);
        require(applications[_applicationId].applicant == msg.sender);
        
        Application storage app = applications[_applicationId];
        app.coverLetter = _coverLetter;
        app.resumeHash = _resumeHash;
    }
    
    function _checkDuplicateApplication(uint256 _jobId) internal view {
        uint256[] storage userApps = userApplications[msg.sender];
        uint256 length = userApps.length;
        
        for (uint256 i; i < length;) {
            if (applications[userApps[i]].jobId == _jobId) {
                revert("Already applied");
            }
            unchecked { ++i; }
        }
    }
    
    function markApplicationReviewed(uint256 _applicationId) external {
        require(_applicationId > 0 && _applicationId <= applicationIdCounter);
        
        Application storage app = applications[_applicationId];
        require(jobs[app.jobId].employer == msg.sender);
        require(app.status == ApplicationStatus.Pending);
        
        app.status = ApplicationStatus.Reviewed;
        emit ApplicationReviewed(_applicationId);
    }
    
    // ============ VERIFICATION ============
    
    function markVerified(address _user) external onlyBackend {
        require(users[_user].isActive);
        require(!users[_user].isVerified);
        users[_user].isVerified = true;
        emit UserVerified(_user);
    }
    
    function removeVerification(address _user) external onlyBackend {
        require(users[_user].isActive);
        require(users[_user].isVerified);
        users[_user].isVerified = false;
    }
    
    // ============ ADMIN ============
    
    function setBackendAddress(address _backendAddress) external onlyOwner {
        require(_backendAddress != address(0));
        backendAddress = _backendAddress;
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
        uint256 total = jobIdCounter;
        
        for (uint256 i = 1; i <= total;) {
            if (jobs[i].status == JobStatus.Active) {
                unchecked { ++count; }
            }
            unchecked { ++i; }
        }
        
        uint256[] memory activeJobs = new uint256[](count);
        uint256 index;
        
        for (uint256 i = 1; i <= total;) {
            if (jobs[i].status == JobStatus.Active) {
                activeJobs[index] = i;
                unchecked { ++index; }
            }
            unchecked { ++i; }
        }
        
        return activeJobs;
    }
    
    function getJobsByCategory(string calldata _category) external view returns (uint256[] memory) {
        uint256 count;
        bytes32 catHash = keccak256(abi.encodePacked(_category));
        uint256 total = jobIdCounter;
        
        for (uint256 i = 1; i <= total;) {
            if (keccak256(abi.encodePacked(jobs[i].category)) == catHash) {
                unchecked { ++count; }
            }
            unchecked { ++i; }
        }
        
        uint256[] memory categoryJobs = new uint256[](count);
        uint256 index;
        
        for (uint256 i = 1; i <= total;) {
            if (keccak256(abi.encodePacked(jobs[i].category)) == catHash) {
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
    
    function getContractStats() external view returns (uint256, uint256, uint256) {
        uint256 activeCount;
        uint256 total = jobIdCounter;
        
        for (uint256 i = 1; i <= total;) {
            if (jobs[i].status == JobStatus.Active) {
                unchecked { ++activeCount; }
            }
            unchecked { ++i; }
        }
        
        return (total, applicationIdCounter, activeCount);
    }
    
    function getBackendAddress() external view returns (address) {
        return backendAddress;
    }
}