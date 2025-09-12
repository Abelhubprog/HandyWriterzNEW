import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  Wallet,
  DollarSign,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import { d1Client as supabase } from '@/lib/d1Client';
import { useAuth } from '@/hooks/useAuth';
import { documentSubmissionService } from '@/services/documentSubmissionService';

interface OrderFlowProps {
  serviceType: string;
  serviceName: string;
}

interface OrderDetails {
  title: string;
  description: string;
  deadline: string;
  academicLevel: string;
  wordCount: number;
  fileUrls: string[];
  paymentMethod: string;
  urgency: 'standard' | 'urgent' | 'super_urgent';
  additionalServices: string[];
}

    try {
      // Step A: Create the order record first so submissions reference a real order id.
      const orderPayload = {
        user_id: user?.id,
        service_type: serviceType,
        status: 'awaiting_admin', // default to awaiting_admin while admin reviews
        amount: totalPrice,
        currency: 'USD',
        payment_status: 'unpaid',
        payment_method: orderDetails.paymentMethod,
        metadata: {
          title: orderDetails.title,
          description: orderDetails.description,
          deadline: orderDetails.deadline,
          academic_level: orderDetails.academicLevel,
          word_count: orderDetails.wordCount,
          urgency: orderDetails.urgency,
          additional_services: orderDetails.additionalServices,
        }
      };

      const { data: createdOrder, error: createError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (createError || !createdOrder) {
        throw createError || new Error('Failed to create order');
      }

      // Step B: If there are files, upload and create a submission that references this order
      let submissionResult = { success: false, fileUrls: [] as string[], submissionId: '' };
      if (files.length > 0) {
        const submission = await documentSubmissionService.submitDocumentsToAdmin(
          user?.id || 'anonymous',
          files,
          {
            orderId: createdOrder.id,
            serviceType,
            wordCount: orderDetails.wordCount,
            studyLevel: orderDetails.academicLevel,
            dueDate: orderDetails.deadline,
            instructions: orderDetails.description,
            price: totalPrice
          },
          { notifyAdminEmail: true, adminEmail: undefined, notifyInApp: true }
        );

        if (!submission.success) {
          // Try to mark order as errored so admin doesn't wait
          await supabase.from('orders').update({ status: 'pending' }).eq('id', createdOrder.id);
          throw new Error('Failed to upload files to storage or notify admin. Please try again.');
        }

        submissionResult = { success: true, fileUrls: submission.fileUrls || [], submissionId: submission.submissionId || '' };
      }

      // Step C: Update order metadata with file URLs and submission reference
      try {
        const updatedMetadata = { ...(createdOrder.metadata || {}), file_urls: submissionResult.fileUrls || [], submission_id: submissionResult.submissionId || null };
        await supabase.from('orders').update({ metadata: updatedMetadata }).eq('id', createdOrder.id);
      } catch (metaErr) {
        console.warn('Failed to update order with submission metadata', metaErr);
      }

      toast.success('Documents submitted to admin. Payment will be available after admin review.');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to submit order or documents. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
    }, 0);

    // Calculate final price
    const calculatedPrice = (basePrice * academicMultiplier * urgencyMultiplier) + additionalServicesTotal;

    // Round to 2 decimal places
    setTotalPrice(Math.round(calculatedPrice * 100) / 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOrderDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleWordCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setOrderDetails(prev => ({ ...prev, wordCount: Math.max(0, value) }));
  };

  const handleAcademicLevelChange = (value: string) => {
    setOrderDetails(prev => ({ ...prev, academicLevel: value }));
  };

  const handleUrgencyChange = (value: string) => {
    setOrderDetails(prev => ({ ...prev, urgency: value as 'standard' | 'urgent' | 'super_urgent' }));
  };

  const handleAdditionalServiceToggle = (serviceId: string) => {
    setOrderDetails(prev => {
      const services = prev.additionalServices.includes(serviceId)
        ? prev.additionalServices.filter(id => id !== serviceId)
        : [...prev.additionalServices, serviceId];

      return { ...prev, additionalServices: services };
    });
  };

  const handlePaymentMethodChange = (value: string) => {
    setOrderDetails(prev => ({ ...prev, paymentMethod: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => {
        const combined = [...prev, ...newFiles];
        if (combined.length > MAX_FILES) {
          toast.error(`You can upload up to ${MAX_FILES} files only`);
          return combined.slice(0, MAX_FILES);
        }
        return combined;
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (files.length === 0) return [];

    setIsUploading(true);
    try {
      // Use the fileUploadService which delegates to cloudflareUploadService and documentSubmissionService
      const { uploadMultipleFiles } = await import('@/services/fileUploadService');
      const results = await uploadMultipleFiles(files, (p) => {
        // optional progress hook
      }, `orders/${user?.id || 'anonymous'}`);

      const successful = results.filter(r => r.success && r.url).map(r => r.url as string);

      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        // If any file failed, report and throw so caller can handle
        const msgs = failed.map(f => `${f.fileName}: ${f.error || 'upload failed'}`).join('; ');
        throw new Error(`Some files failed to upload: ${msgs}`);
      }

      return successful;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload files. Please try again.');
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!orderDetails.title || !orderDetails.description) {
        toast.error('Please fill in all required fields');
        return;
      }
    }

    if (currentStep === 2) {
      if (!orderDetails.deadline) {
        toast.error('Please select a deadline');
        return;
      }
    }

    setCurrentStep(prev => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmitOrder = async () => {
    if (!session) {
      toast.error('Please log in to place an order');
      navigate('/login', { state: { returnTo: window.location.pathname } });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1) Create the order first so we have a definitive orderId to reference
      const orderPayload = {
        user_id: user?.id,
        service_type: serviceType,
        status: 'awaiting_admin', // awaiting admin review before payments
        amount: totalPrice,
        currency: 'USD',
        payment_status: 'unpaid',
        payment_method: orderDetails.paymentMethod,
        metadata: {
          title: orderDetails.title,
          description: orderDetails.description,
          deadline: orderDetails.deadline,
          academic_level: orderDetails.academicLevel,
          word_count: orderDetails.wordCount,
          urgency: orderDetails.urgency,
          additional_services: orderDetails.additionalServices,
        }
      };

      const { data: createdOrder, error: createError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (createError || !createdOrder) {
        throw createError || new Error('Failed to create order');
      }

      // 2) If files present, upload them and create a submission referencing this order
      let submissionResult = { success: false, fileUrls: [] as string[], submissionId: '' };
      if (files.length > 0) {
        const submission = await documentSubmissionService.submitDocumentsToAdmin(
          user?.id || 'anonymous',
          files,
          {
            orderId: createdOrder.id,
            serviceType,
            wordCount: orderDetails.wordCount,
            studyLevel: orderDetails.academicLevel,
            dueDate: orderDetails.deadline,
            instructions: orderDetails.description,
            price: totalPrice,
            clientName: user?.fullName || user?.username || 'Customer',
            clientEmail: user?.primaryEmailAddress?.emailAddress || ''
          },
          { notifyAdminEmail: true, adminEmail: undefined, notifyInApp: true }
        );

        if (!submission.success) {
          // Mark order pending to indicate files not available
          await supabase.from('orders').update({ status: 'pending' }).eq('id', createdOrder.id);
          throw new Error('Failed to upload files to storage or notify admin. Please try again.');
        }

        submissionResult = { success: true, fileUrls: submission.fileUrls || [], submissionId: submission.submissionId || '' };

        // 3) Persist file URLs and submission id into the order metadata
        try {
          const updatedMetadata = { ...(createdOrder.metadata || {}), file_urls: submissionResult.fileUrls || [], submission_id: submissionResult.submissionId || null };
          await supabase.from('orders').update({ metadata: updatedMetadata, status: 'awaiting_admin' }).eq('id', createdOrder.id);
        } catch (metaErr) {
          console.warn('Failed to update order with submission metadata', metaErr);
        }
      }

      toast.success('Documents submitted to admin. Payment will be available after admin review.');

      // Stay on dashboard/orders page and await admin confirmation before payment
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit order or documents. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="text-2xl">Order {serviceName}</CardTitle>
          <CardDescription>
            Complete the form below to place your order
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex flex-col items-center ${
                    step < currentStep ? 'text-green-600' :
                    step === currentStep ? 'text-blue-600' :
                    'text-gray-400'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step < currentStep ? 'bg-green-100 border-green-600' :
                    step === currentStep ? 'bg-blue-100 border-blue-600' :
                    'bg-gray-100 border-gray-300'
                  }`}>
                    {step < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="font-semibold">{step}</span>
                    )}
                  </div>
                  <span className="text-sm mt-2">
                    {step === 1 ? 'Details' :
                     step === 2 ? 'Requirements' :
                     step === 3 ? 'Files' :
                     'Payment'}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative mt-2">
              <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full"></div>
              <div
                className="absolute top-0 left-0 h-1 bg-blue-600 transition-all duration-300"
                style={{ width: `${(currentStep - 1) * 33.33}%` }}
              ></div>
            </div>
          </div>

          {/* Step 1: Order Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-base">Order Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={orderDetails.title}
                  onChange={handleInputChange}
                  placeholder="E.g., Nursing Care Plan for Diabetes Patient"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-base">Order Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={orderDetails.description}
                  onChange={handleInputChange}
                  placeholder="Describe your requirements in detail..."
                  className="mt-1 min-h-[150px]"
                />
              </div>
            </div>
          )}

          {/* Step 2: Requirements */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="deadline" className="text-base">Deadline</Label>
                <div className="flex items-center mt-1">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={orderDetails.deadline}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="academicLevel" className="text-base">Academic Level</Label>
                <Select
                  className="mt-1"
                  options={ACADEMIC_LEVELS.map(l => ({ value: l.value, label: l.label }))}
                  value={orderDetails.academicLevel}
                  onChange={(e) => handleAcademicLevelChange(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="wordCount" className="text-base">Word Count</Label>
                <div className="flex items-center mt-1">
                  <FileText className="h-5 w-5 text-gray-500 mr-2" />
                  <Input
                    id="wordCount"
                    name="wordCount"
                    type="number"
                    value={orderDetails.wordCount}
                    onChange={handleWordCountChange}
                    min={100}
                    step={100}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-base">Urgency</Label>
                <RadioGroup
                  value={orderDetails.urgency}
                  onValueChange={handleUrgencyChange}
                  className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {URGENCY_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base">Additional Services</Label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ADDITIONAL_SERVICES.map((service) => (
                    <div key={service.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={service.id}
                        checked={orderDetails.additionalServices.includes(service.id)}
                        onChange={() => handleAdditionalServiceToggle(service.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        aria-label={service.label}
                        title={service.label}
                      />
                      <Label htmlFor={service.id} className="ml-2 cursor-pointer">
                        {service.label} (+${service.price})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: File Upload */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base">Upload Files (Optional)</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    aria-label="Upload files"
                    title="Upload files"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Browse Files
                  </Button>
                </div>
              </div>

              {files.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Selected Files:</h3>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Remove</span>
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span>{serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Word Count:</span>
                    <span>{orderDetails.wordCount} words</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Academic Level:</span>
                    <span>
                      {ACADEMIC_LEVELS.find(level => level.value === orderDetails.academicLevel)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Urgency:</span>
                    <span>
                      {URGENCY_OPTIONS.find(option => option.value === orderDetails.urgency)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deadline:</span>
                    <span>{new Date(orderDetails.deadline).toLocaleDateString()}</span>
                  </div>
                  {orderDetails.additionalServices.length > 0 && (
                    <div>
                      <span>Additional Services:</span>
                      <ul className="ml-4 text-sm">
                        {orderDetails.additionalServices.map(serviceId => (
                          <li key={serviceId}>
                            {ADDITIONAL_SERVICES.find(s => s.id === serviceId)?.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                    <span>Total Price:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base">Payment Method</Label>
                <RadioGroup
                  value={orderDetails.paymentMethod}
                  onValueChange={handlePaymentMethodChange}
                  className="mt-2 space-y-2"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <div
                      key={method.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        orderDetails.paymentMethod === method.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <RadioGroupItem value={method.value} id={method.value} className="sr-only" />
                      <method.icon className="h-5 w-5 mr-2 text-gray-600" />
                      <Label htmlFor={method.value} className="cursor-pointer flex-1">
                        {method.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t p-6">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePreviousStep}
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              className="ml-auto"
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmitOrder}
              disabled={isSubmitting || isUploading}
              className="ml-auto"
            >
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isUploading ? 'Uploading Files...' : 'Processing...'}
                </>
              ) : (
                'Place Order'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
