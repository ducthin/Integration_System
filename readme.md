# HR Payroll Dashboard

A web-based dashboard application for managing HR and Payroll systems.

## Features

- User-friendly web interface
- RESTful API backend using Express.js
- MySQL database integration with MySQL Workbench support
- Secure environment configuration
- Cross-Origin Resource Sharing (CORS) support

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MySQL Server
- MySQL Workbench
- Git

## Database Setup

1. Open MySQL Workbench and connect to your MySQL Server
2. Create two databases:
```sql
CREATE DATABASE hr_system;
CREATE DATABASE payroll_system;
```

3. Configure your database connection in MySQL Workbench:
   - Host: localhost
   - Port: 3306
   - Username: root (or your custom username)
   - Password: your_password

4. You can manage and monitor the databases using MySQL Workbench features:
   - Database administration
   - SQL development
   - Data modeling
   - Server monitoring
   - User management

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd hr-payroll-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
HR_DB_NAME=hr_system
PAYROLL_DB_NAME=payroll_system
PORT=3000
```

## Running the Application

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon, which automatically restarts when files change.

### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:3000` (or your configured PORT).

## Project Structure

```
hr-payroll-dashboard/
├── public/              # Static files
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Stylesheet
│   └── script.js       # Frontend JavaScript
├── server.js           # Express server setup
├── package.json        # Project dependencies
└── .env               # Environment variables (create this)
```

## Database Schema

### HR System Database (hr_system)
Contains tables related to employee management, including:
- Employee information
- Departments
- Positions
- Leave records
- Performance reviews

### Payroll System Database (payroll_system)
Contains tables related to payroll processing, including:
- Salary information
- Allowances
- Deductions
- Payment records
- Tax calculations

You can view and manage these schemas using MySQL Workbench's schema designer.

## API Documentation

The backend provides RESTful API endpoints for the following operations:
- User authentication
- Employee management
- Payroll processing
- Report generation

(Note: Detailed API documentation to be added)

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.