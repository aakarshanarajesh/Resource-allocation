# Resource Allocation System - Frontend

A React-based frontend for the Resource Allocation System with authentication, user dashboard, and admin dashboard.

## Features

- **Login Page**: User authentication
- **Register Page**: User registration
- **User Dashboard**: Browse available resources and submit allocation requests
- **Admin Dashboard**: Manage resources, approve/reject requests

## Installation

1. Navigate to the frontend folder:
```bash
cd fsd-frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
src/
├── pages/           # Page components (Login, Register, Dashboards)
├── components/      # Reusable components (Navbar)
├── services/        # API integration (api.js)
├── styles/          # CSS styles
├── App.js           # Main app with routing
└── index.js         # Entry point
```

## Backend Integration

Make sure the backend server is running on `http://localhost:5000` for API calls to work.

## Default Flow

1. User registers → Login → User Dashboard (OR)
2. Admin logs in → Admin Dashboard
