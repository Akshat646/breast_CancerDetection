import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, Eye } from 'lucide-react';
import { projectApi } from '../api/projectApi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ProjectList = ({ onEdit, onCreateNew }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project =>
        project.s_project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.s_project_leader?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.s_region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.s_unit?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  }, [projects, searchTerm]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectApi.getAllProjects();
      if (response.success) {
        setProjects(response.data);
      } else {
        toast.error('Failed to fetch projects');
      }
    } catch (error) {
      toast.error('Error fetching projects: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, projectName) => {
    if (window.confirm(`Are you sure you want to delete "${projectName}"?`)) {
      try {
        const response = await projectApi.deleteProject(id);
        if (response.success) {
          toast.success('Project deleted successfully');
          fetchProjects(); // Refresh the list
        } else {
          toast.error('Failed to delete project');
        }
      } catch (error) {
        toast.error('Error deleting project: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = status?.toLowerCase().replace(/\s+/g, '-') || 'active';
    return (
      <span className={`status-badge status-${statusClass}`}>
        {status || 'Active'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Project Portfolio</h2>
        <button onClick={onCreateNew} className="button button-primary">
          <Plus size={20} />
          New Project
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search projects by name, leader, region, or unit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <Search className="search-icon" size={20} />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          {projects.length === 0 ? (
            <>
              <h3>No Projects Yet</h3>
              <p>Start by creating your first project to get organized!</p>
              <button onClick={onCreateNew} className="button button-primary">
                <Plus size={20} />
                Create First Project
              </button>
            </>
          ) : (
            <>
              <h3>No Results Found</h3>
              <p>Try adjusting your search criteria</p>
            </>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Leader</th>
                <th>Region</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>Completion Date</th>
                <th>Expected Saving</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <strong>{project.s_project_name || 'Untitled Project'}</strong>
                    <br />
                    <small style={{ color: '#718096' }}>
                      {project.s_process || 'No process defined'}
                    </small>
                  </td>
                  <td>{project.s_project_leader || '-'}</td>
                  <td>{project.s_region || '-'}</td>
                  <td>{project.s_unit || '-'}</td>
                  <td>{getStatusBadge(project.s_current_status)}</td>
                  <td>{formatDate(project.d_project_start_date)}</td>
                  <td>{formatDate(project.d_planned_completion_date)}</td>
                  <td>
                    {project.s_expected_saving ? `$${project.s_expected_saving}` : '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => onEdit(project)}
                        className="button button-secondary button-small"
                        title="Edit Project"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id, project.s_project_name)}
                        className="button button-danger button-small"
                        title="Delete Project"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#718096' }}>
        <p>Showing {filteredProjects.length} of {projects.length} projects</p>
      </div>
    </div>
  );
};

export default ProjectList;