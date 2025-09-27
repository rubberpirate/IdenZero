import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ethers } from 'ethers';
import { Loader2, Award, CheckCircle, ArrowLeft } from 'lucide-react';
import { SBTUNI_ABI, CONTRACT_ADDRESS } from '@/config/contract';
import { useNavigate } from 'react-router-dom';

const MintingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    recipientAddress: '',
    metadataUri: '',
    certificateType: '',
    studentName: '',
    courseName: '',
    grade: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { recipientAddress, metadataUri, certificateType, studentName, courseName, grade } = formData;
    
    if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address",
        variant: "destructive",
      });
      return false;
    }
    
    if (!metadataUri || !certificateType || !studentName || !courseName || !grade) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const mintCertificate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create contract instance
      const contract = new ethers.Contract(CONTRACT_ADDRESS, SBTUNI_ABI, signer);
      
      // Call mint function
      const tx = await contract.mintCertificate(
        formData.recipientAddress,
        formData.metadataUri,
        formData.certificateType,
        formData.studentName,
        formData.courseName,
        formData.grade
      );
      
      setTxHash(tx.hash);
      
      toast({
        title: "Transaction Submitted",
        description: `Transaction hash: ${tx.hash.substring(0, 10)}...`,
      });
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      toast({
        title: "Certificate Minted Successfully!",
        description: `Transaction confirmed`,
      });
      
      // Reset form
      setFormData({
        recipientAddress: '',
        metadataUri: '',
        certificateType: '',
        studentName: '',
        courseName: '',
        grade: ''
      });
      setTxHash('');
      
    } catch (error: any) {
      console.error('Minting error:', error);
      toast({
        title: "Minting Failed",
        description: error.message || "An error occurred while minting the certificate",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-black to-green-900/20 pointer-events-none" />
      
      <div className="relative z-10 w-full pt-8 pb-16 px-4 sm:px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          
          {/* Header with back button */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-8"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Certificate Minting
              </h1>
              <p className="text-gray-400 mt-2">Issue soulbound university certificates</p>
            </div>
          </motion.div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Info Panel */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-400" />
                    SBT Certificate
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Mint immutable, non-transferable certificates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-900/20 border border-green-800/30 rounded-xl">
                    <h3 className="text-green-400 font-semibold mb-2">Features</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        Soulbound tokens (non-transferable)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        Permanent on-chain verification
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        Tamper-proof credentials
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-900/20 border border-blue-800/30 rounded-xl">
                    <h4 className="text-blue-400 font-medium mb-2">Contract Info</h4>
                    <p className="text-xs text-gray-400 font-mono break-all">
                      {CONTRACT_ADDRESS.substring(0, 8)}...{CONTRACT_ADDRESS.substring(CONTRACT_ADDRESS.length - 6)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Minting Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-400" />
                    Mint New Certificate
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Fill in the details below to mint a new soulbound certificate
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Recipient Address */}
                  <div className="space-y-2">
                    <Label htmlFor="recipientAddress" className="text-white">Recipient Address *</Label>
                    <Input
                      id="recipientAddress"
                      placeholder="0x..."
                      value={formData.recipientAddress}
                      onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 font-mono"
                    />
                  </div>

                  {/* Row 1: Certificate Type and Grade */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Certificate Type *</Label>
                      <Select value={formData.certificateType} onValueChange={(value) => handleInputChange('certificateType', value)}>
                        <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="diploma">Diploma</SelectItem>
                          <SelectItem value="degree">Degree</SelectItem>
                          <SelectItem value="certificate">Certificate</SelectItem>
                          <SelectItem value="transcript">Transcript</SelectItem>
                          <SelectItem value="achievement">Achievement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white">Grade *</Label>
                      <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                        <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="C+">C+</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="C-">C-</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                          <SelectItem value="F">F</SelectItem>
                          <SelectItem value="Pass">Pass</SelectItem>
                          <SelectItem value="Fail">Fail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Row 2: Student Name and Course Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentName" className="text-white">Student Name *</Label>
                      <Input
                        id="studentName"
                        placeholder="Enter student's full name"
                        value={formData.studentName}
                        onChange={(e) => handleInputChange('studentName', e.target.value)}
                        className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="courseName" className="text-white">Course Name *</Label>
                      <Input
                        id="courseName"
                        placeholder="Enter course name"
                        value={formData.courseName}
                        onChange={(e) => handleInputChange('courseName', e.target.value)}
                        className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  {/* Metadata URI */}
                  <div className="space-y-2">
                    <Label htmlFor="metadataUri" className="text-white">Metadata URI *</Label>
                    <Textarea
                      id="metadataUri"
                      placeholder="Enter metadata URI (IPFS, HTTP, etc.)"
                      value={formData.metadataUri}
                      onChange={(e) => handleInputChange('metadataUri', e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 font-mono text-sm resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Transaction Hash Display */}
                  {txHash && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-green-900/20 border border-green-800/30 rounded-xl"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-green-400">Transaction Submitted</span>
                      </div>
                      <p className="text-xs text-gray-400 font-mono break-all">{txHash}</p>
                    </motion.div>
                  )}

                  {/* Mint Button */}
                  <Button 
                    onClick={mintCertificate}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 h-12 text-lg font-semibold rounded-xl"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Minting Certificate...
                      </>
                    ) : (
                      <>
                        <Award className="mr-2 h-5 w-5" />
                        Mint Certificate
                      </>
                    )}
                  </Button>

                  {/* Warning */}
                  <div className="p-4 bg-yellow-900/20 border border-yellow-800/30 rounded-xl">
                    <p className="text-sm text-yellow-200">
                      <strong>Note:</strong> This will mint a soulbound token that cannot be transferred. 
                      Make sure all details are correct before minting.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MintingPage;