import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { jobPortalContract, UserType, getUserTypeText } from '@/utils/contract';

interface UserRegistrationProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

const UserRegistration: React.FC<UserRegistrationProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: undefined as UserType | undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = (field: keyof typeof formData, value: string | UserType) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.userType === undefined) {
      setError('Please select a user type');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const tx = await jobPortalContract.registerUser(
        formData.name,
        formData.email,
        formData.userType!
      );

      if (!tx) {
        throw new Error('Failed to register user');
      }

      await tx.wait();
      onSuccess();
    } catch (error) {
      console.error('Failed to register user:', error);
      setError(error instanceof Error ? error.message : 'Failed to register user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-white/5 border-gray-800 p-8">
        <div className="text-center mb-6">
          <UserPlus className="w-12 h-12 text-white mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Create Your Profile</h2>
          <p className="text-gray-400">Register to start using the job portal</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-500/20 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-white mb-2 block">
              Full Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="Enter your full name"
              className="bg-white/5 border-gray-700 text-white"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-white mb-2 block">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              placeholder="Enter your email address"
              className="bg-white/5 border-gray-700 text-white"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="userType" className="text-white mb-2 block">
              Account Type *
            </Label>
            <Select onValueChange={(value) => updateFormData('userType', parseInt(value) as UserType)}>
              <SelectTrigger className="bg-white/5 border-gray-700 text-white" disabled={isSubmitting}>
                <SelectValue placeholder="Select your account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserType.JobSeeker.toString()}>
                  Job Seeker - Looking for opportunities
                </SelectItem>
                <SelectItem value={UserType.Employer.toString()}>
                  Employer - Posting job opportunities
                </SelectItem>
                <SelectItem value={UserType.Both.toString()}>
                  Both - Looking for jobs and hiring
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-400 mt-1">
              You can change this later in your profile settings
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-400 font-medium mb-1">Blockchain Registration</p>
                <p className="text-blue-300">
                  Your profile will be stored on the blockchain. This ensures data integrity and 
                  allows for decentralized identity verification.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-white text-black hover:bg-gray-200"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Profile
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            By registering, you agree to store your profile information on the blockchain
          </p>
        </div>
      </Card>
    </div>
  );
};

export default UserRegistration;