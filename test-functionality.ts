// Test file to verify core functionality
import { documentSubmissionService } from './src/services/documentSubmissionService';
import { cloudflareUploadService } from './src/services/cloudflareUploadService';

// This is a placeholder test file to verify the imports work correctly
console.log('Testing core functionality imports...');

// Check if services are properly exported
console.log('Document submission service:', typeof documentSubmissionService);
console.log('Cloudflare upload service:', typeof cloudflareUploadService);

// Verify that the services have the expected methods
console.log('Document submission service methods:');
console.log('- submitDocumentsToAdmin:', typeof documentSubmissionService.submitDocumentsToAdmin);
console.log('- uploadToR2Worker:', typeof documentSubmissionService.uploadToR2Worker);
console.log('- saveSubmissionToDatabase:', typeof documentSubmissionService.saveSubmissionToDatabase);

console.log('Cloudflare upload service methods:');
console.log('- uploadFile:', typeof cloudflareUploadService.uploadFile);
console.log('- uploadMultipleFiles:', typeof cloudflareUploadService.uploadMultipleFiles);
console.log('- deleteFile:', typeof cloudflareUploadService.deleteFile);

console.log('Core functionality verification complete.');