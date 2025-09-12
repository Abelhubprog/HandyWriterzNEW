import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Info, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PricingTable } from '@clerk/clerk-react';
import HandyWriterzLogo from '@/components/HandyWriterzLogo';

const Pricing: React.FC = () => {
  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-6">
            <HandyWriterzLogo size="lg" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the plan that fits your academic needs. All plans include plagiarism-free content and expert writers.
          </p>
        </motion.div>

        {/* Clerk Pricing Table */}
        <motion.div 
          className="mb-16"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
            <PricingTable />
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <Info className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-lg mb-2">How do I place an order?</h3>
              <p className="text-gray-600">
                Simply create an account, select your service, provide your requirements, and proceed to payment. Our expert writers will start working on your order immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I request revisions?</h3>
              <p className="text-gray-600">
                Yes, you can request revisions based on your plan. Basic plans include 1 revision, Standard plans include 3 revisions, and Premium plans include unlimited revisions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Is my information confidential?</h3>
              <p className="text-gray-600">
                Absolutely. We maintain strict confidentiality and never share your personal information with third parties.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Excel in Your Academic Journey?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of students who have achieved academic success with our expert assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/sign-in"
              className="inline-block py-3 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Get Started Today
            </Link>
            <Link
              to="/contact"
              className="inline-block py-3 px-8 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing