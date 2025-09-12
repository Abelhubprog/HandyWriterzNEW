import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, GraduationCap, Users, Award, Clock, Star } from 'lucide-react';

const DissertationWriting: React.FC = () => {
  const features = [
    'PhD-qualified writers only',
    'Chapter-by-chapter delivery',
    'Original research guaranteed',
    'Free unlimited revisions',
    'Methodology expertise',
    'Statistical analysis support'
  ];

  const stats = [
    { icon: Users, label: 'Dissertations Completed', value: '5,000+' },
    { icon: Award, label: 'PhD Writers', value: '150+' },
    { icon: Star, label: 'Success Rate', value: '98%' },
    { icon: Clock, label: 'Average Timeline', value: '4-8 weeks' }
  ];

  const subjects = [
    'Business Administration', 'Psychology', 'Education', 'Engineering', 'Medicine',
    'Law', 'Computer Science', 'Social Sciences', 'Literature', 'Economics'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-green-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-green-500 text-white mb-4">Dissertation Writing</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Professional Dissertation Writing Service
              </h1>
              <p className="text-xl text-green-100 mb-8">
                Expert dissertation assistance from PhD writers. Comprehensive research, 
                analysis, and writing support for your doctoral journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                  Order Now - From $25/page
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-green-600">
                  Get Free Consultation
                </Button>
              </div>
            </div>
            <div className="text-center">
              <GraduationCap className="h-32 w-32 mx-auto text-green-200 mb-4" />
              <p className="text-green-100">Your path to doctoral success</p>
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
                <stat.icon className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Dissertation Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From proposal to defense, we support every stage of your dissertation journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Dissertation Proposal', desc: 'Research proposal writing and methodology development' },
              { title: 'Literature Review', desc: 'Comprehensive literature analysis and synthesis' },
              { title: 'Data Collection', desc: 'Research design and data gathering strategies' },
              { title: 'Data Analysis', desc: 'Statistical analysis and interpretation' },
              { title: 'Full Dissertation', desc: 'Complete dissertation writing from start to finish' },
              { title: 'Defense Preparation', desc: 'Presentation and defense strategy support' }
            ].map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Subjects Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Dissertation Subjects We Cover
            </h2>
            <p className="text-xl text-gray-600">
              Expert writers across all major academic disciplines
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {subjects.map((subject) => (
              <Badge key={subject} variant="secondary" className="text-sm py-2 px-4">
                {subject}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Your Dissertation Journey Today
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Get expert guidance from our PhD-qualified dissertation specialists
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Get Started Now
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-green-600">
              Schedule Consultation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DissertationWriting;
