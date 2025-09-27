import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  DollarSign,
  Clock,
  Users,
  Calendar,
  Edit3,
  Eye,
  X,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { jobPortalContract, Job, JobStatus, formatDeadline, formatSalary } from '@/utils/contract';

interface JobListingsProps {
  refreshTrigger?: number;
  onEditJob?: (jobId: number) => void;
}

const JobListings: React.FC<JobListingsProps> = ({ refreshTrigger, onEditJob }) => {
  const [jobs, setJobs] = useState<(Job & { jobId: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    loadUserJobs();
  }, [refreshTrigger]);

  const loadUserJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const address = await jobPortalContract.getConnectedAddress();
      if (!address) {
        throw new Error('Please connect your wallet first');
      }

      setUserAddress(address);
      const jobIds = await jobPortalContract.getUserJobs(address);
      
      const jobPromises = jobIds.map(async (jobId) => {
        const job = await jobPortalContract.getJob(jobId);
        return job ? { ...job, jobId } : null;
      });

      const jobResults = await Promise.all(jobPromises);
      const validJobs = jobResults.filter((job): job is Job & { jobId: number } => job !== null);
      
      setJobs(validJobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setError(error instanceof Error ? error.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseJob = async (jobId: number) => {
    try {
      const tx = await jobPortalContract.closeJob(jobId);
      if (tx) {
        await tx.wait();
        // Refresh the job list
        await loadUserJobs();
      }
    } catch (error) {
      console.error('Failed to close job:', error);
      setError(error instanceof Error ? error.message : 'Failed to close job');
    }
  };

  const getJobStatusColor = (job: Job & { jobId: number }) => {
    if (job.status === JobStatus.Closed) {
      return 'bg-red-500/20 text-red-400';
    }
    
    // Check if job is expired (deadline passed)
    const isExpired = job.deadline * 1000 < Date.now();
    if (isExpired) {
      return 'bg-yellow-500/20 text-yellow-400';
    }
    
    return 'bg-green-500/20 text-green-400';
  };

  const getJobStatusText = (job: Job & { jobId: number }) => {
    if (job.status === JobStatus.Closed) {
      return 'Closed';
    }
    
    // Check if job is expired (deadline passed)
    const isExpired = job.deadline * 1000 < Date.now();
    if (isExpired) {
      return 'Expired';
    }
    
    return 'Active';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-white/5 border-gray-800 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-700 rounded w-20"></div>
                <div className="h-6 bg-gray-700 rounded w-24"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-500/10 border-red-500/20 p-6">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
          <div>
            <h3 className="text-red-400 font-medium">Error Loading Jobs</h3>
            <p className="text-red-300 text-sm mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadUserJobs}
              className="mt-3 border-red-500/20 text-red-400 hover:bg-red-500/10"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card className="bg-white/5 border-gray-800 p-8 text-center">
        <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-white font-medium mb-2">No jobs posted yet</h3>
        <p className="text-gray-400 text-sm">
          Your job listings will appear here once you post them.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Legend */}
      <Card className="bg-blue-500/5 border-blue-500/20 p-4">
        <div className="flex items-center mb-2">
          <AlertCircle className="w-4 h-4 text-blue-400 mr-2" />
          <span className="text-blue-400 font-medium text-sm">Job Status Guide</span>
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center">
            <Badge className="bg-green-500/20 text-green-400 text-xs mr-2">Active</Badge>
            <span className="text-gray-400">Job is open for applications</span>
          </div>
          <div className="flex items-center">
            <Badge className="bg-yellow-500/20 text-yellow-400 text-xs mr-2">Expired</Badge>
            <span className="text-gray-400">Deadline has passed</span>
          </div>
          <div className="flex items-center">
            <Badge className="bg-red-500/20 text-red-400 text-xs mr-2">Closed</Badge>
            <span className="text-gray-400">Manually closed by employer</span>
          </div>
        </div>
      </Card>
      
      {jobs.map((job) => (
        <Card key={job.jobId} className="bg-white/5 border-gray-800 p-6 hover:bg-white/10 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                <Badge className={`text-xs ${getJobStatusColor(job)}`}>
                  {getJobStatusText(job)}
                </Badge>
              </div>
              
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-4 mb-4">
                {job.category && (
                  <div className="flex items-center text-gray-300 text-sm">
                    <Briefcase className="w-4 h-4 mr-1" />
                    {job.category.charAt(0).toUpperCase() + job.category.slice(1).replace('-', ' ')}
                  </div>
                )}
                
                {job.location && (
                  <div className="flex items-center text-gray-300 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                )}
                
                {job.salaryRange && (
                  <div className="flex items-center text-gray-300 text-sm">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {formatSalary(job.salaryRange)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {job.applicationsCount} applicant{job.applicationsCount !== 1 ? 's' : ''}
                </div>
                
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className={
                    job.deadline * 1000 < Date.now() 
                      ? 'text-red-400' 
                      : job.deadline * 1000 < Date.now() + (24 * 60 * 60 * 1000) 
                        ? 'text-yellow-400' 
                        : 'text-gray-400'
                  }>
                    Deadline: {formatDeadline(job.deadline)}
                    {job.deadline * 1000 < Date.now() && ' (Expired)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditJob?.(job.jobId)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              
              {job.status === JobStatus.Active && job.deadline * 1000 > Date.now() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCloseJob(job.jobId)}
                  className="border-red-600 text-red-400 hover:bg-red-900/20"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default JobListings;