import React from 'react';

interface ServiceBlogTemplateProps {
  defaultIcon: React.ReactNode;
  serviceName: string;
  serviceColor: string;
  serviceDescription: string;
}

const ServiceBlogTemplate: React.FC<ServiceBlogTemplateProps> = ({
  defaultIcon,
  serviceName,
  serviceColor,
  serviceDescription
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className={`bg-gradient-to-r ${serviceColor} text-white rounded-lg p-8 mb-8`}>
          <div className="flex items-center gap-4">
            <div className="text-white opacity-80">
              {defaultIcon}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{serviceName}</h1>
              <p className="text-lg opacity-90 mt-2">{serviceDescription}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">About {serviceName}</h2>
          <p className="text-gray-700">
            This service provides comprehensive academic support and resources.
            Our expert team is dedicated to helping students achieve their educational goals
            through high-quality assistance and guidance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceBlogTemplate;