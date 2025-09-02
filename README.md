# 📦 Inventory Management System

A full-stack inventory management system built with React, Node.js, Express, and MongoDB. This system provides comprehensive inventory tracking, product management, invoice generation, and business analytics with a responsive mobile-first design.

![Inventory Management System](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 🚀 Features

### 🔐 Authentication & Security
- **User Registration & Login**: Secure authentication with JWT tokens
- **Password Reset**: Email-based OTP verification for password recovery
- **Session Management**: Automatic token refresh and secure logout
- **Profile Management**: Update personal information and change passwords

### 📊 Dashboard & Analytics
- **Real-time Dashboard**: Overview of inventory metrics and key performance indicators
- **Business Analytics**: Revenue tracking, profit calculations, and sales insights
- **Interactive Charts**: Visual representation of data using Chart.js
- **Customizable Layout**: Drag-and-drop dashboard components for personalized experience

### 🏪 Product Management
- **CRUD Operations**: Add, view, update, and delete products
- **Bulk Import**: CSV upload functionality for mass product entry
- **Product Categories**: Organize products by categories
- **Stock Tracking**: Real-time inventory levels and threshold alerts
- **Expiry Management**: Automatic tracking of product expiration dates
- **Image Support**: Product image upload and display
- **Search & Pagination**: Advanced search functionality with paginated results

### 🛒 Purchase & Sales
- **Product Purchase**: Buy products directly from inventory
- **Automatic Invoice Generation**: Create invoices for every purchase
- **Stock Updates**: Automatic inventory adjustment after purchases
- **Purchase History**: Track all product purchases and sales

### 🧾 Invoice Management
- **Invoice Generation**: Automatic invoice creation for purchases
- **Invoice Templates**: Professional invoice layouts with company branding
- **Status Tracking**: Monitor paid/unpaid invoice status
- **Invoice Search**: Find invoices by ID, amount, or date
- **Mobile-Optimized**: Responsive invoice interface for mobile devices

### 📈 Statistics & Reporting
- **Revenue Analytics**: Track revenue trends and growth
- **Top Products**: Identify best-selling products with rating system
- **Stock Analysis**: Monitor stock levels and low-stock alerts
- **Sales Metrics**: Comprehensive sales performance tracking
- **Time-based Reports**: Weekly, monthly, and custom date range analytics

### 📱 Mobile-First Design
- **Responsive Layout**: Optimized for all screen sizes
- **Mobile Navigation**: Touch-friendly navigation with bottom nav bar
- **Mobile Headers**: Dedicated mobile interface components
- **Touch Interactions**: Optimized touch targets and gestures
- **Progressive Web App**: PWA-ready with offline capabilities

### ⚡ Technical Features
- **Real-time Updates**: Live inventory updates across all components
- **Error Handling**: Comprehensive error management and user feedback
- **Data Validation**: Client and server-side input validation
- **Security**: Protected routes with authentication middleware
- **API Documentation**: RESTful API endpoints with proper error responses
- **Database Management**: MongoDB with Mongoose ODM

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1**: Modern React with hooks and context
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing and navigation
- **Chart.js**: Interactive data visualization
- **React Hot Toast**: Beautiful notification system
- **Lucide React**: Modern icon library
- **CSS3**: Custom styling with mobile-first approach

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: MongoDB object modeling library
- **JWT**: JSON Web Token for authentication
- **Bcrypt**: Password hashing and security
- **Nodemailer**: Email service for OTP verification
- **Multer**: File upload handling
- **Node-cron**: Scheduled task management

### Development Tools
- **ESLint**: Code linting and quality assurance
- **Nodemon**: Development server with hot reload
- **Dotenv**: Environment variable management

## 🏗️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/inventory-management
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   
   # Email Configuration (for OTP verification)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Start the backend server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_REACT_APP_API_BASE_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:5174`

### Database Setup

The application will automatically create the necessary MongoDB collections on first run. The database includes:

- **users**: User account information
- **products**: Product inventory data
- **purchases**: Purchase transaction records
- **invoices**: Generated invoice documents
- **totalcounters**: System counters for statistics

## 🎯 Demo Credentials

### Test User Account
- **Email**: demo@inventory.com
- **Password**: demo12345

### Test Admin Account
- **Email**: admin@inventory.com
- **Password**: admin12345

### Sample Data
The system includes sample products and data for testing:
- Electronics category with laptops, phones, tablets
- Grocery items with expiry date tracking
- Clothing items with size variations
- Pre-generated invoices and purchase history

## 📱 Usage Guide

### Getting Started
1. **Sign Up**: Create a new account or use demo credentials
2. **Dashboard**: View your inventory overview and key metrics
3. **Add Products**: Use individual or bulk CSV upload to add products
4. **Make Purchases**: Click on products to buy and generate invoices
5. **Track Inventory**: Monitor stock levels and expiry dates
6. **View Analytics**: Check statistics and business insights

### Key Workflows

#### Adding Products
1. Navigate to Products page
2. Click "Add Product" button
3. Choose individual or bulk upload
4. Fill in product details or upload CSV
5. Save and view in inventory

#### Making Purchases
1. Go to Products page
2. Click on any available product
3. Enter quantity to purchase
4. Confirm purchase
5. View generated invoice

#### Managing Invoices
1. Visit Invoice page
2. View all generated invoices
3. Filter by status or search by ID
4. Click to view detailed invoice

### Mobile Usage
- **Bottom Navigation**: Quick access to main sections
- **Touch Gestures**: Swipe and tap interactions
- **Mobile Headers**: Dedicated mobile interface
- **Responsive Design**: Optimized for all screen sizes

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/reset-password` - Password reset

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/bulk` - Bulk product upload
- `POST /api/products/buy` - Purchase product
- `GET /api/products/summary` - Get inventory summary

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get specific invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Statistics
- `GET /api/statistics` - Get business analytics

## 🚀 Deployment

### Vercel Deployment (Recommended)

Both frontend and backend are configured for Vercel deployment with included `vercel.json` files.

#### Frontend Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

#### Backend Deployment
1. Use MongoDB Atlas for cloud database
2. Set up environment variables in Vercel
3. Deploy backend as serverless functions

### Manual Deployment
1. Build the frontend: `npm run build`
2. Use PM2 or similar for backend process management
3. Set up nginx for reverse proxy
4. Configure SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- CSV upload requires specific column format
- Mobile navigation may need refresh after login
- Large inventory datasets may impact performance
- Email OTP delivery depends on SMTP configuration

## 🔮 Future Enhancements

- [ ] Multi-warehouse inventory management
- [ ] Barcode scanning for mobile devices
- [ ] Advanced reporting with PDF export
- [ ] Integration with accounting software
- [ ] Supplier management system
- [ ] Purchase order automation
- [ ] Real-time notifications
- [ ] Multi-language support

## 📞 Support

For support, email support@inventory.com or create an issue in the GitHub repository.

## 🙏 Acknowledgments

- React community for excellent documentation
- MongoDB for flexible database solutions
- Chart.js for beautiful data visualization
- All open-source contributors who made this possible

---

**Built with ❤️ for efficient inventory management**
