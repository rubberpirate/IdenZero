import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { User } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-4">Market Page</h1>
        <p className="text-gray-400 mb-8">Market section has been removed</p>
        
        <div className="flex justify-center">
          <Link to="/profile">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <User className="w-4 h-4 mr-2" />
              Go to Profile Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;