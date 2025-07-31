# Project Management System

A full-stack web application for managing projects with comprehensive tracking, analytics, and CRUD operations.

## 🚀 Features

- **Complete CRUD Operations**: Create, Read, Update, Delete projects
- **Beautiful Modern UI**: Professional interface with glassmorphism design
- **Comprehensive Project Tracking**: All fields from the database schema
- **Search & Filter**: Real-time search functionality
- **Responsive Design**: Works on desktop, tablet, and mobile
- **MySQL Database**: Robust data storage with proper relationships
- **RESTful API**: Clean API architecture with proper error handling
- **Form Validation**: Client and server-side validation
- **Toast Notifications**: User-friendly feedback messages

## 🛠 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **mysql2** - MySQL driver for Node.js
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React** - Frontend framework
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **date-fns** - Date formatting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MySQL** (v5.7 or higher)

## 🔧 Installation & Setup

### 1. Clone or Download the Project

```bash
# If you have the project files, navigate to the project directory
cd project-management-app
```

### 2. Database Setup

1. **Start MySQL server**
2. **Create the database and table**:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   
   Or manually run the SQL commands in `database/schema.sql` in your MySQL client.

### 3. Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   
   Edit the `.env` file and update with your MySQL credentials:
   ```env
   PORT=3001
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=project_management
   DB_PORT=3306
   ```

4. **Start the backend server**:
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Or production mode
   npm start
   ```

   The backend will start on `http://localhost:3001`

### 4. Frontend Setup

1. **Open a new terminal and navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the frontend development server**:
   ```bash
   npm start
   ```

   The frontend will start on `http://localhost:3000`

## 🎯 Usage

### Accessing the Application

1. Open your browser and go to `http://localhost:3000`
2. You'll see the Project Management System interface

### Key Functionalities

#### **View Projects**
- See all projects in a responsive table
- Search projects by name, leader, region, or unit
- View project status with color-coded badges

#### **Create New Project**
- Click "Create Project" button
- Fill in the comprehensive form with all project details
- Submit to create a new project

#### **Edit Project**
- Click the edit button (pencil icon) on any project
- Modify any project details
- Save changes

#### **Delete Project**
- Click the delete button (trash icon) on any project
- Confirm deletion in the popup

### Form Fields

The project form includes all the database fields organized in sections:

#### **Basic Information**
- Project Name (required)
- Project Leader (required)
- Region (required)
- Unit (required)
- Process
- Current Status
- Project Description

#### **Financial Information**
- CAPEX Needed
- Approved CAPEX Value
- Expected Saving
- Actual Saving

#### **Metrics and Benefits**
- Key Metric
- Secondary Metric
- Expected Benefit

#### **Project Timeline**
- Project Start Date
- Planned Completion Date
- Actual Completion Date
- Upload Date

#### **DMAIC Phase Dates**
- Define Date
- Measure Date
- Analyze Date
- Improve Date
- Control Date

#### **Detailed Information**
- Business Case
- Problem Statement
- Goal Statement
- Team Members
- Status

## 🔌 API Endpoints

The backend provides the following RESTful API endpoints:

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/search?q=term` - Search projects

### Health Check
- `GET /api/health` - API health check

## 🗃 Database Schema

The application uses a single `projects` table with the following structure:

```sql
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  s_project_name VARCHAR(255),
  s_region VARCHAR(100),
  s_unit VARCHAR(100),
  s_project_leader VARCHAR(100),
  s_process VARCHAR(100),
  s_project_description TEXT,
  s_current_status VARCHAR(100),
  s_expected_benefit TEXT,
  s_capex_needed VARCHAR(100),
  s_approved_capex_value VARCHAR(100),
  s_key_metric VARCHAR(100),
  s_secondary_metric VARCHAR(100),
  s_business_case TEXT,
  s_problem_statement TEXT,
  s_goal_statement TEXT,
  s_team_members TEXT,
  d_project_start_date DATE,
  d_planned_completion_date DATE,
  d_actual_completion_date DATE,
  s_expected_saving VARCHAR(100),
  s_actual_saving VARCHAR(100),
  define_date DATE,
  measure_date DATE,
  analyze_date DATE,
  improve_date DATE,
  control_date DATE,
  d_upload_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check credentials in `.env` file
   - Ensure database `project_management` exists

2. **Port Already in Use**
   - Change port in `.env` file for backend
   - Frontend port can be changed in package.json

3. **CORS Errors**
   - Ensure backend is running on port 3001
   - Check proxy setting in frontend package.json

4. **Module Not Found**
   - Run `npm install` in both backend and frontend directories
   - Delete `node_modules` and reinstall if necessary

### Development Tips

- Use `npm run dev` for backend to auto-restart on changes
- Frontend hot-reloads automatically during development
- Check browser console for any frontend errors
- Check terminal for backend server logs

## 🎨 UI Features

- **Modern Design**: Glassmorphism effects with beautiful gradients
- **Responsive Layout**: Works on all device sizes
- **Interactive Elements**: Hover effects and smooth transitions
- **Professional Color Scheme**: Purple gradient theme
- **Intuitive Navigation**: Clear button states and navigation
- **Form Validation**: Real-time validation with error messages
- **Loading States**: Spinners and loading indicators
- **Toast Notifications**: Success and error messages

## 🔮 Future Enhancements

Potential improvements for the application:
- User authentication and authorization
- File upload capabilities
- Advanced reporting and analytics
- Email notifications
- Project templates
- Dashboard with charts and metrics
- Export to PDF/Excel functionality
- Audit trail and version history

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Support

If you encounter any issues or need help with setup, please check the troubleshooting section above or create an issue in the project repository.