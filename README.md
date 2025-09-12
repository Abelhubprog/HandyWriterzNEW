# HandyWriterz - Professional Academic Writing Services

![HandyWriterz](https://handywriterz.com/favicon.ico)

## 🎓 About HandyWriterz

HandyWriterz is a comprehensive academic writing platform that connects students with professional writers for essays, research papers, dissertations, and other academic work. Built with modern web technologies and designed for scale.

## ✨ Features

### 🔐 Authentication & Security
- **Clerk Authentication** - Secure user authentication and session management
- **Role-based Access Control** - Admin and user role separation
- **Multi-factor Authentication** - Enhanced security for admin accounts

### 💰 Payment Processing
- **PayPal Integration** - Fully functional PayPal payment processing
- **Coinbase Commerce** - Production-ready cryptocurrency payments (USDC, ETH, BTC)
- **REOWN APPKIT** - Wallet connectivity for direct crypto transactions
- **Payment Receipts** - Downloadable and shareable transaction receipts

### 📁 File Management
- **Cloudflare R2 Storage** - Secure, scalable file storage
- **Document Upload System** - Multi-file upload with progress tracking
- **File Validation** - Comprehensive file type and size validation
- **Admin Notifications** - Automatic email alerts for new submissions

### 💬 Communication
- **Messaging System** - Built-in customer-admin communication
- **Email Notifications** - Automated status updates and confirmations
- **Real-time Updates** - Live order status tracking

### 📊 Admin Dashboard
- **Order Management** - Complete order lifecycle management
- **User Management** - User accounts and profile administration
- **Analytics Dashboard** - Business intelligence and reporting
- **Content Management** - Blog posts and service page management

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** for form management
- **React Hot Toast** for notifications

### Backend & Infrastructure
- **Cloudflare Workers** - Serverless API endpoints
- **Cloudflare D1** - SQLite database
- **Cloudflare R2** - Object storage
- **Resend** - Email delivery service

### Authentication & Payments
- **Clerk** - Authentication service
- **PayPal SDK** - Payment processing
- **Coinbase Commerce API** - Cryptocurrency payments
- **REOWN APPKIT** - Web3 wallet integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Cloudflare account with Workers/D1/R2 access
- Clerk account for authentication
- PayPal developer account
- Coinbase Commerce account (for crypto payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/handywriterz/handywriterz.git
   cd handywriterz
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Configuration**
   
   Create `.env` file:
   ```env
   # Authentication
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
   
   # Cloudflare
   VITE_CLOUDFLARE_R2_BUCKET_URL=https://xxxxx.r2.cloudflarestorage.com
   VITE_CLOUDFLARE_CDN_URL=https://cdn.handywriterz.com
   
   # Payments
   VITE_PAYPAL_CLIENT_ID=xxxxx
   VITE_COINBASE_API_KEY=xxxxx
   VITE_REOWN_PROJECT_ID=xxxxx
   
   # Email
   VITE_RESEND_API_KEY=re_xxxxx
   ```

4. **Database Setup**
   ```bash
   # Initialize Cloudflare D1 database
   wrangler d1 create handywriterz-db
   
   # Run migrations
   wrangler d1 execute handywriterz-db --file=./schema/cloudflare-d1.sql
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📦 Production Deployment

### Cloudflare Pages Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare Pages**
   ```bash
   wrangler pages deploy dist
   ```

3. **Configure Worker Routes**
   - Set up API routes in `wrangler.toml`
   - Deploy Workers for API endpoints
   - Configure R2 bucket bindings

### Environment Variables (Production)
Configure these in Cloudflare Pages dashboard:

```env
# Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx

# Database & Storage
DATABASE_URL=your-d1-database-url
R2_BUCKET_NAME=handywriterz-uploads

# Payment Processing
COINBASE_API_KEY=xxxxx
COINBASE_WEBHOOK_SECRET=xxxxx
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=xxxxx

# Email Service
RESEND_API_KEY=re_xxxxx
ADMIN_EMAIL=admin@handywriterz.com

# Security
JWT_SECRET=your-secure-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

## 🏗 Architecture

### Frontend Structure
```
src/
├── components/          # Reusable UI components
│   ├── Dashboard/      # User dashboard components
│   ├── admin/          # Admin panel components
│   ├── auth/           # Authentication components
│   └── ui/             # Base UI components
├── pages/              # Route components
├── services/           # API service layers
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── types/              # TypeScript type definitions
└── styles/             # CSS and styling
```

### API Structure
```
api/
├── upload.ts           # File upload endpoints
├── payments.ts         # Payment processing
├── send-documents.ts   # Email notifications
├── messages.ts         # Messaging system
└── notifications.ts    # Notification service
```

### Database Schema
- **Users** - User accounts and profiles
- **Orders** - Order management and tracking
- **Payments** - Payment history and receipts
- **Document Submissions** - File uploads and metadata
- **Messages** - Customer-admin communication
- **Admin Users** - Administrative access control

## 🔧 Configuration

### Payment Methods

#### PayPal Setup
1. Create PayPal developer account
2. Generate Client ID and Secret
3. Configure webhook endpoints
4. Set production/sandbox mode

#### Coinbase Commerce Setup
1. Create Coinbase Commerce account
2. Generate API key
3. Configure webhook URL
4. Set supported cryptocurrencies

#### REOWN APPKIT Setup
1. Create REOWN project
2. Get project ID
3. Configure supported networks
4. Set wallet connection options

### File Upload Configuration

#### Cloudflare R2 Setup
1. Create R2 bucket
2. Configure CORS policies
3. Set up custom domain (optional)
4. Generate API tokens

#### File Validation
- Maximum file size: 50MB
- Supported formats: PDF, DOC, DOCX, TXT, ZIP
- Virus scanning integration
- File type validation

## 🛡 Security Features

### Authentication Security
- JWT token validation
- Session management
- Role-based permissions
- Multi-factor authentication support

### Payment Security
- PCI DSS compliance
- Webhook signature verification
- Transaction encryption
- Fraud detection

### Data Protection
- GDPR compliance
- Data encryption at rest
- Secure file transmission
- Privacy controls

## 📊 Monitoring & Analytics

### Performance Monitoring
- Cloudflare Analytics
- Core Web Vitals tracking
- Error monitoring
- Uptime monitoring

### Business Analytics
- Order tracking
- Payment analytics
- User engagement metrics
- Conversion tracking

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test Coverage
- Authentication flows
- Payment processing
- File upload/download
- Admin functionality
- Error handling

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review process

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Conventional commits

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/profile` - User profile

### Payment Endpoints
- `POST /api/payments` - Create payment
- `GET /api/payments/:id` - Get payment status
- `POST /api/payments/coinbase-webhook` - Coinbase webhooks

### File Management
- `POST /api/upload` - Upload files
- `GET /api/upload/:id` - Download files
- `DELETE /api/upload/:id` - Delete files

### Order Management
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order

## 🆘 Support

### Technical Support
- Email: admin@handywriterz.com
- WhatsApp: +254 711 264 993
- Documentation: [docs.handywriterz.com](https://docs.handywriterz.com)

### Business Inquiries
- Website: [handywriterz.com](https://handywriterz.com)
- Business Email: business@handywriterz.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Cloudflare for infrastructure
- Clerk for authentication
- PayPal for payment processing
- REOWN for Web3 integration
- The open source community

---

**HandyWriterz** - Empowering academic success through professional writing services.

*Built with ❤️ for students worldwide*#
