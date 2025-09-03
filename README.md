# 📦 Inventory Management System

A comprehensive full-stack inventory management system built with React, Node.js, Express, and MongoDB. This enterprise-grade solution provides complete inventory tracking, product management, invoice generation, and business analytics with a responsive mobile-first design.

![Inventory Management System](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 🚀 System Overview

This inventory management system is designed to handle all aspects of modern business inventory operations, from basic product tracking to advanced analytics and reporting. The system features a user-friendly interface with drag-and-drop customization, real-time data updates, and comprehensive mobile support.

## 📦 Core Modules

### 🔐 Authentication & Authorization

Comprehensive security system with JWT-based authentication and email verification.

**Available Endpoints:**
- `/api/auth/login` → User login with JWT token issuance
- `/api/auth/signup` → New user registration
- `/api/auth/forgot-password` → Request password reset, sends OTP to registered email
- `/api/auth/otp-verification` → Verify OTP received via email
- `/api/auth/reset-password` → Reset password after successful OTP verification

**Protected Routes:**
The following routes require valid JWT authentication:
- `/` → Home Dashboard
- `/product` → Product Management
- `/invoice` → Invoice Management
- `/statistics` → Sales & Purchase Analytics
- `/setting` → Account Management

**Security Features:**
- Email uniqueness validation
- Forced logout on email/password updates
- Session management with automatic token refresh
- Protected API endpoints with authentication middleware

### 📦 Product Management

The Product Management module serves as the core of inventory tracking, where all product information is displayed and managed efficiently.

#### � Product Attributes

Each product in the system contains the following attributes:

| Attribute | Description |
|-----------|-------------|
| **Name** | The name of the product (e.g., "Apple iPhone 14") |
| **Price** | Price of a single unit of the product |
| **Quantity** | Current stock available in numbers |
| **Threshold Value** | Minimum stock level set for the product. Helps trigger Low Stock alerts |
| **Expiry Date** | The date after which the product is considered expired |
| **Availability** | Auto-calculated status based on Quantity & Threshold |

#### ✅ Availability Status (Auto-Calculated)

The system automatically calculates product availability based on business rules:

- **In Stock** → `Quantity > Threshold`
- **Low Stock** → `Quantity ≤ Threshold` but `> 0`
- **Out of Stock** → `Quantity = 0`
- **Expired** → Cron job runs daily and marks products expired. Expired products appear in red with quantity auto-set to 0

#### ⚙️ Product Management Features

- **Add / Edit / Delete Products** → Complete CRUD operations for inventory management
- **Bulk Upload (CSV)** → Import multiple products in one go (CSV excludes images)
- **Upload Modal Management** → Modal closes automatically if user clicks outside it
- **Backend Pagination** → Smooth performance even with large datasets
- **Advanced Search** → Search products by name, category, or supplier (processed on backend)
- **Quick Order Modal** → Clicking on a product cell opens a modal where users can:
  - Enter additional quantity to order
  - Confirm purchase with automatic quantity updates

#### 🔴 Empty State Handling
When no products exist, the table displays: **"No products available."**

#### 📱 Add New Product Form

When adding a new product, the following fields are available:

| Field | Description |
|-------|-------------|
| **Product Image** | Upload by dragging an image or browsing manually |
| **Product Name** | Enter the product's name |
| **Product ID** | Unique identifier for the product (user-specific) |
| **Category** | Select the category (e.g., Electronics, Groceries) |
| **Price** | Price per unit |
| **Quantity** | Initial stock available |
| **Unit** | Measurement unit (e.g., pcs, kg, liters) |
| **Expiry Date** | Expiration date in dd-mm-yyyy format |
| **Threshold Value** | Minimum stock before product is marked Low Stock |

**Form Actions:**
- **Discard** → Cancel product creation
- **Add Product** → Save product details and add to inventory

### 🧾 Invoice Management

The Invoice Management module allows businesses to create, track, and manage invoices efficiently with comprehensive status tracking and reporting.

#### 📊 Dashboard Metrics (Invoice Overview)

| Metric | Description |
|--------|-------------|
| **Overall Invoices** | Total number of invoices created in the system |
| **Recent Transactions (Last 7 Days)** | Number of invoices generated in the last 7 days |
| **Total Invoices (Last 7 Days)** | Count of invoices created during the last week |
| **Processed (Last 7 Days)** | Represents the total views per unique invoice |
| **Paid Amount (₹)** | Total value of all invoices marked as Paid |
| **Customers (Last 7 Days)** | Number of paid transactions completed in the last 7 days |
| **Unpaid Amount (₹)** | Total outstanding invoice amount pending |
| **Ordered (Unpaid Section)** | Same as Unpaid Amount, reflecting the sum of all unpaid invoices |
| **Pending Payment** | Count of invoices currently in Unpaid status |

#### 📑 Invoices List (Table View)

Each row in the invoice table contains comprehensive information:

| Attribute | Description |
|-----------|-------------|
| **Invoice ID** | Unique identifier auto-generated on invoice creation |
| **Reference Number** | Generated when an invoice is marked as Paid (empty until then) |
| **Amount (₹)** | Total cost of all products in the invoice |
| **Status** | Unpaid (default) / Paid (on confirmation) |
| **Due Date** | Auto-set to 10 days from invoice creation |

**Table Actions:**
- **View Invoice** → Open the Invoice Template for detailed breakdown
- **Mark as Paid** → Updates status, assigns Reference Number
- **Delete Invoice** → Invoice can be deleted whether Paid or Unpaid

#### 🖨️ Invoice Template (Detailed View)

When a user opens an invoice, a detailed invoice template is displayed:

| Section | Details |
|---------|---------|
| **Invoice Metadata** | Invoice ID, Reference Number, Invoice Date, Due Date |
| **Products Bought** | List of all linked products with: Product Name, Quantity, Price per unit, Subtotal |
| **Total Due** | Sum of all product subtotals (final invoice amount) |
| **Billing Address** | Customer's billing address as entered during invoice creation |

**Template Actions:**
- **Export PDF** → Save the invoice as a PDF file
- **Print Invoice** → Print-ready formatted invoice for official use

#### � Empty State
If no invoices exist, the table displays: **"No Invoices Found."**

### 🏠 Dashboard (Home)

The Dashboard provides a comprehensive overview of business operations with customizable widgets and real-time data.

#### 📊 Displayed Sections

- **Sales Overview** → Sales, Revenue, Profit, Cost metrics
- **Purchase Overview** → Purchases, Cost, Cancel, Return statistics
- **Inventory Summary** → Quantity in hand, To be received
- **Product Summary** → Suppliers, Categories overview
- **Sales & Purchase Graph** → Interactive charts with Weekly/Monthly/Yearly filters
- **Top Products List** → Performance-based ranking with product images

#### 🎯 Drag & Drop Functionality

- **Widget Reordering** → Cards can be reordered with intuitive drag-and-drop
- **Persistent Layouts** → User preferences are saved in MongoDB
- **Cross-Device Sync** → Layout preferences sync across devices
- **Loading States** → Persisted layouts may take time to load after deployment

### 📈 Statistics Page

Advanced analytics and reporting with interactive visualizations and customizable layouts.

#### � Key Metrics

- **Total Revenue** → Aggregate revenue across all invoices and transactions
- **Products Sold** → Total count of units sold with trending analysis
- **Products in Stock** → Current available stock with threshold monitoring
- **Interactive Graphs** → Monthly sales and purchase graphs with time-period filters
- **Top Products** → Ranking and ratings of best-selling products with performance metrics

#### 🎯 Advanced Features

- **Drag & Drop Layout** → Widgets (graphs, cards, rankings) are reorderable horizontally
- **Layout Persistence** → User preferences are saved in MongoDB for consistent experience
- **Real-time Updates** → Charts and metrics update automatically with new data
- **Filter Options** → Weekly, Monthly, and Yearly views for detailed analysis

### ⚙️ Settings Management

Settings are organized into two comprehensive modules for complete account control.

#### 1. Account Management

- **Reset Layout** → Resets drag-and-drop layouts back to default for Dashboard and Statistics pages
- **Logout** → Secure session clearing with automatic redirection to login

#### 2. Edit Profile

Users can update personal information with proper validation:

- **Name** → Update display name with validation
- **Email** → Change email address (requires re-login upon change)
- **Password** → Secure password updates with encryption

**Security Validations:**
- **Email Uniqueness** → Changing to an already-registered email is rejected
- **Forced Re-authentication** → On email/password update, user is logged out and redirected to login for security

## 🛠️ Tech Stack

### Frontend Technologies
- **React 19.1.1**: Modern React with hooks and context API
- **Vite**: Lightning-fast build tool and development server
- **React Router**: Client-side routing and navigation management
- **Chart.js**: Interactive data visualization and analytics
- **React Hot Toast**: Beautiful notification system
- **CSS3**: Custom styling with mobile-first responsive approach

### Backend Technologies
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework with middleware support
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: MongoDB object modeling library with schema validation
- **JWT**: JSON Web Token for secure authentication
- **Bcrypt**: Password hashing and security encryption
- **Nodemailer**: Email service for OTP verification and notifications
- **Multer**: File upload handling for product images
- **Node-cron**: Scheduled task management for automated processes

## 🎯 Key Features Summary

### 🔑 Core Functionality
- **Complete Inventory Tracking**: Full CRUD operations with real-time updates
- **Automated Stock Management**: Threshold-based alerts and expiry tracking
- **Invoice Generation**: Automatic invoice creation with PDF export
- **Business Analytics**: Comprehensive reporting with interactive charts
- **User Management**: Secure authentication with profile management
- **Mobile-First Design**: Responsive interface optimized for all devices

### 🚀 Advanced Features
- **Drag & Drop Layouts**: Customizable dashboard with persistent preferences
- **Bulk Operations**: CSV import/export for efficient data management
- **Real-time Updates**: Live data synchronization across all components
- **Email Integration**: OTP verification and notification system
- **Search & Filtering**: Advanced search capabilities with pagination
- **Data Visualization**: Interactive charts with multiple time period filters

### 📱 Mobile Optimization
- **Touch-Friendly Interface**: Optimized for mobile interactions
- **Responsive Charts**: Mobile-adapted data visualizations
- **Bottom Navigation**: Easy access to core features on mobile
- **Mobile Headers**: Dedicated mobile interface components
- **Progressive Web App**: PWA-ready with offline capabilities

## 🏗️ Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Quick Start Guide

#### 1. Clone the Repository
```bash
git clone https://github.com/rudrasgithub/inventory.git
cd inventory
```

#### 2. Backend Setup

Navigate to backend directory and install dependencies:
```bash
cd backend
npm install
```

Create environment configuration file:
```bash
# Create .env file in backend directory
touch .env
```

Add the following environment variables:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/inventory-management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-complex
JWT_EXPIRES_IN=7d

# Email Configuration (for OTP verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=your-email@gmail.com
```

Start the backend server:
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

#### 3. Frontend Setup

Navigate to frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```

Create environment configuration file:
```bash
# Create .env file in frontend directory
touch .env
```

Add the following environment variables:
```env
# API Configuration
VITE_REACT_APP_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Inventory Management System
```

Start the development server:
```bash
npm run dev
```

#### 4. Database Setup

**Option 1: Local MongoDB**
1. Install MongoDB on your system
2. Start MongoDB service: `mongod`
3. The application will automatically create necessary collections

**Option 2: MongoDB Atlas (Cloud)**
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in `.env`

#### 5. Access the Application

Open your browser and navigate to:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

### 📧 Email Configuration Setup

For OTP verification to work, you need to configure email settings:

1. **Gmail Setup** (Recommended):
   - Enable 2-factor authentication on your Gmail account
   - Generate an app-specific password
   - Use the app password in `EMAIL_PASS` environment variable

2. **Other SMTP Providers**:
   - Update `EMAIL_HOST`, `EMAIL_PORT`, and credentials accordingly
   - Ensure SMTP settings match your provider's requirements

## 🎮 Demo & Testing

### Test Accounts

Use these pre-configured accounts for testing:

**Demo User Account:**
- Email: `demo@inventory.com`
- Password: `demo12345`
- Access: Standard user with limited sample data

### Sample Data

The system includes comprehensive sample data:
- **Electronics**: Laptops, phones, tablets with realistic pricing
- **Groceries**: Food items with expiry date tracking
- **Clothing**: Apparel with size and color variations
- **Sample Invoices**: Pre-generated invoices with different statuses
- **Purchase History**: Transaction records for analytics testing
k status calculations

## 📋 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `POST` | `/api/auth/register` | User registration with email verification | None |
| `POST` | `/api/auth/login` | User login with JWT token generation | None |
| `POST` | `/api/auth/logout` | Secure user logout with token invalidation | Required |
| `POST` | `/api/auth/forgot-password` | Password reset request with OTP email | None |
| `POST` | `/api/auth/verify-otp` | OTP verification for password reset | None |
| `POST` | `/api/auth/reset-password` | Password reset after OTP verification | None |

### Product Management Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `GET` | `/api/products` | Get paginated product list with search | Required |
| `POST` | `/api/products` | Add new product with image upload | Required |
| `PUT` | `/api/products/:id` | Update existing product details | Required |
| `DELETE` | `/api/products/:id` | Delete product from inventory | Required |
| `POST` | `/api/products/bulk` | Bulk product upload via CSV | Required |
| `POST` | `/api/products/buy` | Purchase product and update inventory | Required |
| `GET` | `/api/products/summary` | Get inventory summary statistics | Required |
| `GET` | `/api/products/check-id/:productId` | Check product ID uniqueness | Required |

### Invoice Management Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `GET` | `/api/invoices` | Get paginated invoice list | Required |
| `GET` | `/api/invoices/:id` | Get specific invoice details | Required |
| `PUT` | `/api/invoices/:id` | Update invoice status or details | Required |
| `DELETE` | `/api/invoices/:id` | Delete invoice record | Required |
| `GET` | `/api/invoices/summary` | Get invoice summary statistics | Required |

### Statistics & Analytics Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `GET` | `/api/statistics` | Get comprehensive business analytics | Required |
| `GET` | `/api/statistics/weekly` | Get weekly sales and purchase data | Required |
| `GET` | `/api/statistics/yearly` | Get yearly business performance data | Required |
| `GET` | `/api/statistics/user/layout` | Get user's saved dashboard layout | Required |
| `PUT` | `/api/statistics/user/layout` | Update user's dashboard layout preferences | Required |

### User Profile Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| `GET` | `/api/profile` | Get user profile information | Required |
| `PUT` | `/api/profile` | Update user profile details | Required |
| `PUT` | `/api/profile/password` | Change user password | Required |