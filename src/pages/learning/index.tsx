import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Play, Users, Award } from 'lucide-react';

const Learning: React.FC = () => {
  const courses = [
    {
      title: 'Academic Writing Fundamentals',
      description: 'Master the basics of academic writing and research',
      duration: '4 weeks',
      level: 'Beginner'
    },
    {
      title: 'Research Methodology',
      description: 'Learn advanced research techniques and methodologies',
      duration: '6 weeks',
      level: 'Intermediate'
    },
    {
      title: 'Citation and Referencing',
      description: 'Master APA, MLA, Harvard citation styles',
      duration: '2 weeks',
      level: 'Beginner'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Learning Resources
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enhance your academic skills with our comprehensive learning materials and courses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {courses.map((course, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle className="text-lg">{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>Duration: {course.duration}</span>
                  <span>Level: {course.level}</span>
                </div>
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-blue-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-lg mb-6">Join thousands of students improving their academic skills</p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            Explore All Courses
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Learning;
