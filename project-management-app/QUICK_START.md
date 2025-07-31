# Quick Start Guide

Get the Project Management System up and running in just a few minutes!

## 🚀 Instant Setup (Recommended)

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)

### Step 1: Run the automatic setup
```bash
cd project-management-app
./start.sh
```

The script will:
- Check prerequisites
- Setup database
- Install dependencies
- Start backend and frontend
- Open the application automatically

### Step 2: Access the application
Open your browser and go to: **http://localhost:3000**

## 🐳 Docker Setup (Alternative)

If you prefer Docker:

```bash
cd project-management-app
docker-compose up -d
```

Access at: **http://localhost:3000**

## 📱 What You Can Do

1. **View Projects**: See all projects in a beautiful table
2. **Create Project**: Click "Create Project" and fill the form
3. **Edit Project**: Click the edit icon on any project
4. **Delete Project**: Click the delete icon to remove a project
5. **Search**: Use the search bar to find specific projects

## 🎯 Test Data

The application comes with sample projects to help you get started. You can:
- Modify existing projects
- Add your own projects
- Delete sample projects

## 🔧 Manual Setup (If Automatic Setup Fails)

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup (New Terminal)
```bash
cd frontend  
npm install
npm start
```

### Database Setup
```bash
mysql -u root -p < database/schema.sql
```

## 📞 Support

If you encounter any issues:
1. Check the main README.md for detailed troubleshooting
2. Ensure MySQL is running
3. Verify ports 3000 and 3001 are available
4. Check that Node.js and npm are properly installed

## 🎉 You're Ready!

The Project Management System is now running with:
- ✅ Full CRUD operations
- ✅ Beautiful modern UI
- ✅ Search functionality
- ✅ All database fields supported
- ✅ Responsive design