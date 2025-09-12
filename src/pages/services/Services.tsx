import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  slug: string;
  features: string[];
}

const services: Service[] = [
  {
    id: '1',
    title: 'Essay Writing',
    description: 'Professional essay writing services for all academic levels',
    price: 'From $15/page',
    category: 'Academic Writing',
    slug: 'essay-writing',
    features: ['100% Original', '24/7 Support', 'Free Revisions', 'On-time Delivery']
  },
  {
    id: '2',
    title: 'Assignment Writing',
    description: 'Expert assistance with assignments across all subjects',
    price: 'From $12/page',
    category: 'Academic Writing',
    slug: 'assignment-writing',
    features: ['Expert Writers', 'Plagiarism Free', 'Multiple Subjects', 'Quality Assurance']
  },
  {
    id: '3',
    title: 'Dissertation Writing',
    description: 'Comprehensive dissertation writing and research services',
    price: 'From $25/page',
    category: 'Research Writing',
    slug: 'dissertation-writing',
    features: ['PhD Writers', 'Research Expertise', 'Chapter-wise Delivery', 'Free Bibliography']
  },
  {
    id: '4',
    title: 'Research Writing',
    description: 'In-depth research papers and academic writing',
    price: 'From $20/page',
    category: 'Research Writing',
    slug: 'research-writing',
    features: ['Primary Research', 'Data Analysis', 'Citations & References', 'Methodology']
  },
  {
    id: '5',
    title: 'Proofreading',
    description: 'Professional proofreading and editing services',
    price: 'From $5/page',
    category: 'Editing',
    slug: 'proofreading',
    features: ['Grammar Check', 'Style Improvement', 'Fast Turnaround', 'Track Changes']
  },
  {
    id: '6',
    title: 'Online Tutoring',
    description: 'One-on-one tutoring sessions with expert tutors',
    price: 'From $25/hour',
    category: 'Tutoring',
    slug: 'online-tutoring',
    features: ['Live Sessions', 'Personalized Learning', 'Flexible Schedule', 'All Subjects']
  }
];

const Services: React.FC = () => {
  const categories = [...new Set(services.map(service => service.category))];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional academic writing and tutoring services to help you succeed in your studies
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <Badge key={category} variant="secondary" className="text-sm py-2 px-4">
              {category}
            </Badge>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline">{service.category}</Badge>
                  <span className="text-lg font-bold text-blue-600">{service.price}</span>
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {service.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link to={`/services/${service.slug}`}>
                      Learn More
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/order">
                      Order Now
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-blue-600 rounded-lg px-8 py-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Need Custom Service?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Can't find what you're looking for? We offer custom academic solutions tailored to your needs.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              asChild
            >
              <Link to="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
