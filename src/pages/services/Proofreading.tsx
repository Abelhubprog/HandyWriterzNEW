import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, Award } from 'lucide-react';

const Proofreading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-orange-600 to-orange-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-orange-500 text-white mb-4">Proofreading & Editing</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Professional Proofreading Service
              </h1>
              <p className="text-xl text-orange-100 mb-8">
                Expert proofreading and editing to perfect your academic papers and documents.
              </p>
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                Order Now - From $5/page
              </Button>
            </div>
            <div className="text-center">
              <CheckCircle className="h-32 w-32 mx-auto text-orange-200 mb-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Proofreading;
