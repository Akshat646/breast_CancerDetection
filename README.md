# NPD Tracking System Backend

A comprehensive backend system for tracking New Product Development (NPD) projects with MySQL database integration.

## Features

- ✅ **Complete CRUD Operations** for NPD projects
- ✅ **MySQL Database** with proper schema and relationships
- ✅ **File Upload Support** for project attachments
- ✅ **Search and Pagination** functionality
- ✅ **Regional Unit Management** (AMESA, AMERICAS, EU, EAP)
- ✅ **Milestone Tracking** (DMAIC methodology)
- ✅ **RESTful API** with proper error handling
- ✅ **Security Features** (CORS, Rate limiting, Helmet)

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MySQL with mysql2 driver
- **File Handling**: Multer for uploads
- **Security**: Helmet, CORS, Rate limiting
- **Environment**: dotenv for configuration

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## Installation

### 1. Clone and Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 2. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE npd_tracking;
```

2. Update the `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=npd_tracking
DB_PORT=3306
```

3. Run the database schema:
```bash
mysql -u your_username -p npd_tracking < database/schema.sql
```

### 3. Environment Configuration

Update `.env` file:
```env
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=npd_tracking
DB_PORT=3306

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects with pagination & search |
| GET | `/api/projects/:id` | Get project by ID |
| POST | `/api/projects` | Create new project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/projects/units/:region` | Get units by region |

### File Attachments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/:id/upload` | Upload files for project |
| GET | `/api/projects/:id/attachments` | Get project attachments |
| GET | `/api/attachments/:id/download` | Download attachment |
| DELETE | `/api/attachments/:id` | Delete attachment |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

## API Usage Examples

### Create Project
```javascript
POST /api/projects
Content-Type: application/json

{
  "s_project_name": "New Efficiency Project",
  "s_region": "EU",
  "s_unit": "Berlin Plant",
  "s_project_leader": "John Doe",
  "s_process": "Manufacturing",
  "s_project_description": "Improve production efficiency",
  "s_current_status": "Initiated",
  "s_expected_benefit": "Cost Reduction",
  "s_capex_needed": 50000,
  "s_approved_capex_value": 45000,
  "s_key_metric": "Efficiency Rate (%)",
  "d_project_start_date": "2024-01-15",
  "d_planned_completion_date": "2024-12-31",
  "milestone": {
    "define": "2024-01-15",
    "measure": "2024-03-01",
    "analyze": "2024-06-01"
  }
}
```

### Search Projects
```javascript
GET /api/projects?page=1&limit=10&search=efficiency
```

### Upload Files
```javascript
POST /api/projects/1/upload
Content-Type: multipart/form-data

s_attachment: [file1, file2, ...]
```

## Database Schema

### Projects Table
- Primary project information
- Regional and unit data
- Financial information (CAPEX, savings)
- Timeline data
- Project metrics and descriptions

### Milestones Table
- DMAIC milestone tracking
- Define, Measure, Analyze, Improve, Control stages
- Date tracking for each milestone

### Attachments Table
- File upload information
- Links to projects
- File metadata and paths

### Work Trail Table
- Audit logging
- Change tracking
- User actions history

## Frontend Integration

The system includes a complete frontend integration with:

- **Dynamic project loading** from API
- **Real-time search** with debouncing
- **Pagination** with page controls
- **Form handling** for create/edit operations
- **File upload** support
- **Regional unit selection**

### Frontend Files
- `index.html` - Main HTML structure
- `NEW_Req.js` - Frontend JavaScript with API integration

## File Upload

- **Supported formats**: Images (jpg, png, gif), Documents (pdf, doc, docx, xls, xlsx), Text files
- **Size limit**: 10MB per file (configurable)
- **Storage**: Local filesystem with database metadata
- **Security**: File type validation and secure naming

## Security Features

- **CORS** protection with configurable origins
- **Rate limiting** (100 requests per 15 minutes per IP)
- **Helmet** for security headers
- **File upload** validation and size limits
- **SQL injection** protection with parameterized queries

## Error Handling

- Comprehensive error handling throughout the application
- Graceful database connection failure handling
- File upload error management
- Detailed error logging for debugging

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 3000 |
| DB_HOST | MySQL host | localhost |
| DB_USER | MySQL username | root |
| DB_PASSWORD | MySQL password | - |
| DB_NAME | Database name | npd_tracking |
| DB_PORT | MySQL port | 3306 |
| UPLOAD_DIR | Upload directory | uploads |
| MAX_FILE_SIZE | Max file size in bytes | 10485760 |

## Development Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Install dependencies
npm install
```

## Troubleshooting

### Database Connection Issues
1. Verify MySQL is running
2. Check database credentials in `.env`
3. Ensure database exists
4. Verify user permissions

### File Upload Issues
1. Check `uploads/` directory permissions
2. Verify file size limits
3. Check file type restrictions

### CORS Issues
1. Update allowed origins in `server.js`
2. Check frontend URL matches CORS settings

## Production Deployment

1. Set `NODE_ENV=production`
2. Update database credentials
3. Configure proper CORS origins
4. Set up process manager (PM2)
5. Configure reverse proxy (nginx)
6. Set up SSL certificates

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - see LICENSE file for details