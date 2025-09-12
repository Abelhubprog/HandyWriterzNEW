import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Clock, Users, BookOpen, Award } from 'lucide-react';

const AssignmentWriting: React.FC = () => {
  const features = [
    'Expert writers with advanced degrees',
    'Original content guaranteed',
    'Free unlimited revisions',
    'On-time delivery promise',
    '24/7 customer support',
    'Plagiarism-free guarantee'
  ];

  const subjects = [
    'Mathematics', 'Science', 'English', 'History', 'Psychology', 'Business Studies',
    'Economics', 'Sociology', 'Philosophy', 'Computer Science', 'Engineering', 'Law'
  ];

  const stats = [
    { icon: Users, label: 'Happy Students', value: '10,000+' },
    { icon: Award, label: 'Expert Writers', value: '500+' },
    { icon: Star, label: 'Average Rating', value: '4.9/5' },
    { icon: Clock, label: 'On-time Delivery', value: '98%' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-blue-500 text-white mb-4">Academic Writing</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Professional Assignment Writing Service
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Get expert help with your assignments from qualified writers. 
                High-quality, original work delivered on time, every time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Order Now - From $12/page
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                  Get Free Quote
                </Button>
              </div>
            </div>
            <div className="text-center">
              <BookOpen className="h-32 w-32 mx-auto text-blue-200 mb-4" />
              <p className="text-blue-100">Trusted by thousands of students worldwide</p>
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
                <stat.icon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
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
              Why Choose Our Assignment Writing Service?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive assignment writing support to help you achieve academic success
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

      {/* Subjects Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Subjects We Cover
            </h2>
            <p className="text-xl text-gray-600">
              Our expert writers cover all major academic subjects
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
      <div className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied students who trust us with their assignments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Order Your Assignment Now
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              Chat with Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentWriting;
