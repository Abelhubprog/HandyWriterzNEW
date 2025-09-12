import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Users, Award } from 'lucide-react';

const ResearchWriting: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-indigo-500 text-white mb-4">Research Writing</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Professional Research Writing Service
              </h1>
              <p className="text-xl text-indigo-100 mb-8">
                Expert research papers with thorough analysis, proper methodology, and scholarly citations.
              </p>
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                Order Now - From $20/page
              </Button>
            </div>
            <div className="text-center">
              <Search className="h-32 w-32 mx-auto text-indigo-200 mb-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchWriting;
