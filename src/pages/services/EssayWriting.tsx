import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Clock, Users, PenTool, Award } from 'lucide-react';

const EssayWriting: React.FC = () => {
  const features = [
    'PhD qualified writers',
    '100% original essays',
    'Free unlimited revisions',
    'Guaranteed on-time delivery',
    'Plagiarism-free content',
    '24/7 customer support'
  ];

  const essayTypes = [
    'Argumentative Essays', 'Descriptive Essays', 'Narrative Essays', 'Expository Essays',
    'Compare and Contrast', 'Cause and Effect', 'Persuasive Essays', 'Analytical Essays',
    'Critical Essays', 'Reflective Essays', 'Personal Essays', 'Research Essays'
  ];

  const stats = [
    { icon: Users, label: 'Essays Completed', value: '25,000+' },
    { icon: Award, label: 'Expert Writers', value: '300+' },
    { icon: Star, label: 'Customer Rating', value: '4.9/5' },
    { icon: Clock, label: 'On-time Rate', value: '99%' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-purple-500 text-white mb-4">Essay Writing</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Expert Essay Writing Service
              </h1>
              <p className="text-xl text-purple-100 mb-8">
                Professional essay writing help from qualified writers. 
                High-quality, well-researched essays tailored to your requirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  Order Now - From $15/page
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
                  Get Free Quote
                </Button>
              </div>
            </div>
            <div className="text-center">
              <PenTool className="h-32 w-32 mx-auto text-purple-200 mb-4" />
              <p className="text-purple-100">Crafting excellence in every essay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Essay Writing Service?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We deliver exceptional essays that meet the highest academic standards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Essay Types Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Types of Essays We Write
            </h2>
            <p className="text-xl text-gray-600">
              From argumentative to analytical - we cover all essay types
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {essayTypes.map((type) => (
              <Card key={type} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-gray-900">{type}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Writing Process
            </h2>
            <p className="text-xl text-gray-600">
              A systematic approach to delivering high-quality essays
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Place Order', desc: 'Submit your essay requirements' },
              { step: 2, title: 'Writer Match', desc: 'We assign the best writer' },
              { step: 3, title: 'Writing', desc: 'Research and write your essay' },
              { step: 4, title: 'Delivery', desc: 'Receive your completed essay' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Get Your Perfect Essay Today
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Professional writers are ready to help you succeed
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Order Your Essay Now
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
              Chat with Expert
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EssayWriting;
