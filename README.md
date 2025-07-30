# NPD Tracking System with MySQL Backend

A comprehensive New Product Development (NPD) tracking system built with Node.js, Express, MySQL, and jQuery. This system allows teams to track projects through the DMAIC methodology with full CRUD functionality.

## Features

- ✅ **Full CRUD Operations**: Create, Read, Update, Delete projects
- ✅ **MySQL Database Integration**: Persistent data storage with relational database
- ✅ **REST API**: Complete RESTful API for all operations
- ✅ **Search & Filter**: Real-time search across all project fields
- ✅ **DMAIC Milestone Tracking**: Define, Measure, Analyze, Improve, Control phases
- ✅ **Regional Management**: Multi-region support (AMESA, AMERICAS, EU, EAP)
- ✅ **Data Validation**: Both frontend and backend validation
- ✅ **Responsive Design**: Works on desktop and mobile devices
- ✅ **Error Handling**: Comprehensive error handling and user feedback

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **mysql2** - MySQL client for Node.js

### Frontend
- **jQuery** - JavaScript library
- **DataTables** - Table enhancement
- **Bootstrap** - CSS framework
- **HTML5/CSS3** - Modern web standards

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **MySQL** (v8.0 or higher)
- **npm** (comes with Node.js)

## Installation & Setup

### 1. Clone/Download the Project

```bash
# If using git
git clone <repository-url>
cd npd-tracking-system

# Or download and extract the project files
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: MySQL Command Line
```bash
# Connect to MySQL
mysql -u root -p

# Create database and tables
source database/schema.sql

# Or run the SQL manually
mysql -u root -p < database/schema.sql
```

#### Option B: MySQL Workbench
1. Open MySQL Workbench
2. Connect to your MySQL instance
3. Open and execute `database/schema.sql`

### 4. Environment Configuration

Update the `.env` file with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=npd_tracking

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 5. Start the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 6. Access the Application

Open your browser and navigate to:
- **Application**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health

## API Endpoints

### Projects API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects (with pagination) |
| GET | `/api/projects/:id` | Get specific project |
| POST | `/api/projects` | Create new project |
| PUT | `/api/projects/:id` | Update existing project |
| DELETE | `/api/projects/:id` | Delete project |

### Query Parameters for GET `/api/projects`
- `search` - Search across project fields
- `region` - Filter by region (AMESA, AMERICAS, EU, EAP)
- `status` - Filter by status (Initiated, In Progress, Complete, etc.)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Units API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/units` | Get all units |
| GET | `/api/units/by-region/:region` | Get units by region |
| GET | `/api/units/regions` | Get all available regions |

## Database Schema

### Projects Table
- **id**: Primary key (NPD-XXX format)
- **project_name**: Project name
- **region**: ENUM (AMESA, AMERICAS, EU, EAP)
- **unit**: Unit/location code
- **project_leader**: Project leader name
- **process**: Business process
- **project_description**: Detailed description
- **current_status**: Project status
- **expected_benefit**: Expected benefits
- **capex_needed**: Capital expenditure needed
- **approved_capex_value**: Approved CAPEX value
- **key_metric**: Primary metric
- **business_case**: Business justification
- **project_start_date**: Start date
- **planned_completion_date**: Planned end date
- **created_date**: Record creation timestamp
- **last_updated**: Last update timestamp

### Project Milestones Table
- **id**: Auto-increment primary key
- **project_id**: Foreign key to projects
- **define_date**: Define phase completion
- **measure_date**: Measure phase completion
- **analyze_date**: Analyze phase completion
- **improve_date**: Improve phase completion
- **control_date**: Control phase completion

### Units Table
- **id**: Auto-increment primary key
- **region**: Region code
- **unit_code**: Unit identifier
- **unit_name**: Unit display name

## Usage Guide

### Creating a New Project

1. Click the **"Add Project"** button
2. Fill in the required fields:
   - Project name
   - Region (triggers unit dropdown)
   - Unit/location
   - Project leader
   - Process
   - Project description
   - Start date
   - Planned completion date
3. Optionally fill in additional fields and milestones
4. Click **"Save"** to create the project

### Editing a Project

1. Click the edit icon (pencil) next to any project in the table
2. Modify the desired fields
3. Click **"Update"** to save changes

### Searching and Filtering

- Use the search box to find projects by any text field
- Search works across all project data including descriptions, names, leaders, etc.
- Results update in real-time as you type

### DMAIC Milestone Tracking

Projects can be tracked through the Define-Measure-Analyze-Improve-Control methodology:
- Set dates for each phase completion
- The current stage is automatically calculated and displayed
- Milestones help track project progress

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify MySQL is running
   - Check credentials in `.env` file
   - Ensure database exists

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill process using port 3000: `lsof -ti:3000 | xargs kill -9`

3. **Module Not Found Errors**
   - Run `npm install` to install dependencies
   - Clear npm cache: `npm cache clean --force`

### Logs and Debugging

- Check console output for server logs
- Enable debug mode by setting `NODE_ENV=development`
- Check browser developer tools for frontend errors

## Development

### Project Structure

```
npd-tracking-system/
├── config/
│   └── database.js          # Database connection
├── database/
│   └── schema.sql           # Database schema
├── public/
│   └── js/
│       └── NEW_Req.js       # Frontend JavaScript
├── routes/
│   ├── projects.js          # Project API routes
│   └── units.js             # Units API routes
├── .env                     # Environment configuration
├── package.json             # Dependencies
├── server.js                # Main server file
└── README.md                # This file
```

### Adding New Features

1. **Backend**: Add routes in `routes/` directory
2. **Frontend**: Update `public/js/NEW_Req.js`
3. **Database**: Update schema in `database/schema.sql`

## Security Considerations

- Input validation on both frontend and backend
- SQL injection prevention using parameterized queries
- CORS protection enabled
- Helmet.js for security headers
- Environment variables for sensitive data

## Performance Optimization

- Connection pooling for database
- Indexed database columns for fast queries
- Pagination for large datasets
- Compressed responses
- Efficient SQL queries with joins

## License

This project is licensed under the MIT License.

## Support

For support, please check the troubleshooting section above or review the application logs for specific error messages.