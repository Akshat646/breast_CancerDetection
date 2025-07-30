# NPD Tracking System

A comprehensive New Product Development (NPD) tracking system built with Node.js, Express, MySQL, and jQuery. This system allows you to manage and track NPD projects with full CRUD operations, search functionality, and DMAIC milestone tracking.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete) for NPD projects
- ✅ MySQL database integration with proper schema
- ✅ Real-time search functionality
- ✅ Pagination support
- ✅ DMAIC milestone tracking (Define, Measure, Analyze, Improve, Control)
- ✅ Regional unit management
- ✅ Form validation
- ✅ Responsive data tables
- ✅ Project status tracking
- ✅ Financial tracking (CAPEX, savings)

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MySQL Server** (v5.7 or higher)
- **npm** (comes with Node.js)

## Database Setup

1. **Install MySQL** if you haven't already
2. **Start MySQL service**
3. **Create a MySQL user** (or use existing root user)

The application will automatically:
- Create the database `npd_tracking` if it doesn't exist
- Create the required tables (`projects` and `milestones`)
- Insert sample data for testing

### Database Configuration

The application uses the following MySQL connection settings (configured in `database.js`):
- **Host:** localhost
- **User:** root
- **Password:** Akshat04sin@
- **Database:** npd_tracking

## Installation & Setup

1. **Clone or download the project files**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Ensure MySQL is running** and accessible with the configured credentials

4. **Start the application:**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Access the application:**
   Open your browser and go to: `http://localhost:3000`

## File Structure

```
npd-tracking-system/
├── package.json          # Dependencies and scripts
├── server.js             # Express server and API routes
├── database.js           # MySQL connection and database setup
├── public/
│   └── js/
│       └── NEW_Req.js    # Frontend JavaScript with MySQL integration
└── README.md             # This file
```

## API Endpoints

The application provides the following REST API endpoints:

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get a specific project
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update an existing project
- `DELETE /api/projects/:id` - Delete a project
- `GET /api/projects/search/:term` - Search projects

## Database Schema

### Projects Table
```sql
CREATE TABLE projects (
    id VARCHAR(20) PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    region VARCHAR(50),
    unit VARCHAR(100),
    project_leader VARCHAR(100),
    process VARCHAR(100),
    project_description TEXT,
    current_status VARCHAR(50),
    expected_benefit TEXT,
    capex_needed DECIMAL(15,2),
    approved_capex_value DECIMAL(15,2),
    key_metric VARCHAR(255),
    secondary_metric VARCHAR(255),
    business_case TEXT,
    problem_statement TEXT,
    goal_statement TEXT,
    team_members TEXT,
    project_start_date DATE,
    planned_completion_date DATE,
    actual_completion_date DATE,
    expected_saving DECIMAL(15,2),
    actual_saving DECIMAL(15,2),
    upload_date DATE,
    created_date DATE,
    last_updated DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Milestones Table
```sql
CREATE TABLE milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(20),
    define_date DATE,
    measure_date DATE,
    analyze_date DATE,
    improve_date DATE,
    control_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

## Usage

### Adding a New Project
1. Click the "Add Project" button
2. Fill in the required fields (marked with validation)
3. Select a region to populate available units
4. Add milestone dates as needed
5. Click "Save" to create the project

### Editing a Project
1. Click the edit (pencil) icon next to any project in the table
2. Modify the fields as needed
3. Click "Update" to save changes

### Searching Projects
- Use the search box to filter projects in real-time
- Search works across all project fields including name, region, leader, etc.

### Viewing Project Details
- Click on any project ID to view project details

## Sample Data

The application comes with 3 sample projects:
- NPD-001: Tube Sealing Improvement (EU region)
- NPD-002: Filling Process Automation (AMESA region)
- NPD-003: Digital Printing Upgrade (AMERICAS region)

## Regional Units

The system supports the following regions and their units:

- **AMESA**: India (Mumbai/Delhi), UAE (Dubai), South Africa (Johannesburg)
- **AMERICAS**: USA (Chicago/New York), Brazil (São Paulo), Mexico (Mexico City)
- **EU**: Germany (Berlin), UK (London), France (Paris), Italy (Milan)
- **EAP**: China (Shanghai), Japan (Tokyo), South Korea (Seoul), Australia (Sydney)

## Troubleshooting

### MySQL Connection Issues
1. Verify MySQL is running: `sudo service mysql status` (Linux) or check Services (Windows)
2. Check if the password is correct: `Akshat04sin@`
3. Ensure the MySQL user has necessary privileges

### Port Already in Use
If port 3000 is already in use, you can change it by setting the PORT environment variable:
```bash
PORT=3001 npm start
```

### Dependencies Issues
If you encounter issues with dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Development

For development, use:
```bash
npm run dev
```

This starts the server with nodemon, which automatically restarts the server when files change.

## License

This project is licensed under the ISC License.

## Support

For issues or questions, please check the troubleshooting section above or review the code comments in the source files.