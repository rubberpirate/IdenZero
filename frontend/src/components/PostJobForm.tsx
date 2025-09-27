import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  DollarSign,
  Briefcase,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { jobPortalContract, UserType, type User } from '@/utils/contract';

interface JobFormData {
  // Step 1: Basic Info
  title: string;
  description: string;
  deadline: string;
  
  // Step 2: Job Details
  category: string;
  skillsRequired: string;
  location: string;
  
  // Step 3: Additional Details
  salaryRange: string;
  jobType: string;
  metadataHash: string;
}

interface PostJobFormProps {
  onCancel: () => void;
  onSuccess: (jobId: number) => void;
}

const PostJobForm: React.FC<PostJobFormProps> = ({ onCancel, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<number | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    userType: UserType.Employer
  });
  
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    deadline: '',
    category: '',
    skillsRequired: '',
    location: '',
    salaryRange: '',
    jobType: '',
    metadataHash: ''
  });

  // Check user registration status on component mount
  useEffect(() => {
    const checkUserRegistration = async () => {
      setIsCheckingUser(true);
      setError(null);
      
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
          if (accounts.length > 0) {
            const address = accounts[0];
            setUserAddress(address);
            
            const user = await jobPortalContract.getUser(address);
            setCurrentUser(user);
            
            if (!user) {
              setShowRegistration(true);
            } else if (user.userType !== UserType.Employer && user.userType !== UserType.Both) {
              setError('Only employers can post jobs. Please register as an employer or update your account type.');
            }
          } else {
            setError('Please connect your wallet to post a job.');
          }
        } else {
          setError('MetaMask is not installed. Please install MetaMask to continue.');
        }
      } catch (error) {
        console.error('Error checking user registration:', error);
        setError('Failed to check user registration status.');
      } finally {
        setIsCheckingUser(false);
      }
    };

    checkUserRegistration();
  }, []);

  const updateFormData = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleRegistration = async () => {
    if (!registrationData.name || !registrationData.email) {
      setError('Please fill in all registration fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const tx = await jobPortalContract.registerUser(
        registrationData.name,
        registrationData.email,
        registrationData.userType
      );

      if (!tx) {
        throw new Error('Failed to register user');
      }

      await tx.wait();
      
      // Refresh user data
      if (userAddress) {
        const user = await jobPortalContract.getUser(userAddress);
        setCurrentUser(user);
        setShowRegistration(false);
      }
    } catch (error) {
      console.error('Failed to register user:', error);
      setError(error instanceof Error ? error.message : 'Failed to register user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.description && formData.deadline);
      case 2:
        return !!(formData.category && formData.skillsRequired && formData.location);
      case 3:
        return !!(formData.salaryRange && formData.jobType);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) {
      setError('Please fill in all required fields in step 1');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Post basic job info
      const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);
      const tx1 = await jobPortalContract.postJob(
        formData.title,
        formData.description,
        deadlineTimestamp
      );

      if (!tx1) {
        throw new Error('Failed to post basic job info');
      }

      // Wait for transaction and get job ID from event
      const receipt = await tx1.wait();
      if (!receipt) {
        throw new Error('Transaction failed');
      }

      // Extract job ID from events
      const jobPostedEvent = receipt.logs.find(log => {
        try {
          const parsed = jobPortalContract.contract?.interface.parseLog(log);
          return parsed?.name === 'JobPosted';
        } catch {
          return false;
        }
      });

      let newJobId: number;
      if (jobPostedEvent) {
        const parsed = jobPortalContract.contract?.interface.parseLog(jobPostedEvent);
        newJobId = Number(parsed?.args[0]);
      } else {
        // Fallback: assume it's the next job ID
        newJobId = Date.now(); // This should be replaced with proper job ID extraction
      }

      setJobId(newJobId);

      // Step 2: Set job details (if provided)
      if (validateStep(2)) {
        const tx2 = await jobPortalContract.setJobDetails(
          newJobId,
          formData.category,
          formData.location,
          formData.salaryRange
        );

        if (tx2) {
          await tx2.wait();
        }
      }

      // Step 3: Set metadata (if provided)
      if (formData.metadataHash) {
        const tx3 = await jobPortalContract.setJobMetadata(
          newJobId,
          formData.metadataHash
        );

        if (tx3) {
          await tx3.wait();
        }
      }

      onSuccess(newJobId);
    } catch (error) {
      console.error('Failed to post job:', error);
      setError(error instanceof Error ? error.message : 'Failed to post job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
              step <= currentStep
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-gray-400 border-gray-600'
            }`}
          >
            {step < currentStep ? <Check className="w-4 h-4" /> : step}
          </div>
          {step < 3 && (
            <div
              className={`w-12 h-0.5 mx-2 ${
                step < currentStep ? 'bg-white' : 'bg-gray-600'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Basic Job Information</h3>
        <p className="text-gray-400">Let's start with the basics of your job posting</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-white mb-2 block">
            Job Title *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateFormData('title', e.target.value)}
            placeholder="e.g. Senior React Developer"
            className="bg-white/5 border-gray-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-white mb-2 block">
            Job Description *
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            placeholder="Describe the role, responsibilities, and requirements..."
            rows={6}
            className="bg-white/5 border-gray-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="deadline" className="text-white mb-2 block">
            Application Deadline *
          </Label>
          <Input
            id="deadline"
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => updateFormData('deadline', e.target.value)}
            className="bg-white/5 border-gray-700 text-white"
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Job Details</h3>
        <p className="text-gray-400">Add more specific information about the position</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="category" className="text-white mb-2 block">
            Job Category *
          </Label>
          <Select onValueChange={(value) => updateFormData('category', value)}>
            <SelectTrigger className="bg-white/5 border-gray-700 text-white">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="software-engineering">Software Engineering</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="product-management">Product Management</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="data-science">Data Science</SelectItem>
              <SelectItem value="devops">DevOps</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="skills" className="text-white mb-2 block">
            Required Skills *
          </Label>
          <Input
            id="skills"
            value={formData.skillsRequired}
            onChange={(e) => updateFormData('skillsRequired', e.target.value)}
            placeholder="e.g. React, TypeScript, Node.js, GraphQL"
            className="bg-white/5 border-gray-700 text-white"
          />
          <p className="text-sm text-gray-400 mt-1">
            Separate skills with commas
          </p>
        </div>

        <div>
          <Label htmlFor="location" className="text-white mb-2 block">
            Location *
          </Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => updateFormData('location', e.target.value)}
            placeholder="e.g. San Francisco, CA or Remote"
            className="bg-white/5 border-gray-700 text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Additional Details</h3>
        <p className="text-gray-400">Final details to complete your job posting</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="salary" className="text-white mb-2 block">
            Salary Range *
          </Label>
          <Input
            id="salary"
            value={formData.salaryRange}
            onChange={(e) => updateFormData('salaryRange', e.target.value)}
            placeholder="e.g. $80,000 - $120,000 per year"
            className="bg-white/5 border-gray-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="jobType" className="text-white mb-2 block">
            Job Type *
          </Label>
          <Select onValueChange={(value) => updateFormData('jobType', value)}>
            <SelectTrigger className="bg-white/5 border-gray-700 text-white">
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="temporary">Temporary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="metadata" className="text-white mb-2 block">
            Additional Information
          </Label>
          <Textarea
            id="metadata"
            value={formData.metadataHash}
            onChange={(e) => updateFormData('metadataHash', e.target.value)}
            placeholder="Any additional information, benefits, perks, etc."
            rows={4}
            className="bg-white/5 border-gray-700 text-white"
          />
        </div>
      </div>
    </div>
  );

  // Render registration form
  const renderRegistrationForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <UserPlus className="w-12 h-12 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Register as Employer</h3>
        <p className="text-gray-400">You need to register first before posting jobs</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="reg-name" className="text-white mb-2 block">
            Full Name *
          </Label>
          <Input
            id="reg-name"
            value={registrationData.name}
            onChange={(e) => setRegistrationData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your full name"
            className="bg-white/5 border-gray-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="reg-email" className="text-white mb-2 block">
            Email Address *
          </Label>
          <Input
            id="reg-email"
            type="email"
            value={registrationData.email}
            onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter your email address"
            className="bg-white/5 border-gray-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="reg-usertype" className="text-white mb-2 block">
            Account Type *
          </Label>
          <Select onValueChange={(value) => setRegistrationData(prev => ({ ...prev, userType: parseInt(value) as UserType }))}>
            <SelectTrigger className="bg-white/5 border-gray-700 text-white">
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserType.Employer.toString()}>Employer</SelectItem>
              <SelectItem value={UserType.Both.toString()}>Both (Employer & Job Seeker)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          Cancel
        </Button>
        <Button
          onClick={handleRegistration}
          disabled={isSubmitting || !registrationData.name || !registrationData.email}
          className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
        >
          {isSubmitting ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Registering...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Register
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Show loading state while checking user
  if (isCheckingUser) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/5 border-gray-800 p-8">
          <div className="text-center">
            <Clock className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-white mb-2">Checking Registration Status</h3>
            <p className="text-gray-400">Please wait while we verify your account...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white/5 border-gray-800 p-8">
        {!showRegistration && renderStepIndicator()}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {showRegistration ? (
          renderRegistrationForm()
        ) : (
          <>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </>
        )}

        {!showRegistration && (
          <>
            <div className="flex justify-between mt-8">
              <div>
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>

                {currentStep < 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!validateStep(currentStep) || isSubmitting}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!validateStep(1) || isSubmitting}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Posting Job...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Post Job
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Step Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                {currentStep === 1 && "Step 1 of 3: Provide basic job information"}
                {currentStep === 2 && "Step 2 of 3: Add job category and requirements"}
                {currentStep === 3 && "Step 3 of 3: Complete with salary and job type details"}
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default PostJobForm;