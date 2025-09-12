import React from 'react';
import ServiceBlogTemplate from './ServiceBlogTemplate';
import { CircuitBoard } from 'lucide-react';

const AIServices: React.FC = () => {
  return (
    <ServiceBlogTemplate 
      defaultIcon={<CircuitBoard className="h-16 w-16" />}
      serviceName="AI Services"
      serviceColor="from-indigo-600 to-indigo-400"
      serviceDescription="Advanced AI-powered solutions for academic writing, research analysis, and educational technology integration."
    />
  );
};

export default AIServices;