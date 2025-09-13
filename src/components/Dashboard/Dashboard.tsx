import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { d1Client as supabase } from '@/lib/d1Client';
import {
  Phone,
  MessageSquare,
  FileText,
  User,
  Bell,
  Settings,
  LogOut,
  Camera,
  Trash,
  Archive,
  Download,
  ExternalLink,
  Inbox,
  FileCheck,
  Clock,
  AlertCircle,
  ChevronLeft,
  Calculator,
  PoundSterling,
  Wallet,
  CreditCard,
  Send,
  Clock4,
  Upload,
  X
} from 'lucide-react';
import fileUploadService, { formatBytes } from '@/services/fileUploadService';
import { toast } from 'react-hot-toast';
import { documentSubmissionService } from '@/services/documentSubmissionService';
import databaseService from '@/services/databaseService';
import { createOrder } from '@/lib/services';
import SubscriptionStatus from './SubscriptionStatus';

// Simple AdminDocuments component
const AdminDocuments = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-6">User Documents</h2>
      <p className="text-gray-600">This section displays documents submitted by users.</p>
      <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center">
        <p>No documents to display</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [studyLevel, setStudyLevel] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [module, setModule] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; path: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showEmailOption, setShowEmailOption] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [adminNotified, setAdminNotified] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showTurnitinModal, setShowTurnitinModal] = useState(false);
  const [turnitinFile, setTurnitinFile] = useState<File | null>(null);
  const [turnitinResult, setTurnitinResult] = useState<any>(null);
  const [isCheckingTurnitin, setIsCheckingTurnitin] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const turnitinFileInputRef = useRef<HTMLInputElement>(null);

  const supportAreas = [
    { id: 'adult', title: 'Adult Health Nursing', icon: '👨‍⚕️' },
    { id: 'mental', title: 'Mental Health Nursing', icon: '🧠' },
    { id: 'child', title: 'Child Nursing', icon: '👶' },
    { id: 'disability', title: 'Disability Nursing', icon: '♿' },
    { id: 'social', title: 'Social Work', icon: '🤝' },
    { id: 'special', title: 'Special Education Needs', icon: '📚' }
  ];

  const services = [
    { id: 'dissertation', title: 'Dissertation', icon: '📑', desc: 'Expert dissertation writing support' },
    { id: 'essays', title: 'Essays', icon: '✍️', desc: 'Professional essay writing' },
    { id: 'reflection', title: 'Placement Reflections', icon: '📝', desc: 'Clinical reflection writing' },
    { id: 'reports', title: 'Reports', icon: '📊', desc: 'Detailed academic reports' },
    { id: 'portfolio', title: 'E-Portfolio', icon: '💼', desc: 'Portfolio development' }
  ];

  const mockOrders = [
    {
      id: '1',
      title: 'Adult Health Essay',
      status: 'in-progress',
      dueDate: '2024-03-15',
      wordCount: 2750,
      price: 150.00,
      service: 'essays',
      area: 'adult'
    },
    {
      id: '2',
      title: 'Mental Health Dissertation',
      status: 'completed',
      dueDate: '2024-02-28',
      wordCount: 12000,
      price: 785.45,
      service: 'dissertation',
      area: 'mental'
    }
  ];

  const calculatePrice = (words: number, service: string, level: string, date: string) => {
    if (words < 100 || words > 100000) {
      return null;
    }

    const daysUntilDue = Math.ceil(
      (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    const useHigherRate =
      service === 'dissertation' ||
      level === 'Level 7' ||
      daysUntilDue < 2;

    const baseRate = useHigherRate ? 18 : 15;
    return (words / 275) * baseRate;
  };

  // Combined effect to handle authentication and navigation
  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn || !user) {
        navigate('/sign-in');
      }
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      try {
        // Use databaseService to attempt to read admin role from 'profiles' or 'admin_users'
        const profiles = await databaseService.getPosts(); // lightweight probe; replace with real call when available
        // Fallback: check Clerk email or user metadata for admin-like emails (simple heuristic)
        const adminEmail = (user?.primaryEmailAddress?.emailAddress || '').toLowerCase();
        if (adminEmail && adminEmail.endsWith('@handywriterz.com')) {
          setIsAdmin(true);
          return;
        }
      } catch (err) {
        // ignore and use default
      }
      setIsAdmin(false);
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (wordCount && studyLevel && dueDate && selectedService) {
      const price = calculatePrice(wordCount, selectedService.id, studyLevel, dueDate);
      setCalculatedPrice(price);
    }
  }, [wordCount, studyLevel, dueDate, selectedService]);

  const navigateToPaymentPage = (paymentDetails?: any) => {
    if (!selectedService || !wordCount || !studyLevel || !dueDate) {
      toast.error('Please complete all required fields before proceeding.');
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error('Please upload files before proceeding to payment.');
      return;
    }

    if (!adminNotified) {
      toast.error('Documents must be sent to admin before payment.');
      return;
    }

    const paymentData = paymentDetails || {
      orderId: `order-${Date.now()}`,
      amount: calculatedPrice,
      currency: 'GBP',
      orderDetails: {
        serviceType: selectedService.title,
        subjectArea: supportAreas.find(area => area.id === selectedArea)?.title || selectedArea,
        wordCount: wordCount,
        studyLevel: studyLevel,
        dueDate: dueDate,
        module: module,
        instructions: instructions
      },
      files: uploadedFiles
    };

    // Navigate to dedicated payment page with state
    navigate('/payment', { state: { paymentData } });
  };

  const handleQuickCall = () => {
    window.open('https://join.skype.com/invite/IZLQkPuieqX2');
  };

  const handleQuickMessage = () => {
    window.open('https://wa.me/254711264993?text=Hi,%20I%20need%20help%20with%20my%20assignment');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0 && uploadedFiles.length === 0) {
      toast.error('Please upload at least one file before proceeding to payment');
      return;
    }

    // If files are uploaded but admin not notified, send to admin first
    if (uploadedFiles.length > 0 && !adminNotified) {
      toast('Notifying admin about your submission...');
      handleSendToAdminAutomatic();
      return;
    }

    // If files are uploaded and admin is notified, proceed to payment page
    if (uploadedFiles.length > 0 && adminNotified) {
      navigateToPaymentPage({
        orderId: `ORD-${Date.now()}`,
        amount: calculatedPrice || 0,
        currency: 'USD',
        orderDetails: {
          serviceType: selectedService?.title || '',
          subjectArea: selectedArea || '',
          wordCount: wordCount,
          studyLevel: studyLevel,
          dueDate: dueDate,
          module: module,
          instructions: instructions
        },
        files: uploadedFiles
      });
      return;
    }

    // Otherwise, upload files first
    handleUploadSubmit();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileList = Array.from(selectedFiles);

    // Simple file validation
    const maxSize = 50 * 1024 * 1024; // 50MB
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    fileList.forEach(file => {
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name} (exceeds 50MB size limit)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`Some files were rejected due to size limits: ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length > 0) {
      // Merge with existing files, dedupe by name+size+lastModified, and enforce max files
      const MAX_FILES = 10;

      setFiles(prev => {
        const combined = [...prev, ...validFiles];

        // Deduplicate
        const seen = new Set<string>();
        const deduped: File[] = [];
        for (const f of combined) {
          const key = `${f.name}-${f.size}-${(f as any).lastModified || 0}`;
          if (!seen.has(key)) {
            seen.add(key);
            deduped.push(f);
          }
        }

        // Enforce cap
        if (deduped.length > MAX_FILES) {
          toast(`${deduped.length - MAX_FILES} file(s) were not added because the maximum is ${MAX_FILES}.`, { icon: '⚠️' });
          return deduped.slice(0, MAX_FILES);
        }

        toast.success(`${deduped.length} file(s) selected successfully`);
        return deduped;
      });

      setAdminNotified(false); // Reset admin notification when new files are selected
    }
  };

  const handleUploadSubmit = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const uploadToast = toast.loading('Uploading files...');

    try {
      if (!user) {
        toast.error('User authentication required');
        navigate('/sign-in');
        return;
      }

      // Use the improved file upload service with unified approach
      const results = await fileUploadService.uploadMultipleFiles(
        files,
        (progress) => {
          setUploadProgress(progress);
        },
        `orders/${user.id}`
      );

      // Check if all uploads succeeded
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      if (successfulUploads.length > 0) {
        const uploadedFileData = successfulUploads.map((result) => ({
          name: result.fileName || result.file?.name || 'unnamed',
          url: result.url || '#',
          path: result.path || `local/${Date.now()}`
        }));

        toast.dismiss(uploadToast);

        if (failedUploads.length > 0) {
          // react-hot-toast doesn't provide toast.warning in all versions — use generic toast with icon
          toast(`${successfulUploads.length} files uploaded successfully. ${failedUploads.length} files failed.`, { icon: '⚠️' });
        } else {
          toast.success(`${files.length} file(s) uploaded successfully.`);
        }

        setUploadedFiles(uploadedFileData);
        setFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // NOTE: do NOT automatically send to admin here. Sending requires
        // converting uploaded URLs back to File objects and confirming backend
        // submission. Keep adminNotified=false until explicit send succeeds.
      } else {
        throw new Error(`All ${files.length} file(s) failed to upload.`);
      }
    } catch (error) {
      toast.dismiss(uploadToast);
      toast.error('An error occurred during upload: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    setAdminNotified(false); // Reset admin notification when files are removed
  };

  const handleEmailDocuments = async () => {
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      // Check if files are available either from uploaded files or newly selected files
      if (uploadedFiles.length === 0 && files.length === 0) {
        toast.error('No files available to send');
        return;
      }

      setUploading(true);

      // Get the subject from the form
      const subjectField = document.getElementById('emailSubject') as HTMLInputElement;
      const subject = subjectField ? subjectField.value : 'Document Submission';

      // First handle any new files that need to be uploaded
      let allFiles = [...uploadedFiles];

      if (files.length > 0) {
        toast.loading('Uploading new files...');
        // Upload new files first
        const newUploadedFiles = await Promise.all(
          files.map(async (file) => {
            try {
              const result = await fileUploadService.uploadFile(file);
              if (result) {
                return {
                  name: file.name,
                  url: result.url,
                  path: result.path,
                  size: file.size,
                  type: file.type
                };
              }
              throw new Error(`Failed to upload ${file.name}`);
            } catch (err) {
              return null;
            }
          })
        );

        // Filter out failed uploads
        const successfulUploads = newUploadedFiles.filter(f => f !== null) as typeof uploadedFiles;
        allFiles = [...allFiles, ...successfulUploads];

        if (successfulUploads.length > 0) {
          setUploadedFiles(prev => [...prev, ...successfulUploads]);
        }

        toast.dismiss();
      }

      if (allFiles.length === 0) {
        throw new Error('No files available after upload attempts');
      }

      // Convert all files to File objects for submission
      const filesToSubmit = await Promise.all(allFiles.map(async (file) => {
        if (file instanceof File) return file;

        try {
          // Fetch file from URL and convert to File object
          const response = await fetch(file.url);
          const blob = await response.blob();
          return new File([blob], file.name, { type: blob.type || 'application/octet-stream' });
        } catch (error) {
          return null;
        }
      }));

      // Filter out any null values from failed fetches
      const validFiles = filesToSubmit.filter(file => file !== null) as File[];

      if (validFiles.length === 0) {
        throw new Error('Failed to prepare files for submission');
      }

      // Create comprehensive metadata for the document submission
      const metadata = {
        orderId: `email-${Date.now()}`,
        serviceType: selectedService?.id || 'email-submission',
        subjectArea: selectedArea || 'general',
        wordCount: wordCount || 0,
        studyLevel: studyLevel || 'not-specified',
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        module: module || 'general',
        instructions: emailMessage || 'Email submission',
        emailSubject: subject,
        submissionType: 'email',
        clientEmail: userEmail || '',
        clientName: userName || ''
      };

      // Use documentSubmissionService directly
      const result = await documentSubmissionService.submitDocumentsToAdmin(
        user?.id || 'anonymous',
        validFiles,
        metadata,
        {
          notifyAdminEmail: true,
          adminEmail: emailAddress, // Send to the specified email
          notifyTelegram: true,
          notifyInApp: true
        }
      );

      if (result.success) {
        toast.success('Documents sent successfully!');
        setShowEmailOption(false);
        setFiles([]);
        setEmailMessage('');
      } else {
        throw new Error(result.message || 'Failed to send documents');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send documents. Please try again.');

      // Create a record of the failed attempt for admin follow-up
      if (user) {
        try {
          // Record a system message via databaseService (mocked if not available)
          await databaseService.createPost?.({
            title: `Failed document send: ${Date.now()}`,
            content: `Failed attempt to send documents to ${emailAddress}. Error: ${error.message || 'Unknown error'}`,
            slug: `failed-doc-send-${Date.now()}`,
            author_id: user.id
          });
          toast('Our team has been notified and will assist you.', {
            id: 'team-notification',
            icon: '🔔'
          });
        } catch (err) {
        }
      }
    } finally {
      setUploading(false);
    }
  };

  // Function to automatically send documents to admin after upload
  const handleSendToAdminAutomatic = async () => {
    if (!user) return;

    if (uploadedFiles.length === 0) {
      toast.error('No files to send.');
      return;
    }

    // Show loading state
    const loadingToast = toast.loading('Sending documents to admin...');

    try {
      // Prepare order metadata
      const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const metadata = {
        orderId: orderId,
        serviceType: selectedService?.title || 'Not specified',
        subjectArea: supportAreas.find(area => area.id === selectedArea)?.title || selectedArea || 'Not specified',
        wordCount: wordCount || 0,
        studyLevel: studyLevel || 'Not specified',
        dueDate: dueDate || 'Not specified',
        module: module || 'Not specified',
        instructions: instructions || 'None provided',
        clientEmail: user.primaryEmailAddress?.emailAddress || '',
        clientName: user.fullName || user.username || 'Unknown',
        price: calculatedPrice || 0
      };

      // Initialize success flags
      let apiCallSuccess = false;
      let dbInsertSuccess = false;
      let notificationSuccess = false;

      // 1. First attempt to use document submission service for backend integration
      try {
        // For production we'd convert uploaded file paths to actual File objects
        // This is a simplified version that assumes files are accessible
        // Try sending notification to admin via API
        if (import.meta.env.PROD) {
          await documentSubmissionService.submitDocumentsToAdmin(
            user.id,
            [], // We'd need actual File objects here in production
            metadata,
            {
              notifyAdminEmail: true,
              adminEmail: 'support@handywriterz.com',
              notifyTelegram: true,
              notifyInApp: true
            }
          );
          apiCallSuccess = true;
        }
      } catch (apiError) {
        // Don't stop the flow due to API error
      }

      // 2. Next attempt to notify admin via secondary channels
      try {
        // Try sending backup email notification
        await notifyAdminOfOrder();
        notificationSuccess = true;
      } catch (notifyError) {
      }

      // 3. Finally record in database
      try {
        // Record the order in database
        const { error } = await supabase.from('orders').insert([
          {
            id: orderId,
            user_id: user.id,
            service_type: selectedService?.title || 'Not specified',
            subject_area: supportAreas.find(area => area.id === selectedArea)?.title || selectedArea || 'Not specified',
            word_count: wordCount || 0,
            study_level: studyLevel || 'Not specified',
            due_date: dueDate || 'Not specified',
            module: module || 'Not specified',
            instructions: instructions || 'None provided',
            price: calculatedPrice || 0,
            status: 'pending',
            files: uploadedFiles,
            created_at: new Date().toISOString(),
          }
        ]);

        if (!error) {
          dbInsertSuccess = true;
        } else {
          throw error;
        }
      } catch (dbError) {
        // Non-blocking error - user flow continues even if DB insert fails
      }

      // Clear loading state
      toast.dismiss(loadingToast);

      // Show appropriate success/warning message based on what succeeded
      if (apiCallSuccess || (dbInsertSuccess && notificationSuccess)) {
        toast.success('Documents sent to admin successfully!');
        setAdminNotified(true);
        // Show payment options after sending to admin
        setShowPaymentOptions(true);
      } else if (dbInsertSuccess || notificationSuccess) {
        toast.success('Order created, but there may be issues with admin notification. Please contact support if needed.');
        setAdminNotified(true);
        // Still show payment options
        setShowPaymentOptions(true);
      } else {
        // Everything failed
        throw new Error('Failed to process your order on multiple levels.');
      }
    } catch (error) {
      // Clear loading state
      toast.dismiss(loadingToast);

      toast.error(
        'We encountered an issue processing your order. Please try again or contact support.'
      );
    }
  };

  // Function to send documents to admin (manual)
  const handleSendToAdmin = async () => {
    if (!user) {
      toast.error('You must be signed in to send documents to admin');
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error('Please upload files before sending to admin');
      return;
    }

    try {
      setUploading(true);

      // Convert uploadedFiles to File objects if they're not already
      const filesToSend = await Promise.all(uploadedFiles.map(async (file) => {
        if (file instanceof File) return file;

        try {
          // Fetch file from URL and convert to File object
          const response = await fetch(file.url);
          const blob = await response.blob();
          return new File([blob], file.name, { type: blob.type });
        } catch (error) {
          // Return null for failed files
          return null;
        }
      }));

      // Filter out any null values from failed fetches
      const validFiles = filesToSend.filter(file => file !== null) as File[];

      if (validFiles.length === 0) {
        throw new Error('Failed to prepare files for submission');
      }

      // Prepare metadata for the document submission service
      const metadata = {
        orderId: 'manual-submission',
        serviceType: selectedService?.id,
        subjectArea: supportAreas.find(area => area.id === selectedArea)?.title,
        wordCount: wordCount,
        studyLevel: studyLevel,
        dueDate: dueDate,
        module: module,
        instructions: instructions,
        price: calculatedPrice
      };

      // Use the document submission service directly
      const result = await documentSubmissionService.submitDocumentsToAdmin(
        user.id,
        validFiles,
        metadata,
        {
          notifyAdminEmail: true,
          notifyTelegram: true,
          notifyInApp: true
        }
      );

      if (result.success) {
        // Persist submission metadata to the order if orderId looks valid
        const orderId = metadata.orderId;
        let dbOk = true;
        if (orderId && orderId !== 'manual-submission') {
          try {
            const updatedMeta = {
              ...(metadata || {}),
              file_urls: result.fileUrls || [],
              submission_id: result.submissionId || null,
              admin_notified: true
            };
            const dbRes = await databaseService.updateOrderMetadata(orderId, updatedMeta);
            if (!dbRes || dbRes.success === false) {
              dbOk = false;
            }
          } catch (dbErr) {
            dbOk = false;
          }
        }

        if (dbOk) {
          setAdminNotified(true);
          toast.success('Documents sent to admin successfully!');
          setShowEmailOption(false);
        } else {
          // Notify user that submission succeeded but DB persistence failed
          toast('Documents uploaded and notification sent, but we failed to save order metadata. Please contact support.', { icon: '⚠️' });
        }
      } else {
        throw new Error(result.message || 'Failed to send documents');
      }
    } catch (error: any) {
      toast.error(error instanceof Error ? error.message : 'Failed to send documents to admin. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Function to notify admin when an order is placed
  const notifyAdminOfOrder = async () => {
    if (!user) return;

    try {
      // 1) Create an order record first so it can be referenced by the submission
      const orderPayload = {
        title: selectedService?.title || 'Document Submission',
        description: instructions || '',
        service_id: selectedService?.id || undefined,
        price: calculatedPrice || 0,
        due_date: dueDate || undefined,
        user_id: user.id
      };

      const { order: createdOrder, error: createOrderError } = await createOrder(orderPayload);
      const orderId = createdOrder?.id || `order-${Date.now()}`;

      if (createOrderError) {
        toast('Order creation failed on the server; proceeding with submission but admin tracking may be affected.', { icon: '⚠️' });
      }

      // 2) Prepare files: combine local `files` and already `uploadedFiles` (convert URLs to File)
      const preparedFiles: File[] = [];

      // Add newly selected File objects
      if (files && files.length > 0) {
        for (const f of files.slice(0, 10)) {
          preparedFiles.push(f);
        }
      }

      // Convert uploadedFiles (which are url/path objects) into File objects when possible
      if (uploadedFiles && uploadedFiles.length > 0) {
        for (const uf of uploadedFiles.slice(0, 10 - preparedFiles.length)) {
          try {
            const resp = await fetch(uf.url);
            const blob = await resp.blob();
            const file = new File([blob], uf.name || 'document', { type: blob.type || 'application/octet-stream' });
            preparedFiles.push(file);
          } catch (err) {
            // skip files that cannot be fetched
          }
        }
      }

      if (preparedFiles.length === 0) {
        throw new Error('No files available to submit to admin');
      }

      // 3) Prepare metadata for the document submission service with real order id
      const metadata = {
        orderId,
        serviceType: selectedService?.id,
        subjectArea: supportAreas.find(area => area.id === selectedArea)?.title,
        wordCount: wordCount,
        studyLevel: studyLevel,
        dueDate: dueDate,
        module: module,
        instructions: instructions,
        price: calculatedPrice
      };

      // 4) Submit documents (this uploads to R2 and saves a submission record)
      const result = await documentSubmissionService.submitDocumentsToAdmin(
        user.id,
        preparedFiles.slice(0, 10), // enforce max 10 files
        metadata,
        {
          notifyAdminEmail: true,
          notifyTelegram: true,
          notifyInApp: true
        }
      );

      if (!result.success) {
        throw new Error(result.message || 'Failed to send documents');
      }

      // 5) Persist file URLs & submission id to the order metadata in DB
      try {
        const updatedMeta = {
          ...(createdOrder?.metadata || {}),
          file_urls: result.fileUrls || [],
          submission_id: result.submissionId || null,
          admin_notified: true
        };

        const dbRes = await databaseService.updateOrderMetadata(orderId, updatedMeta);
        if (!dbRes || dbRes.success === false) {
          throw new Error('Failed to save submission metadata to order');
        }

        // Update order status to awaiting_admin so admin can review
        await databaseService.updateOrderStatus(orderId, 'awaiting_admin', 'unpaid');

        setAdminNotified(true);
        toast.success('Documents sent to admin successfully!');
        setShowEmailOption(false);
      } catch (metaErr) {
        // submission succeeded but DB persist failed
        toast('Documents uploaded and admin notified, but failed to attach files to your order. Contact support.', { icon: '⚠️' });
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to notify admin of order');
    }
  };

  const handleTurnitinFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, DOC, DOCX, or TXT file');
      return;
    }

    setTurnitinFile(file);
    setTurnitinResult(null);
  };

  const handleTurnitinCheck = async () => {
    if (!turnitinFile) {
      alert('Please select a file first');
      return;
    }

    setIsCheckingTurnitin(true);
    let checkoutWindow: Window | null = null;
    let statusInterval: NodeJS.Timeout;

    try {
      // First, create a payment intent
      const paymentResponse = await fetch('/api/create-turnitin-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 5, // £5 fixed price
          currency: 'GBP',
        }),
      });

      if (!paymentResponse.ok) {
        const error = await paymentResponse.json();
        throw new Error(error.message || 'Failed to create payment');
      }

      const { hosted_url, id: chargeId } = await paymentResponse.json();

      // Open Coinbase Commerce checkout
      checkoutWindow = window.open(hosted_url, '_blank');

      // Start payment timer
      const startTime = Date.now();
      const PAYMENT_TIMEOUT = 15 * 60 * 1000; // 15 minutes

      // Poll for payment status
      const checkPaymentStatus = async () => {
        try {
          // Check if payment window is closed
          if (checkoutWindow?.closed) {
            clearInterval(statusInterval);
            setIsCheckingTurnitin(false);
            return;
          }

          // Check if payment has timed out
          if (Date.now() - startTime > PAYMENT_TIMEOUT) {
            clearInterval(statusInterval);
            checkoutWindow?.close();
            setIsCheckingTurnitin(false);
            alert('Payment timeout. Please try again.');
            return;
          }

          const statusResponse = await fetch(`/api/check-charge/${chargeId}`);
          if (!statusResponse.ok) {
            const error = await statusResponse.json();
            throw new Error(error.message || 'Failed to check payment status');
          }

          const { status, charge } = await statusResponse.json();

          if (status === 'COMPLETED') {
            clearInterval(statusInterval);

            // Show processing message
            setProcessingMessage('Processing document...');

            // Payment successful, now send document for Turnitin check
            const formData = new FormData();
            formData.append('file', turnitinFile);
            formData.append('chargeId', chargeId);

            const response = await fetch('/api/check-turnitin', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || 'Failed to check Turnitin');
            }

            const result = await response.json();
            setTurnitinResult(result);
            checkoutWindow?.close();
            setProcessingMessage('');

            // Show success message
            alert(`Document processed successfully!\nSimilarity score: ${result.similarity}%`);
          } else if (status === 'FAILED') {
            clearInterval(statusInterval);
            checkoutWindow?.close();
            throw new Error('Payment failed. Please try again.');
          }
        } catch (error) {
          clearInterval(statusInterval);
          checkoutWindow?.close();
          alert(error instanceof Error ? error.message : 'Failed to process payment');
          setIsCheckingTurnitin(false);
          setProcessingMessage('');
        }
      };

      // Check payment status every 5 seconds
      statusInterval = setInterval(checkPaymentStatus, 5000);

      // Clean up on unmount
      return () => {
        clearInterval(statusInterval);
        checkoutWindow?.close();
      };
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to process Turnitin check');
      checkoutWindow?.close();
    } finally {
      setIsCheckingTurnitin(false);
      setProcessingMessage('');
    }
  };

  const handleLogout = async () => {
    if (!user || isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      // Show a loading toast to indicate logout process is happening
      const logoutToast = toast.loading('Logging out...');

      // Clear all local storage and session storage comprehensively
      localStorage.clear();
      sessionStorage.clear();

      // Clear any cached data using Cache API if available
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        } catch (cacheError) {
          console.warn('Failed to clear cache:', cacheError);
        }
      }

      // Sign out from Clerk with proper cleanup
      await signOut({
        redirectUrl: '/'
      });

      // Clear any remaining Clerk-related state
      if (typeof window !== 'undefined') {
        // Remove any Clerk cookies
        document.cookie.split(';').forEach(cookie => {
          if (cookie.trim().startsWith('__session') ||
              cookie.trim().startsWith('__client') ||
              cookie.trim().includes('clerk')) {
            const cookieName = cookie.split('=')[0].trim();
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
          }
        });
      }

      // Success notification
      toast.dismiss(logoutToast);
      toast.success('Successfully logged out');

      // Force navigation to home page with full reload to ensure complete cleanup
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);

    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');

      // Fallback: Force redirect even if signOut fails
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);

    } finally {
      setIsLoggingOut(false);
    }
  };

  const userEmail = user?.primaryEmailAddress?.emailAddress || 'No email available';
  const userName = user?.fullName || user?.username || 'User';

  // Add these new state variables for real data
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersApiAvailable, setOrdersApiAvailable] = useState<boolean>(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+44');
  const [savingProfile, setSavingProfile] = useState(false);

  // Add useEffect to fetch orders from Cloudflare D1
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      setLoadingOrders(true);
      try {
        // Determine if we're in development environment
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        // Check if the API is available before making the request
        let orderData;
        let apiAvailable = false;

        try {
          // Build the API URL with a proper base URL check
          const baseUrl = isDev ? window.location.origin : 'https://handywriterz.com';
          const apiUrl = `${baseUrl}/api/orders/user/${user.id}`;

          // Add a timeout to prevent long waiting times if API is down
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            // Check content type to ensure it's JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              orderData = await response.json();
              apiAvailable = true;
            } else {
              throw new Error('Response is not JSON');
            }
          } else {
            throw new Error(`Failed to fetch orders: ${response.status}`);
          }
        } catch (apiError) {
          // Continue with mock data
        }

        if (apiAvailable && orderData?.orders) {
          const active = orderData.orders.filter((order: any) => order.status !== 'completed');
          const completed = orderData.orders.filter((order: any) => order.status === 'completed');

          setActiveOrders(active);
          setCompletedOrders(completed);

          // Show success toast only in development to confirm real API connection
          if (isDev) {
            toast.success('Connected to orders API successfully');
          }
          setOrdersApiAvailable(true);
        } else {
          // API returned nothing usable
          setOrdersApiAvailable(false);
          setActiveOrders([]);
          setCompletedOrders([]);
          throw new Error('No orders returned from API');
        }
      } catch (error) {
          // Do not show mock data. Explicitly clear orders so the UI only shows real orders.
          setOrdersApiAvailable(false);
          setActiveOrders([]);
          setCompletedOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (activeTab === 'orders' || activeTab === 'completed') {
      fetchOrders();
    }
  }, [user, activeTab]);

  // Add useEffect to fetch messages from Supabase
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || activeTab !== 'messages') return;

      setLoadingMessages(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setMessages(data || []);
      } catch (error) {
        toast.error('Failed to load your messages');
      } finally {
        setLoadingMessages(false);
      }
    };

    if (activeTab === 'messages') {
      fetchMessages();

      // TODO: Convert to Cloudflare real-time updates (WebSocket/Server-Sent Events)
      // const subscription = supabase.channel('messages-channel').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_id=eq.${user?.id}` }, (payload: any) => { setMessages(prev => [payload.new, ...prev]); }).subscribe();
      // return () => { supabase.removeChannel(subscription); };
    }
  }, [user, activeTab]);

  // Add function to send messages
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          user_id: user.id,
          content: newMessage.trim(),
          sender_type: 'user'
        });

      if (error) throw error;

      setNewMessage('');
      toast.success('Message sent successfully');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  // Add function to save profile information
  const handleSaveProfile = async () => {
    if (!user) return;

    setSavingProfile(true);
    try {
      // Here we would typically update the user's profile in Clerk
      // For demo purposes, we'll just show a success message
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b fixed w-full top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                H
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                HandyWriterz
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <span className="font-medium hidden sm:inline">
                  {userName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                  isLoggingOut
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 bg-white w-64 border-r z-30">
        <div className="h-16 border-b flex items-center justify-center">
          <span className="font-medium">Dashboard</span>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 p-2 rounded-lg ${
              activeTab === 'orders'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Active Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`w-full flex items-center gap-3 p-2 rounded-lg ${
              activeTab === 'completed'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileCheck className="h-5 w-5" />
            <span>Completed Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 p-2 rounded-lg ${
              activeTab === 'messages'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Messages</span>
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`w-full flex items-center gap-3 p-2 rounded-lg ${
              activeTab === 'subscription'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span>Subscription</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 p-2 rounded-lg ${
              activeTab === 'settings'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center gap-3 p-2 rounded-lg mt-4 ${
              isLoggingOut
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <LogOut className="h-5 w-5" />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="pt-16 lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h1 className="text-2xl font-bold mb-2">
              Welcome back{user ? `, ${userName}` : ''}! 👋
            </h1>
            <p className="text-gray-600">
              Get expert help with your academic work. Choose a subject area to get started.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <button
              onClick={handleQuickCall}
              className="p-4 bg-green-600 text-white rounded-lg hover:opacity-90 transition-all"
            >
              <Phone className="h-5 w-5 mb-1" />
              <h3 className="font-semibold mb-1 text-sm">Quick Call</h3>
              <p className="text-xs opacity-90">Get instant help via Skype</p>
            </button>

            <button
              onClick={handleQuickMessage}
              className="p-4 bg-[#25D366] text-white rounded-lg hover:opacity-90 transition-all"
            >
              <MessageSquare className="h-5 w-5 mb-1" />
              <h3 className="font-semibold mb-1 text-sm">Quick Message</h3>
              <p className="text-xs opacity-90">Chat with us on WhatsApp</p>
            </button>
          </div>

          {/* Active Orders Tab */}
          {activeTab === 'orders' && !selectedArea && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Active Orders</h2>
                <button
                  onClick={() => setSelectedArea('adult')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  New Order
                </button>
              </div>

              {loadingOrders ? (
                <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                  <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading orders...</p>
                </div>
              ) : activeOrders.length > 0 ? (
                activeOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{`${order.service_type || 'Assignment'} - ${order.subject_area || 'General'}`}</h3>
                        <p className="text-gray-600">
                          {order.word_count?.toLocaleString()} words • Due {new Date(order.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        order.status === 'completed' ? 'bg-green-100 text-green-600' :
                        order.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        £{typeof order.price === 'number' ? order.price.toFixed(2) : '0.00'}
                      </span>
                      <button
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        onClick={() => {
                          // In a real app, this would navigate to order details
                          toast.success(`Viewing details for order ${order.id}`);
                        }}
                      >
                        View Details
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">No active orders</h3>
                  <p className="text-gray-500 mb-4">You don't have any active orders yet.</p>
                  <button
                    onClick={() => setSelectedArea('adult')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Your First Order
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Support Areas Selection */}
          {activeTab === 'orders' && !selectedService && selectedArea && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => setSelectedArea(null)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Back
                </button>
                <h2 className="text-xl font-bold">Select Service Type</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className="p-6 rounded-xl border hover:border-blue-600 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{service.icon}</span>
                      <div>
                        <h3 className="font-medium">{service.title}</h3>
                        <p className="text-sm text-gray-600">{service.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Order Form */}
          {activeTab === 'orders' && selectedService && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => setSelectedService(null)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Back
                </button>
                <h2 className="text-xl font-bold">Order Details</h2>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Word Count</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={wordCount === 0 ? '' : wordCount || ''}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        if (inputValue === '') {
                          setWordCount(0);
                          e.target.setCustomValidity('Word count must be between 100 and 100,000');
                        } else {
                          const value = Number(inputValue);
                          if (value >= 0) {
                            setWordCount(value);
                            if (value >= 100 && value <= 100000) {
                              e.target.setCustomValidity('');
                            } else {
                              e.target.setCustomValidity('Word count must be between 100 and 100,000');
                            }
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && wordCount === 0) {
                          setWordCount(0);
                        }
                      }}
                      className="w-full p-3 border rounded-lg pr-12"
                      placeholder="Enter word count"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-600 hover:text-blue-700"
                      title="Show price calculation"
                    >
                      <Calculator className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {calculatedPrice !== null && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Estimated Price: </span>
                    <span className="text-blue-600">£{calculatedPrice.toFixed(2)}</span>
                  </div>
                )}
                {showPriceBreakdown && (
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm">
                    <h4 className="font-medium mb-2">Price Calculation</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• £18/275 words for dissertations</li>
                      <li>• £18/275 words for Level 7 work</li>
                      <li>• £18/275 words for urgent orders (&lt; 2 days)</li>
                      <li>• £15/275 words for all other cases</li>
                    </ul>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Module</label>
                  <input
                    type="text"
                    value={module}
                    onChange={(e) => setModule(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Enter module name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Study Level</label>
                  <select
                    value={studyLevel}
                    onChange={(e) => setStudyLevel(e.target.value)}
                    required
                    className="w-full p-3 border rounded-lg"
                    title="Choose your study level"
                  >
                    <option value="">Select level</option>
                    <option value="Level 4">Level 4 (Year 1)</option>
                    <option value="Level 5">Level 5 (Year 2)</option>
                    <option value="Level 6">Level 6 (Year 3)</option>
                    <option value="Level 7">Level 7 (Masters)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full p-3 border rounded-lg"
                    title="Select your assignment due date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Instructions</label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={4}
                    className="w-full p-3 border rounded-lg resize-none"
                    placeholder="Enter your specific requirements..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Files</label>
                  <div className="mt-1 flex items-center gap-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      multiple
                      title="Upload assignment files"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
                      disabled={uploading}
                      title="Click to select files"
                    >
                      <Upload className="h-5 w-5" />
                      {uploading ? 'Uploading...' : 'Select Files'}
                    </button>

                    {files.length > 0 && !uploading && uploadedFiles.length === 0 && (
                      <button
                        type="button"
                        onClick={handleUploadSubmit}
                        className="flex items-center gap-2 rounded-md bg-green-50 text-green-600 border border-green-200 px-4 py-2 hover:bg-green-100"
                      >
                        <Upload className="h-5 w-5" />
                        Upload {files.length} file(s)
                      </button>
                    )}
                  </div>

                  {uploading && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Uploading: {uploadProgress}%</p>
                    </div>
                  )}

                  {files.length > 0 && !uploading && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Selected Files:</p>
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm truncate">{file.name} ({formatBytes(file.size)})</span>
                          {uploadedFiles.length === 0 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(index)}
                              className="text-red-500 hover:text-red-600"
                              title="Remove file"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-green-600 flex items-center gap-2">
                          <FileCheck className="h-5 w-5" />
                          <span>Files uploaded successfully!</span>
                        </p>
                      </div>

                      {adminNotified ? (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-blue-600 flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            <span>Documents sent to admin. Ready for payment!</span>
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <p className="text-orange-600 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            <span>Documents need to be sent to admin before payment.</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setShowEmailOption(!showEmailOption)}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {showEmailOption ? 'Hide email option' : 'Send files via email'}
                    </button>

                    <button
                      type="button"
                      onClick={handleSendToAdmin}
                      className="text-green-600 hover:text-green-700 text-sm flex items-center mt-2"
                      disabled={!uploadedFiles.length}
                    >
                      <User className="h-4 w-4 mr-1" />
                      Send to admin
                    </button>
                  </div>

                  {showEmailOption && (
                    <div className="mt-4 p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Send Files via Email</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Email Address</label>
                          <input
                            type="email"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            placeholder="recipient@example.com"
                            title="Recipient email address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Message (Optional)</label>
                          <textarea
                            value={emailMessage}
                            onChange={(e) => setEmailMessage(e.target.value)}
                            className="w-full p-2 border rounded-md resize-none"
                            rows={3}
                            placeholder="Add a message to include with the files"
                            title="Optional message"
                          ></textarea>
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={handleEmailDocuments}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            disabled={!uploadedFiles.length || !emailAddress}
                          >
                            Send Files
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedService(null);
                      setAdminNotified(false);
                      setFiles([]);
                      setUploadedFiles([]);
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                      uploadedFiles.length > 0 && adminNotified
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : uploadedFiles.length > 0 && !adminNotified
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : files.length > 0
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
                    disabled={files.length === 0 && uploadedFiles.length === 0}
                  >
                    {uploadedFiles.length > 0 && adminNotified ? (
                      <>
                        <PoundSterling className="h-4 w-4" />
                        Proceed to Payment
                      </>
                    ) : uploadedFiles.length > 0 && !adminNotified ? (
                      <>
                        <Send className="h-4 w-4" />
                        Send to Admin First
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        {files.length > 0 ? 'Upload Files & Continue' : 'Please Select Files'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}


          {/* Completed Orders Tab */}
          {activeTab === 'completed' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-6">Completed Orders</h2>

              {loadingOrders ? (
                <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                  <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading completed orders...</p>
                </div>
              ) : completedOrders.length > 0 ? (
                completedOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{`${order.service_type || 'Assignment'} - ${order.subject_area || 'General'}`}</h3>
                        <p className="text-gray-600">
                          {order.word_count?.toLocaleString()} words • Completed {new Date(order.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                        Completed
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        £{typeof order.price === 'number' ? order.price.toFixed(2) : '0.00'}
                      </span>
                      <div className="flex gap-2">
                        <button
                          className="px-4 py-2 text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          onClick={() => {
                            // In a real app, this would download the files
                            if (order.files && order.files.length > 0) {
                              const firstFile = order.files[0];
                              if (firstFile.url) {
                                window.open(firstFile.url, '_blank');
                              } else {
                                toast.error('Download link not available');
                              }
                            } else {
                              toast.error('No files available for download');
                            }
                          }}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                        <button
                          className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                          onClick={() => {
                            // In a real app, this would navigate to order details
                            toast.success(`Viewing details for order ${order.id}`);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                  <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">No completed orders</h3>
                  <p className="text-gray-500">You don't have any completed orders yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b px-6 py-4">
                <h2 className="text-xl font-bold">Messages</h2>
              </div>

              {loadingMessages ? (
                <div className="p-6 text-center">
                  <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading messages...</p>
                </div>
              ) : messages.length > 0 ? (
                <div className="p-6">
                  <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.sender_type === 'user'
                            ? 'bg-blue-100 ml-12'
                            : 'bg-gray-100 mr-12'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 p-3 border rounded-lg"
                      placeholder="Type your message here..."
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Send
                    </button>
                  </form>
                </div>
              ) : (
              <div className="p-6 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="mb-4">No messages yet</p>

                  <form onSubmit={handleSendMessage} className="flex gap-2 max-w-md mx-auto">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 p-3 border rounded-lg"
                      placeholder="Send us a message..."
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Send
                    </button>
                  </form>

                  <div className="mt-8 border-t pt-4">
                    <p className="text-sm text-gray-600 mb-3">Need to send documents or have urgent matters?</p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => window.open('mailto:admin@handywriterz.com', '_blank')}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Email Admin</span>
                      </button>
                      <button
                        onClick={handleQuickMessage}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>WhatsApp Support</span>
                      </button>
                    </div>

                    {/* Email Admin Button with Modal */}
                    <div className="mt-6">
                      <button
                        onClick={() => setShowEmailOption(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 mx-auto flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>Send Detailed Email</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Email Admin Modal */}
          {showEmailOption && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Contact Admin</h2>
                  <button
                    onClick={() => setShowEmailOption(false)}
                    className="text-gray-500 hover:text-gray-700"
                    title="Close modal"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEmailDocuments();
                  }}
                  aria-label="Contact admin form"
                >
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="userName" className="block text-sm font-medium mb-1">Your Name</label>
                      <input
                        type="text"
                        id="userName"
                        className="w-full p-2 border rounded-md"
                        value={userName}
                        readOnly
                        aria-label="Your name"
                      />
                    </div>

                    <div>
                      <label htmlFor="emailAddress" className="block text-sm font-medium mb-1">Email Address</label>
                      <input
                        type="email"
                        id="emailAddress"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        placeholder="admin@handywriterz.com"
                        defaultValue="admin@handywriterz.com"
                        required
                        aria-label="Admin email address"
                      />
                    </div>

                    <div>
                      <label htmlFor="emailSubject" className="block text-sm font-medium mb-1">Subject</label>
                      <input
                        type="text"
                        id="emailSubject"
                        name="emailSubject"
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter subject"
                        required
                        aria-label="Email subject"
                      />
                    </div>

                    <div>
                      <label htmlFor="emailMessage" className="block text-sm font-medium mb-1">Message</label>
                      <textarea
                        id="emailMessage"
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        className="w-full p-2 border rounded-md resize-none"
                        rows={5}
                        placeholder="Your message to the admin..."
                        required
                        aria-label="Email message content"
                      ></textarea>
                    </div>

                    <div>
                      <label htmlFor="fileUpload" className="block text-sm font-medium mb-1">Attach Files</label>
                      <input
                        type="file"
                        id="fileUpload"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        multiple
                        title="Select files to attach"
                        aria-label="Select files to attach"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 w-full"
                        aria-label="Select files"
                      >
                        <Upload className="h-5 w-5" />
                        Select Files
                      </button>

                      {(files.length > 0 || uploadedFiles.length > 0) && (
                        <div className="mt-2 text-sm">
                          <p className="text-gray-600">
                            {files.length > 0 && `${files.length} new file(s) selected`}
                            {files.length > 0 && uploadedFiles.length > 0 && ' • '}
                            {uploadedFiles.length > 0 && `${uploadedFiles.length} file(s) already uploaded`}
                          </p>

                          {/* Show uploaded files with option to remove */}
                          {uploadedFiles.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                                  <span className="truncate max-w-[200px]">{file.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                    aria-label={`Remove ${file.name}`}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowEmailOption(false)}
                        className="px-4 py-2 border rounded-md hover:bg-gray-50"
                        aria-label="Cancel"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                        disabled={uploading}
                        aria-label="Send email"
                      >
                        {uploading ? 'Sending...' : 'Send Documents'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <SubscriptionStatus />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Account Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.imageUrl ? (
                        <img src={user.imageUrl} alt={`${userName}'s profile`} className="h-full w-full object-cover" />
                      ) : (
                      <User className="h-10 w-10 text-gray-400" />
                      )}
                    </div>
                    <button
                      className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white"
                      title="Upload profile picture"
                      onClick={() => {
                        // This would open Clerk's profile image editor in a real implementation
                        toast.success('Profile picture uploads would be handled by Clerk in production');
                      }}
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-medium">Profile Picture</h3>
                    <p className="text-sm text-gray-500">Upload a new photo or choose an avatar</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full p-3 border rounded-lg bg-gray-50"
                    placeholder="your@email.com"
                    value={userEmail}
                    readOnly
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">To change your email, please use your account settings</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg"
                    placeholder="Your full name"
                    value={userName}
                    onChange={(e) => {
                      // In a real implementation, this would update a state variable
                      toast.success('Name changes would be handled by Clerk in production');
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number (Optional)</label>
                  <div className="flex gap-2">
                    <select
                      className="w-24 p-3 border rounded-lg"
                      title="Select country code"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+91">+91</option>
                    </select>
                    <input
                      type="tel"
                      className="flex-1 p-3 border rounded-lg"
                      placeholder="Phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        // In a real implementation, this would delete the account
                        toast.error('Account deletion is disabled in demo mode');
                      }
                    }}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                    <span>Delete Account</span>
                  </button>
                  <button
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
                    onClick={() => toast.success('Account archiving would be implemented in production')}
                  >
                    <Archive className="h-4 w-4" />
                    <span>Archive Profile</span>
                  </button>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    onClick={() => {
                      // Reset form
                      setPhoneNumber('');
                      setCountryCode('+44');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                  >
                    {savingProfile ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Documents Tab */}
          {isAdmin && activeTab === 'admin' && <AdminDocuments />}

          {/* Add Admin Tab for Admins */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-3 p-2 rounded-lg ${
                activeTab === 'admin'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              title="View user documents"
            >
              <FileText className="h-5 w-5" />
              <span>User Documents</span>
            </button>
          )}

          {/* Modals */}
          {showTurnitinModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Check Turnitin</h2>
                  <button
                    onClick={() => {
                      setTurnitinFile(null);
                      setTurnitinResult(null);
                      setShowTurnitinModal(false);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                    title="Close Turnitin check"
                  >
                    <X size={20} />
                  </button>
                </div>

                {!turnitinResult ? (
                  <>
                    <p className="text-gray-600 mb-4">
                      Upload your document to check for plagiarism.
                      <br />
                      Supported formats: PDF, DOC, DOCX, TXT
                    </p>

                    <div className="space-y-4">
                      <input
                        type="file"
                        ref={turnitinFileInputRef}
                        onChange={handleTurnitinFileSelect}
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        id="turnitinFileInput"
                        title="Upload document for Turnitin check"
                      />

                      <div
                        onClick={() => turnitinFileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                        role="button"
                        tabIndex={0}
                        title="Select file for Turnitin check"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            turnitinFileInputRef.current?.click();
                          }
                        }}
                      >
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Click to select a file
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Maximum file size: 10MB
                        </p>
                      </div>

                      {turnitinFile && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {turnitinFile.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Size: {(turnitinFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              onClick={() => setTurnitinFile(null)}
                              className="text-gray-400 hover:text-gray-500"
                              title="Remove file"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      )}

                      {processingMessage && (
                        <div className="mt-4 text-center p-4 bg-blue-50 rounded-lg">
                          <div className="inline-flex items-center">
                            <div className="animate-spin h-5 w-5 mr-2 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                            <p className="text-sm text-blue-600">{processingMessage}</p>
                          </div>
                        </div>
                      )}

                      <div className="mt-6 flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setTurnitinFile(null);
                            setShowTurnitinModal(false);
                          }}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleTurnitinCheck}
                          disabled={!turnitinFile || isCheckingTurnitin}
                          className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                            !turnitinFile || isCheckingTurnitin
                              ? 'bg-blue-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {isCheckingTurnitin ? (
                            <div className="inline-flex items-center">
                              <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
                              Processing...
                            </div>
                          ) : (
                            'Check Turnitin (£5)'
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Results</h3>
                    <p className={`text-${turnitinResult.similarity > 20 ? 'red' : 'green'}-600 font-medium`}>
                      Similarity Score: {turnitinResult.similarity}%
                    </p>
                    {turnitinResult.matches.map((match: any, index: number) => (
                      <div key={index} className="mt-2">
                        <p className="text-sm font-medium">
                          Source: {match.source}
                        </p>
                        <p className="text-sm text-gray-500">
                          Match: {match.percentage}%
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
