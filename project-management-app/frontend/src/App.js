import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { FolderPlus, List, BarChart3 } from 'lucide-react';
import ProjectList from './components/ProjectList';
import ProjectForm from './components/ProjectForm';
import Header from './components/Header';

function App() {
  const [currentView, setCurrentView] = useState('list');
  const [editingProject, setEditingProject] = useState(null);

  const handleCreateNew = () => {
    setEditingProject(null);
    setCurrentView('form');
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setCurrentView('form');
  };

  const handleFormComplete = () => {
    setCurrentView('list');
    setEditingProject(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'form':
        return (
          <ProjectForm 
            project={editingProject}
            onComplete={handleFormComplete}
            onCancel={handleFormComplete}
          />
        );
      case 'list':
      default:
        return (
          <ProjectList 
            onEdit={handleEdit}
            onCreateNew={handleCreateNew}
          />
        );
    }
  };

  return (
    <div className="container">
      <Header />
      
      <nav className="nav">
        <button 
          onClick={() => setCurrentView('list')}
          className={`nav-button ${currentView === 'list' ? 'active' : ''}`}
        >
          <List size={20} />
          View Projects
        </button>
        <button 
          onClick={handleCreateNew}
          className={`nav-button ${currentView === 'form' && !editingProject ? 'active' : ''}`}
        >
          <FolderPlus size={20} />
          Create Project
        </button>
      </nav>

      {renderContent()}

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default App;