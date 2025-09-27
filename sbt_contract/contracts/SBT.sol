// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SBTUNI - Soulbound Token for University Certificates
 * @dev Non-transferable certificates issued by universities to students
 * @author University Certificate System
 * @notice This contract implements ERC721 but disables all transfer functions to make it soulbound
 */
contract SBTUNI is ERC721, Ownable, ReentrancyGuard {

    // Events
    event Attest(address indexed to, uint256 indexed tokenId, string certificateType);
    event Revoke(address indexed to, uint256 indexed tokenId);
    event Burn(address indexed from, uint256 indexed tokenId);
    event BatchAttest(address[] recipients, uint256[] tokenIds, string certificateType);

    // Certificate structure
    struct Certificate {
        string metadataURI;
        uint256 issuedAt;
        string certificateType;
        string studentName;
        string courseName;
        string grade;
        bool revoked;
    }

    // Batch minting structure to reduce stack depth
    struct BatchData {
        address[] recipients;
        string[] metadataUris;
        string[] studentNames;
        string[] courseNames;
        string[] grades;
    }

    // State variables
    uint256 private _nextTokenId;
    mapping(uint256 => Certificate) private _certificates;
    mapping(string => uint256[]) private _certificatesByType;
    string public universityName;

    constructor(
        string memory _universityName,
        string memory _universitySymbol
    ) ERC721(_universityName, _universitySymbol) Ownable(msg.sender) {
        universityName = _universityName;
        _nextTokenId = 1;
    }

    /**
     * @dev Mint a single certificate
     */
    function mintCertificate(
        address to,
        string calldata metadataUri,
        string calldata certificateType,
        string calldata studentName,
        string calldata courseName,
        string calldata grade
    ) external onlyOwner nonReentrant returns (uint256) {
        require(to != address(0), "Invalid recipient");
        require(bytes(metadataUri).length > 0, "Empty URI");
        require(bytes(certificateType).length > 0, "Empty certificate type");
        require(bytes(studentName).length > 0, "Empty student name");
        require(bytes(courseName).length > 0, "Empty course name");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        _certificates[tokenId] = Certificate({
            metadataURI: metadataUri,
            issuedAt: block.timestamp,
            certificateType: certificateType,
            studentName: studentName,
            courseName: courseName,
            grade: grade,
            revoked: false
        });

        _certificatesByType[certificateType].push(tokenId);
        emit Attest(to, tokenId, certificateType);
        
        return tokenId;
    }

    /**
     * @dev Batch mint certificates with optimized parameters
     */
    function batchMintCertificates(
        BatchData calldata batchData,
        string calldata certificateType
    ) external onlyOwner nonReentrant returns (uint256[] memory) {
        uint256 len = batchData.recipients.length;
        require(len > 0 && len <= 100, "Invalid batch size");
        require(len == batchData.metadataUris.length, "Length mismatch: URIs");
        require(len == batchData.studentNames.length, "Length mismatch: names");
        require(len == batchData.courseNames.length, "Length mismatch: courses");
        require(len == batchData.grades.length, "Length mismatch: grades");

        uint256[] memory tokenIds = new uint256[](len);
        uint256 currentTokenId = _nextTokenId;

        for (uint256 i = 0; i < len; i++) {
            require(batchData.recipients[i] != address(0), "Invalid recipient");
            require(bytes(batchData.metadataUris[i]).length > 0, "Empty URI");

            uint256 tokenId = currentTokenId + i;
            tokenIds[i] = tokenId;
            
            _safeMint(batchData.recipients[i], tokenId);

            _certificates[tokenId] = Certificate({
                metadataURI: batchData.metadataUris[i],
                issuedAt: block.timestamp,
                certificateType: certificateType,
                studentName: batchData.studentNames[i],
                courseName: batchData.courseNames[i],
                grade: batchData.grades[i],
                revoked: false
            });

            _certificatesByType[certificateType].push(tokenId);
        }

        _nextTokenId = currentTokenId + len;
        emit BatchAttest(batchData.recipients, tokenIds, certificateType);
        return tokenIds;
    }

    /**
     * @dev Alternative batch mint with separate arrays (simplified)
     */
    function batchMintCertificatesSimple(
        address[] calldata recipients,
        string[] calldata metadataUris,
        string calldata certificateType
    ) external onlyOwner nonReentrant returns (uint256[] memory) {
        uint256 len = recipients.length;
        require(len > 0 && len <= 100, "Invalid batch size");
        require(len == metadataUris.length, "Length mismatch");

        uint256[] memory tokenIds = new uint256[](len);
        uint256 currentTokenId = _nextTokenId;

        for (uint256 i = 0; i < len; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(bytes(metadataUris[i]).length > 0, "Empty URI");

            uint256 tokenId = currentTokenId + i;
            tokenIds[i] = tokenId;
            
            _safeMint(recipients[i], tokenId);

            _certificates[tokenId] = Certificate({
                metadataURI: metadataUris[i],
                issuedAt: block.timestamp,
                certificateType: certificateType,
                studentName: "", // Empty for simple version
                courseName: "",  // Empty for simple version
                grade: "",       // Empty for simple version
                revoked: false
            });

            _certificatesByType[certificateType].push(tokenId);
        }

        _nextTokenId = currentTokenId + len;
        emit BatchAttest(recipients, tokenIds, certificateType);
        return tokenIds;
    }

    /**
     * @dev Update certificate details after batch minting
     */
    function updateCertificateDetails(
        uint256 tokenId,
        string calldata studentName,
        string calldata courseName,
        string calldata grade
    ) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _certificates[tokenId].studentName = studentName;
        _certificates[tokenId].courseName = courseName;
        _certificates[tokenId].grade = grade;
    }

    /**
     * @dev Burn a certificate
     */
    function burnCertificate(uint256 tokenId) external nonReentrant {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        address tokenOwner = ownerOf(tokenId);
        require(msg.sender == tokenOwner || msg.sender == owner(), "Not authorized");

        _burn(tokenId);
        delete _certificates[tokenId];
        emit Burn(tokenOwner, tokenId);
    }

    /**
     * @dev Override tokenURI
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(!_certificates[tokenId].revoked, "Certificate revoked");
        return _certificates[tokenId].metadataURI;
    }

    /**
     * @dev Get certificate details - returns individual fields to avoid stack issues
     */
    function getCertificateDetails(uint256 tokenId) external view returns (
        string memory metadataURI,
        uint256 issuedAt,
        string memory certificateType,
        string memory studentName,
        string memory courseName,
        string memory grade,
        bool revoked
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        address tokenOwner = ownerOf(tokenId);
        require(msg.sender == tokenOwner || msg.sender == owner(), "Not authorized");
        
        Certificate storage cert = _certificates[tokenId];
        return (
            cert.metadataURI,
            cert.issuedAt,
            cert.certificateType,
            cert.studentName,
            cert.courseName,
            cert.grade,
            cert.revoked
        );
    }

    /**
     * @dev Check if certificate is valid
     */
    function isValid(uint256 tokenId) public view returns (bool) {
        return _ownerOf(tokenId) != address(0) && !_certificates[tokenId].revoked;
    }

    /**
     * @dev Revoke a certificate
     */
    function revokeCertificate(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(!_certificates[tokenId].revoked, "Already revoked");
        _certificates[tokenId].revoked = true;
        emit Revoke(ownerOf(tokenId), tokenId);
    }

    /**
     * @dev Get certificates by type
     */
    function getCertificatesByType(string calldata certificateType) external view onlyOwner returns (uint256[] memory) {
        return _certificatesByType[certificateType];
    }

    /**
     * @dev Public verification - optimized to avoid stack issues
     */
    function verifyCertificate(uint256 tokenId) external view returns (
        address owner_,
        string memory certType,
        bool valid
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        Certificate storage cert = _certificates[tokenId];
        
        return (
            ownerOf(tokenId),
            cert.certificateType,
            isValid(tokenId)
        );
    }

    /**
     * @dev Extended verification with more details
     */
    function verifyCertificateDetailed(uint256 tokenId) external view returns (
        address owner_,
        string memory certType,
        string memory student,
        string memory course,
        uint256 issued,
        bool valid
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        Certificate storage cert = _certificates[tokenId];
        
        return (
            ownerOf(tokenId),
            cert.certificateType,
            cert.studentName,
            cert.courseName,
            cert.issuedAt,
            isValid(tokenId)
        );
    }

    /**
     * @dev Get total supply
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /**
     * @dev Override _update to make tokens soulbound
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("SBT: Transfers disabled");
        }
        return super._update(to, tokenId, auth);
    }

    // Disable approvals
    function approve(address, uint256) public virtual override {
        revert("SBT: Approvals disabled");
    }

    function setApprovalForAll(address, bool) public virtual override {
        revert("SBT: Approvals disabled");
    }

    function getApproved(uint256) public view virtual override returns (address) {
        return address(0);
    }

    function isApprovedForAll(address, address) public view virtual override returns (bool) {
        return false;
    }

    function isPermanent(uint256) external pure returns (bool) {
        return true;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}