import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  DollarSign,
  Clock,
  Users,
  Calendar,
  Briefcase,
  AlertCircle,
  Search,
  Send,
  Filter
} from 'lucide-react';
import { jobPortalContract, Job, JobStatus, formatDeadline, formatSalary } from '@/utils/contract';

interface JobBrowserProps {
  refreshTrigger?: number;
}

const JobBrowser: React.FC<JobBrowserProps> = ({ refreshTrigger }) => {
  const [jobs, setJobs] = useState<(Job & { jobId: number })[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<(Job & { jobId: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [applying, setApplying] = useState<number | null>(null);

  console.log('🔍 JobBrowser: Component rendered, refreshTrigger:', refreshTrigger);

  const filterJobs = useCallback(() => {
    console.log('🔍 JobBrowser Filter: Starting with', jobs.length, 'jobs');
    console.log('🔍 JobBrowser Filter: Filters - search:', searchTerm, 'category:', categoryFilter, 'location:', locationFilter);
    
    let filtered = jobs;

    // Filter by search term (title or description)
    if (searchTerm) {
      const beforeSearch = filtered.length;
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('🔍 JobBrowser Filter: After search filter:', beforeSearch, '->', filtered.length);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      const beforeCategory = filtered.length;
      filtered = filtered.filter(job => job.category === categoryFilter);
      console.log('🔍 JobBrowser Filter: After category filter:', beforeCategory, '->', filtered.length);
      console.log('🔍 JobBrowser Filter: Looking for category:', categoryFilter, 'Available categories:', jobs.map(j => j.category));
    }

    // Filter by location
    if (locationFilter) {
      const beforeLocation = filtered.length;
      filtered = filtered.filter(job => 
        job.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
      console.log('🔍 JobBrowser Filter: After location filter:', beforeLocation, '->', filtered.length);
    }

    console.log('🔍 JobBrowser Filter: Final filtered jobs:', filtered.length);
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, categoryFilter, locationFilter]);

  useEffect(() => {
    loadAvailableJobs();
  }, [refreshTrigger]);

  useEffect(() => {
    console.log('🔍 JobBrowser: Triggering filterJobs due to dependency change');
    filterJobs();
  }, [filterJobs]);

  const loadAvailableJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      // Ensure contract is connected
      const isConnected = await jobPortalContract.connect();
      if (!isConnected) {
        throw new Error('Failed to connect to the contract');
      }
      
      // Get the total number of jobs posted
      const jobIdCounter = await jobPortalContract.getJobIdCounter();
      console.log('🔍 JobBrowser: Job ID Counter:', jobIdCounter);
      const allJobs: (Job & { jobId: number })[] = [];

      // Fetch all jobs
      for (let i = 1; i <= jobIdCounter; i++) {
        const job = await jobPortalContract.getJob(i);
        console.log(`🔍 JobBrowser: Job ${i}:`, job);
        if (job) {
          // Only show active jobs that haven't expired
          const isExpired = job.deadline * 1000 < Date.now();
          const statusNumber = typeof job.status === 'bigint' ? Number(job.status) : job.status;
          const isActive = statusNumber === JobStatus.Active;
          console.log(`🔍 JobBrowser: Job ${i} Details:`, {
            originalStatus: job.status,
            originalStatusType: typeof job.status,
            statusNumber,
            statusNumberType: typeof statusNumber,
            JobStatusActive: JobStatus.Active,
            isActive,
            isExpired,
            deadline: job.deadline,
            deadlineDate: new Date(job.deadline * 1000),
            now: Math.floor(Date.now() / 1000),
            nowDate: new Date()
          });
          
          if (isActive && !isExpired) {
            allJobs.push({ ...job, jobId: i });
            console.log(`✅ JobBrowser: Added Job ${i} to available jobs`);
          } else {
            console.log(`❌ JobBrowser: Filtered out Job ${i} - Active: ${isActive}, Expired: ${isExpired}`);
          }
        } else {
          console.log(`❌ JobBrowser: Job ${i} not found or invalid`);
        }
      }
      
      console.log('🔍 JobBrowser: Total available jobs loaded:', allJobs.length);
      setJobs(allJobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setError(error instanceof Error ? error.message : 'Failed to load available jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToJob = async (jobId: number) => {
    setApplying(jobId);
    try {
      const tx = await jobPortalContract.applyForJob(jobId);
      if (tx) {
        await tx.wait();
        // Refresh the job list to update application counts
        await loadAvailableJobs();
      }
    } catch (error) {
      console.error('Failed to apply to job:', error);
      setError(error instanceof Error ? error.message : 'Failed to apply to job');
    } finally {
      setApplying(null);
    }
  };

  const getUniqueCategories = () => {
    const categories = jobs
      .map(job => job.category)
      .filter(category => category && category.trim() !== '')
      .filter((category, index, arr) => arr.indexOf(category) === index);
    return categories;
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
              onClick={loadAvailableJobs}
              className="mt-3 border-red-500/20 text-red-400 hover:bg-red-500/10"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="bg-white/5 border-gray-800 p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <h3 className="text-white font-medium">Search & Filter Jobs</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search jobs by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-gray-700 text-white"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-white/10 border-gray-600 text-white hover:bg-white/15 focus:border-gray-500 transition-colors">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-600">
                <SelectItem value="all">All Categories</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-white/5 border-gray-700 text-white"
            />
          </div>
        </div>
      </Card>

      {/* Job Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Job Listings */}
      {filteredJobs.length === 0 ? (
        <Card className="bg-white/5 border-gray-800 p-8 text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No jobs found</h3>
          <p className="text-gray-400 text-sm">
            {jobs.length === 0 
              ? "There are no active job postings at the moment."
              : "Try adjusting your search filters to find more opportunities."
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.jobId} className="bg-white/5 border-gray-800 p-6 hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                    <Badge className="bg-green-500/20 text-green-400 text-xs">
                      Active
                    </Badge>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-3 line-clamp-3">
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
                        job.deadline * 1000 < Date.now() + (24 * 60 * 60 * 1000) 
                          ? 'text-yellow-400' 
                          : 'text-gray-400'
                      }>
                        Deadline: {formatDeadline(job.deadline)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    onClick={() => handleApplyToJob(job.jobId)}
                    disabled={applying === job.jobId}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {applying === job.jobId ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Apply Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobBrowser;