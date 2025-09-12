import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Clock, Shield, Users } from 'lucide-react';

const ServiceDetails: React.FC = () => {
  const { serviceSlug } = useParams<{ serviceSlug: string }>();

  // Mock service data - in real app, this would come from API
  const service = {
    id: '1',
    title: 'Essay Writing Service',
    description: 'Professional essay writing services for all academic levels with expert writers and guaranteed quality.',
    price: 'From $15/page',
    category: 'Academic Writing',
    rating: 4.9,
    reviews: 1248,
    features: [
      '100% Original Content',
      '24/7 Customer Support',
      'Free Unlimited Revisions',
      'On-time Delivery Guaranteed',
      'Plagiarism-Free Guarantee',
      'Money-Back Guarantee'
    ],
    deliveryTime: '3-7 days',
    subjects: [
      'English Literature',
      'History',
      'Psychology',
      'Business Studies',
      'Sociology',
      'Philosophy',
      'Political Science',
      'Economics'
    ],
    process: [
      {
        step: 1,
        title: 'Place Your Order',
        description: 'Fill out our simple order form with your requirements'
      },
      {
        step: 2,
        title: 'Writer Assignment',
        description: 'We assign the best writer for your subject and academic level'
      },
      {
        step: 3,
        title: 'Writing Process',
        description: 'Your writer researches and writes your essay according to your instructions'
      },
      {
        step: 4,
        title: 'Quality Check',
        description: 'Our quality assurance team reviews and proofreads your essay'
      },
      {
        step: 5,
        title: 'Delivery',
        description: 'Receive your completed essay before the deadline'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/services" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Services
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary">{service.category}</Badge>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{service.rating}</span>
                    <span className="text-gray-500">({service.reviews} reviews)</span>
                  </div>
                </div>
                <CardTitle className="text-3xl">{service.title}</CardTitle>
                <CardDescription className="text-lg">
                  {service.description}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  What You Get
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Process */}
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {service.process.map((step) => (
                    <div key={step.step} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{step.title}</h3>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subjects */}
            <Card>
              <CardHeader>
                <CardTitle>Subjects We Cover</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {service.subjects.map((subject) => (
                    <Badge key={subject} variant="outline">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-600">{service.price}</CardTitle>
                <CardDescription>Starting price per page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Delivery: {service.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Expert Writers</span>
                </div>
                <Button className="w-full" size="lg" asChild>
                  <Link to="/order">
                    Order Now
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/contact">
                    Get Quote
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Have questions about this service? Our support team is here to help 24/7.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/contact">
                    Contact Support
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
