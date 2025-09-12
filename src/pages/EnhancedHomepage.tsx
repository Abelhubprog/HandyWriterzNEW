/**
 * Enhanced Homepage with improved UI components and better user experience
 * 
 * @file src/pages/EnhancedHomepage.tsx
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Brain,
  Heart,
  BookOpen,
  Clock,
  Star,
  ArrowRight,
  Check,
  Zap,
  Award,
  Shield,
  Users,
  MessageSquare,
} from 'lucide-react';

// Import new enhanced components
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/enhanced-card';
import { Container, Section, Grid, Stack, Inline } from '@/components/ui/enhanced-layout';

const EnhancedHomepage: React.FC = () => {
  const { user, isSignedIn } = useUser();
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  const services = [
    {
      id: 1,
      title: 'Adult Health Nursing',
      description: 'Comprehensive care strategies for adult patients across diverse healthcare settings.',
      icon: Heart,
      color: 'from-red-500 to-pink-600',
      features: ['Clinical Assessment', 'Care Planning', 'Evidence-Based Practice'],
      href: '/services/adult-health-nursing',
    },
    {
      id: 2,
      title: 'Child Nursing',
      description: 'Specialized pediatric care focused on child development and family-centered approaches.',
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
      features: ['Pediatric Assessment', 'Growth & Development', 'Family Support'],
      href: '/services/child-nursing',
    },
    {
      id: 3,
      title: 'Mental Health Nursing',
      description: 'Holistic mental health support incorporating therapeutic communication.',
      icon: Brain,
      color: 'from-purple-500 to-indigo-600',
      features: ['Mental Health Assessment', 'Therapeutic Care', 'Crisis Intervention'],
      href: '/services/mental-health-nursing',
    },
    {
      id: 4,
      title: 'Academic Writing',
      description: 'Professional academic writing services for all educational levels.',
      icon: GraduationCap,
      color: 'from-green-500 to-emerald-600',
      features: ['Research Papers', 'Essays', 'Dissertations'],
      href: '/services/academic-writing',
    },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Expert Writers',
      description: 'Our team consists of qualified professionals with advanced degrees.',
    },
    {
      icon: Clock,
      title: 'Timely Delivery',
      description: 'We guarantee on-time delivery for all your academic requirements.',
    },
    {
      icon: Award,
      title: 'Quality Assurance',
      description: 'Every piece of work undergoes rigorous quality checks and plagiarism screening.',
    },
    {
      icon: MessageSquare,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to assist you whenever needed.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Nursing Student',
      content: 'HandyWriterz helped me excel in my nursing program. Their expertise is unmatched!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Graduate Student',
      content: 'The quality of work and attention to detail exceeded my expectations.',
      rating: 5,
    },
    {
      name: 'Emily Davis',
      role: 'Undergraduate',
      content: 'Professional service with excellent communication throughout the process.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <Section spacing="xl" background="gradient">
        <Container>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap size={16} />
                Professional Academic Services
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Excellence in{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Academic Writing
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Transform your academic journey with our expert writing services. 
                From nursing assignments to research papers, we deliver quality work that exceeds expectations.
              </p>
              
              <Inline justify="center" gap="md" className="flex-wrap">
                <Button
                  size="lg"
                  variant="gradient"
                  icon={<ArrowRight size={20} />}
                  iconPosition="right"
                  asChild
                >
                  <Link to={isSignedIn ? '/dashboard' : '/sign-up'}>
                    Get Started Today
                  </Link>
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  icon={<BookOpen size={20} />}
                  asChild
                >
                  <Link to="/services">
                    Browse Services
                  </Link>
                </Button>
              </Inline>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Services Section */}
      <Section spacing="xl">
        <Container>
          <Stack gap="xl">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Specialized Services
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose from our comprehensive range of academic writing services, 
                each tailored to meet your specific needs.
              </p>
            </div>

            <Grid cols={2} gap="lg" className="lg:grid-cols-2">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredService(service.id)}
                  onMouseLeave={() => setHoveredService(null)}
                >
                  <Card
                    variant="elevated"
                    interactive
                    className="h-full group hover:shadow-2xl transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${service.color} shadow-lg`}>
                          <service.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="group-hover:text-blue-600 transition-colors">
                            {service.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <Stack gap="md">
                        <CardDescription className="text-base leading-relaxed">
                          {service.description}
                        </CardDescription>
                        
                        <div className="space-y-2">
                          {service.features.map((feature, featureIndex) => (
                            <Inline key={featureIndex} gap="sm" align="center">
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-gray-600">{feature}</span>
                            </Inline>
                          ))}
                        </div>
                        
                        <Button
                          variant="ghost"
                          className="w-full justify-between group-hover:bg-blue-50 group-hover:text-blue-600"
                          icon={<ArrowRight size={16} />}
                          iconPosition="right"
                          asChild
                        >
                          <Link to={service.href}>
                            Learn More
                          </Link>
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* Features Section */}
      <Section spacing="xl" background="gray">
        <Container>
          <Stack gap="xl">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose HandyWriterz?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We're committed to delivering exceptional academic support that helps you succeed.
              </p>
            </div>

            <Grid cols={2} gap="lg" className="lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card variant="filled" className="text-center h-full">
                    <CardContent className="pt-6">
                      <Stack gap="md" align="center">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <feature.icon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* Testimonials Section */}
      <Section spacing="xl">
        <Container>
          <Stack gap="xl">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What Our Students Say
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join thousands of satisfied students who have achieved academic success with our help.
              </p>
            </div>

            <Grid cols={1} gap="lg" className="md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card variant="elevated" className="h-full">
                    <CardContent className="pt-6">
                      <Stack gap="md">
                        <Inline gap="xs">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </Inline>
                        
                        <blockquote className="text-gray-700 italic">
                          "{testimonial.content}"
                        </blockquote>
                        
                        <div className="border-t pt-4">
                          <p className="font-semibold text-gray-900">{testimonial.name}</p>
                          <p className="text-sm text-gray-500">{testimonial.role}</p>
                        </div>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section spacing="xl" background="gradient">
        <Container>
          <Card variant="elevated" className="text-center">
            <CardContent className="py-12">
              <Stack gap="lg" align="center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Ready to Excel in Your Studies?
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl">
                    Join thousands of students who trust HandyWriterz for their academic success. 
                    Get started today and experience the difference quality makes.
                  </p>
                </div>
                
                <Inline justify="center" gap="md" className="flex-wrap">
                  <Button
                    size="lg"
                    variant="gradient"
                    icon={<ArrowRight size={20} />}
                    iconPosition="right"
                    asChild
                  >
                    <Link to={isSignedIn ? '/dashboard' : '/sign-up'}>
                      Start Your Journey
                    </Link>
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    icon={<MessageSquare size={20} />}
                    asChild
                  >
                    <Link to="/contact">
                      Contact Us
                    </Link>
                  </Button>
                </Inline>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Section>
    </div>
  );
};

export default EnhancedHomepage;