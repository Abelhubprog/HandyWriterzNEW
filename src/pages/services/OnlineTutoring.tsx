import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Users, Clock } from 'lucide-react';

const OnlineTutoring: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-teal-500 text-white mb-4">Online Tutoring</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Expert Online Tutoring Service
              </h1>
              <p className="text-xl text-teal-100 mb-8">
                One-on-one tutoring sessions with qualified tutors across all subjects.
              </p>
              <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
                Book Session - From $25/hour
              </Button>
            </div>
            <div className="text-center">
              <Video className="h-32 w-32 mx-auto text-teal-200 mb-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineTutoring;
