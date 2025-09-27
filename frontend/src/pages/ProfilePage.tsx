import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  MapPin, 
  Calendar,
  Star,
  Code,
  Award,
  Briefcase,
  GraduationCap,
  Users,
  TrendingUp,
  Globe,
  FileText,
  CheckCircle,
  Clock,
  Zap,
  BookOpen,
  Coffee,
  Heart,
  MessageCircle,
  ExternalLink,
  Download
} from 'lucide-react';

const ProfilePage = () => {


  // Mock data - replace with real data
  const profileData = {
    name: "Alex Johnson",
    title: "Senior Full Stack Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    email: "alex.johnson@email.com",
    avatar: "/placeholder.svg",
    bio: "Passionate full-stack developer with 8+ years of experience in building enterprise-scale applications. Proven track record of leading development teams and delivering high-impact software solutions.",
    availability: "Open to new opportunities",
    joinDate: "January 2019",
    verified: true,
    skills: [
      { name: "React", level: 95, years: 5 },
      { name: "TypeScript", level: 90, years: 4 },
      { name: "Node.js", level: 88, years: 6 },
      { name: "Python", level: 85, years: 3 },
      { name: "PostgreSQL", level: 82, years: 4 },
      { name: "AWS", level: 80, years: 3 }
    ],
    stats: {
      projectsCompleted: 47,
      verificationScore: 98,
      responseTime: "< 24 hours",
      yearsExperience: "8+"
    },
    recentProjects: [
      {
        title: "Enterprise CRM System",
        description: "Led development of customer relationship management platform for 500+ users",
        tech: ["React", "Node.js", "PostgreSQL"],
        status: "Delivered",
        rating: 5
      },
      {
        title: "Real-time Trading Platform",
        description: "Built high-frequency trading system with microsecond latency requirements",
        tech: ["Next.js", "WebSocket", "Redis"],
        status: "In Development",
        rating: null
      },
      {
        title: "AI-Powered Analytics Suite",
        description: "Developed machine learning pipeline for business intelligence insights",
        tech: ["Python", "TensorFlow", "React"],
        status: "Delivered",
        rating: 5
      }
    ],
    certifications: [
      { name: "AWS Solutions Architect Professional", issuer: "Amazon", year: 2023 },
      { name: "Certified Kubernetes Administrator", issuer: "CNCF", year: 2022 },
      { name: "Google Cloud Professional Developer", issuer: "Google", year: 2023 }
    ],
    testimonials: [
      {
        text: "Alex is an exceptional team lead who consistently delivers high-quality solutions. A valuable asset to any engineering team.",
        author: "Sarah Chen",
        company: "TechCorp Inc.",
        rating: 5
      },
      {
        text: "Outstanding technical skills and leadership abilities. Alex successfully led our most critical product launch.",
        author: "Michael Rodriguez",
        company: "DataFlow Systems",
        rating: 5
      }
    ]
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        ease: [0.4, 0, 0.2, 1] as const
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as const
      }
    }
  };

  const BentoCard = ({ 
    children, 
    className = "", 
    hoverable = true,
    id = ""
  }: { 
    children: React.ReactNode, 
    className?: string,
    hoverable?: boolean,
    id?: string
  }) => (
    <motion.div
      variants={cardVariants}
      whileHover={hoverable ? { scale: 1.01, y: -2 } : {}}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`group ${className}`}
    >
      <Card className="h-full bg-gray-900/90 border-gray-600/50 transition-all duration-200 hover:border-white/20">
        {children}
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Simplified Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900/5 to-black"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 h-full"
        >
          {/* Main Profile Card - Large */}
          <BentoCard className="md:col-span-2 lg:col-span-2 xl:col-span-2 md:row-span-2" id="profile">
            <CardContent className="p-8 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-white text-black flex items-center justify-center text-2xl font-bold">
                        AJ
                      </div>
                      {profileData.verified && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-black" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-white/30">
                        {profileData.availability}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h1 className="text-3xl font-bold text-white">
                    {profileData.name}
                  </h1>
                  <p className="text-xl text-gray-300 font-medium">{profileData.title}</p>
                  <p className="text-gray-400">{profileData.company}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400 pt-2">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profileData.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {profileData.joinDate}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {profileData.bio}
                </p>
                
                <div className="flex space-x-3">
                  <Button size="sm" className="bg-white text-black hover:bg-gray-200">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-600 hover:bg-gray-800">
                    <Download className="w-4 h-4 mr-2" />
                    Download CV
                  </Button>
                </div>
              </div>
            </CardContent>
          </BentoCard>

          {/* Stats Cards */}
          <BentoCard className="lg:col-span-1 xl:col-span-1" id="projects">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{profileData.stats.projectsCompleted}</div>
              <div className="text-sm text-gray-400 mb-2">Projects Delivered</div>
              <div className="flex justify-center">
                <Briefcase className="w-5 h-5 text-gray-300" />
              </div>
            </CardContent>
          </BentoCard>

          <BentoCard className="lg:col-span-1 xl:col-span-1" id="verification">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{profileData.stats.verificationScore}%</div>
              <div className="text-sm text-gray-400 mb-2">Verification Score</div>
              <div className="flex justify-center">
                <CheckCircle className="w-5 h-5 text-gray-300" />
              </div>
            </CardContent>
          </BentoCard>

          <BentoCard className="lg:col-span-1 xl:col-span-1" id="response">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-white mb-2">{profileData.stats.responseTime}</div>
              <div className="text-sm text-gray-400 mb-2">Response Time</div>
              <div className="flex justify-center">
                <Clock className="w-5 h-5 text-gray-300" />
              </div>
            </CardContent>
          </BentoCard>

          <BentoCard className="lg:col-span-1 xl:col-span-1" id="experience">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-white mb-2">{profileData.stats.yearsExperience}</div>
              <div className="text-sm text-gray-400 mb-2">Years Experience</div>
              <div className="flex justify-center">
                <Award className="w-5 h-5 text-gray-300" />
              </div>
            </CardContent>
          </BentoCard>

          {/* Skills Card */}
          <BentoCard className="md:col-span-2 lg:col-span-2 xl:col-span-2" id="skills">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Code className="w-5 h-5 text-gray-300" />
                <span>Top Skills</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profileData.skills.slice(0, 4).map((skill, index) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">{skill.name}</span>
                    <span className="text-xs text-gray-500">{skill.years} years</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-white h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </BentoCard>

          {/* Key Projects */}
          <BentoCard className="md:col-span-2 lg:col-span-2 xl:col-span-2 md:row-span-2" id="projects-list">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Briefcase className="w-5 h-5 text-gray-300" />
                <span>Key Projects</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.recentProjects.map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, ease: "easeOut" }}
                  className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:border-white/30 transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-200">{project.title}</h4>
                    <Badge 
                      variant="secondary" 
                      className={project.status === 'Delivered' ? 'bg-white/20 text-white' : 'bg-gray-500/20 text-gray-300'}
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{project.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {project.tech.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs border-gray-600">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    {project.rating && (
                      <div className="flex space-x-1">
                        {[...Array(project.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-white text-white" />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </BentoCard>

          {/* Social Links */}
          <BentoCard className="lg:col-span-1 xl:col-span-1" id="social">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <Button size="icon" variant="ghost" className="hover:bg-gray-800">
                    <Github className="w-5 h-5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="hover:bg-gray-800">
                    <Linkedin className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <Button size="icon" variant="ghost" className="hover:bg-gray-800">
                    <Twitter className="w-5 h-5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="hover:bg-gray-800">
                    <Globe className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </BentoCard>

          {/* Certifications */}
          <BentoCard className="lg:col-span-1 xl:col-span-1" id="certs">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-sm">
                <Award className="w-4 h-4 text-gray-300" />
                <span>Certifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {profileData.certifications.slice(0, 3).map((cert, index) => (
                <div key={index} className="text-xs">
                  <div className="font-medium text-gray-300">{cert.name}</div>
                  <div className="text-gray-500">{cert.issuer} • {cert.year}</div>
                </div>
              ))}
            </CardContent>
          </BentoCard>

          {/* Testimonials */}
          <BentoCard className="md:col-span-2 lg:col-span-2 xl:col-span-2" id="testimonials">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <MessageCircle className="w-5 h-5 text-gray-300" />
                <span>Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.testimonials.slice(0, 2).map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, ease: "easeOut" }}
                  className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50"
                >
                  <div className="flex space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-white text-white" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-300 mb-2">"{testimonial.text}"</p>
                  <div className="text-xs text-gray-500">
                    — {testimonial.author}, {testimonial.company}
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </BentoCard>

          {/* Quick Actions */}
          <BentoCard className="lg:col-span-2 xl:col-span-2" id="actions">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Zap className="w-5 h-5 text-gray-300" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-white text-black hover:bg-gray-200">
                <Mail className="w-4 h-4 mr-2" />
                Contact Candidate
              </Button>
              <Button variant="outline" className="w-full justify-start border-gray-600 hover:bg-gray-800">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
              <Button variant="outline" className="w-full justify-start border-gray-600 hover:bg-gray-800">
                <FileText className="w-4 h-4 mr-2" />
                Download Resume
              </Button>
            </CardContent>
          </BentoCard>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;