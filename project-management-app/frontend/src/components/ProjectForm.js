import React, { useState, useEffect } from 'react';
import { Save, X, ArrowLeft } from 'lucide-react';
import { projectApi } from '../api/projectApi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ProjectForm = ({ project, onComplete, onCancel }) => {
  const [formData, setFormData] = useState({
    s_project_name: '',
    s_region: '',
    s_unit: '',
    s_project_leader: '',
    s_process: '',
    s_project_description: '',
    s_current_status: 'Planning',
    s_expected_benefit: '',
    s_capex_needed: '',
    s_approved_capex_value: '',
    s_key_metric: '',
    s_secondary_metric: '',
    s_business_case: '',
    s_problem_statement: '',
    s_goal_statement: '',
    s_team_members: '',
    d_project_start_date: '',
    d_planned_completion_date: '',
    d_actual_completion_date: '',
    s_expected_saving: '',
    s_actual_saving: '',
    define_date: '',
    measure_date: '',
    analyze_date: '',
    improve_date: '',
    control_date: '',
    d_upload_date: '',
    status: 'Active'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      // Convert dates to YYYY-MM-DD format for input fields
      const convertDate = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return format(date, 'yyyy-MM-dd');
        } catch {
          return '';
        }
      };

      setFormData({
        s_project_name: project.s_project_name || '',
        s_region: project.s_region || '',
        s_unit: project.s_unit || '',
        s_project_leader: project.s_project_leader || '',
        s_process: project.s_process || '',
        s_project_description: project.s_project_description || '',
        s_current_status: project.s_current_status || 'Planning',
        s_expected_benefit: project.s_expected_benefit || '',
        s_capex_needed: project.s_capex_needed || '',
        s_approved_capex_value: project.s_approved_capex_value || '',
        s_key_metric: project.s_key_metric || '',
        s_secondary_metric: project.s_secondary_metric || '',
        s_business_case: project.s_business_case || '',
        s_problem_statement: project.s_problem_statement || '',
        s_goal_statement: project.s_goal_statement || '',
        s_team_members: project.s_team_members || '',
        d_project_start_date: convertDate(project.d_project_start_date),
        d_planned_completion_date: convertDate(project.d_planned_completion_date),
        d_actual_completion_date: convertDate(project.d_actual_completion_date),
        s_expected_saving: project.s_expected_saving || '',
        s_actual_saving: project.s_actual_saving || '',
        define_date: convertDate(project.define_date),
        measure_date: convertDate(project.measure_date),
        analyze_date: convertDate(project.analyze_date),
        improve_date: convertDate(project.improve_date),
        control_date: convertDate(project.control_date),
        d_upload_date: convertDate(project.d_upload_date),
        status: project.status || 'Active'
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.s_project_name.trim()) {
      newErrors.s_project_name = 'Project name is required';
    }
    
    if (!formData.s_project_leader.trim()) {
      newErrors.s_project_leader = 'Project leader is required';
    }

    if (!formData.s_region.trim()) {
      newErrors.s_region = 'Region is required';
    }

    if (!formData.s_unit.trim()) {
      newErrors.s_unit = 'Unit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Convert empty strings to null for dates
      const dataToSubmit = { ...formData };
      Object.keys(dataToSubmit).forEach(key => {
        if (key.includes('date') && dataToSubmit[key] === '') {
          dataToSubmit[key] = null;
        }
      });

      let response;
      if (project) {
        response = await projectApi.updateProject(project.id, dataToSubmit);
        toast.success('Project updated successfully!');
      } else {
        response = await projectApi.createProject(dataToSubmit);
        toast.success('Project created successfully!');
      }
      
      if (response.success) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Error saving project: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    'Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'
  ];

  const processOptions = [
    'Lean Six Sigma', 'DMAIC', 'Kaizen', 'Agile', 'Waterfall', 'Scrum', 'Other'
  ];

  const regionOptions = [
    'North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'
  ];

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>{project ? 'Edit Project' : 'Create New Project'}</h2>
        <button onClick={onCancel} className="button button-secondary">
          <ArrowLeft size={20} />
          Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <h3 style={{ marginBottom: '20px', color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
          Basic Information
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="s_project_name">Project Name *</label>
            <input
              type="text"
              id="s_project_name"
              name="s_project_name"
              value={formData.s_project_name}
              onChange={handleChange}
              style={{ borderColor: errors.s_project_name ? '#fc8181' : undefined }}
              placeholder="Enter project name"
            />
            {errors.s_project_name && <span style={{ color: '#fc8181', fontSize: '14px' }}>{errors.s_project_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="s_project_leader">Project Leader *</label>
            <input
              type="text"
              id="s_project_leader"
              name="s_project_leader"
              value={formData.s_project_leader}
              onChange={handleChange}
              style={{ borderColor: errors.s_project_leader ? '#fc8181' : undefined }}
              placeholder="Enter project leader name"
            />
            {errors.s_project_leader && <span style={{ color: '#fc8181', fontSize: '14px' }}>{errors.s_project_leader}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="s_region">Region *</label>
            <select
              id="s_region"
              name="s_region"
              value={formData.s_region}
              onChange={handleChange}
              style={{ borderColor: errors.s_region ? '#fc8181' : undefined }}
            >
              <option value="">Select Region</option>
              {regionOptions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            {errors.s_region && <span style={{ color: '#fc8181', fontSize: '14px' }}>{errors.s_region}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="s_unit">Unit *</label>
            <input
              type="text"
              id="s_unit"
              name="s_unit"
              value={formData.s_unit}
              onChange={handleChange}
              style={{ borderColor: errors.s_unit ? '#fc8181' : undefined }}
              placeholder="e.g., Manufacturing, Quality Assurance"
            />
            {errors.s_unit && <span style={{ color: '#fc8181', fontSize: '14px' }}>{errors.s_unit}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="s_process">Process</label>
            <select
              id="s_process"
              name="s_process"
              value={formData.s_process}
              onChange={handleChange}
            >
              <option value="">Select Process</option>
              {processOptions.map(process => (
                <option key={process} value={process}>{process}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="s_current_status">Current Status</label>
            <select
              id="s_current_status"
              name="s_current_status"
              value={formData.s_current_status}
              onChange={handleChange}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="s_project_description">Project Description</label>
            <textarea
              id="s_project_description"
              name="s_project_description"
              value={formData.s_project_description}
              onChange={handleChange}
              placeholder="Describe the project objectives and scope"
              rows="4"
            />
          </div>
        </div>

        {/* Financial Information */}
        <h3 style={{ marginTop: '30px', marginBottom: '20px', color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
          Financial Information
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="s_capex_needed">CAPEX Needed</label>
            <input
              type="text"
              id="s_capex_needed"
              name="s_capex_needed"
              value={formData.s_capex_needed}
              onChange={handleChange}
              placeholder="e.g., 50000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="s_approved_capex_value">Approved CAPEX Value</label>
            <input
              type="text"
              id="s_approved_capex_value"
              name="s_approved_capex_value"
              value={formData.s_approved_capex_value}
              onChange={handleChange}
              placeholder="e.g., 45000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="s_expected_saving">Expected Saving</label>
            <input
              type="text"
              id="s_expected_saving"
              name="s_expected_saving"
              value={formData.s_expected_saving}
              onChange={handleChange}
              placeholder="e.g., 100000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="s_actual_saving">Actual Saving</label>
            <input
              type="text"
              id="s_actual_saving"
              name="s_actual_saving"
              value={formData.s_actual_saving}
              onChange={handleChange}
              placeholder="e.g., 95000"
            />
          </div>
        </div>

        {/* Metrics and Benefits */}
        <h3 style={{ marginTop: '30px', marginBottom: '20px', color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
          Metrics and Benefits
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="s_key_metric">Key Metric</label>
            <input
              type="text"
              id="s_key_metric"
              name="s_key_metric"
              value={formData.s_key_metric}
              onChange={handleChange}
              placeholder="e.g., Production Time, Defect Rate"
            />
          </div>

          <div className="form-group">
            <label htmlFor="s_secondary_metric">Secondary Metric</label>
            <input
              type="text"
              id="s_secondary_metric"
              name="s_secondary_metric"
              value={formData.s_secondary_metric}
              onChange={handleChange}
              placeholder="e.g., Customer Satisfaction, Cost Reduction"
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="s_expected_benefit">Expected Benefit</label>
            <textarea
              id="s_expected_benefit"
              name="s_expected_benefit"
              value={formData.s_expected_benefit}
              onChange={handleChange}
              placeholder="Describe the expected benefits"
              rows="3"
            />
          </div>
        </div>

        {/* Project Dates */}
        <h3 style={{ marginTop: '30px', marginBottom: '20px', color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
          Project Timeline
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="d_project_start_date">Project Start Date</label>
            <input
              type="date"
              id="d_project_start_date"
              name="d_project_start_date"
              value={formData.d_project_start_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="d_planned_completion_date">Planned Completion Date</label>
            <input
              type="date"
              id="d_planned_completion_date"
              name="d_planned_completion_date"
              value={formData.d_planned_completion_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="d_actual_completion_date">Actual Completion Date</label>
            <input
              type="date"
              id="d_actual_completion_date"
              name="d_actual_completion_date"
              value={formData.d_actual_completion_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="d_upload_date">Upload Date</label>
            <input
              type="date"
              id="d_upload_date"
              name="d_upload_date"
              value={formData.d_upload_date}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* DMAIC Dates */}
        <h3 style={{ marginTop: '30px', marginBottom: '20px', color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
          DMAIC Phase Dates
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="define_date">Define Date</label>
            <input
              type="date"
              id="define_date"
              name="define_date"
              value={formData.define_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="measure_date">Measure Date</label>
            <input
              type="date"
              id="measure_date"
              name="measure_date"
              value={formData.measure_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="analyze_date">Analyze Date</label>
            <input
              type="date"
              id="analyze_date"
              name="analyze_date"
              value={formData.analyze_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="improve_date">Improve Date</label>
            <input
              type="date"
              id="improve_date"
              name="improve_date"
              value={formData.improve_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="control_date">Control Date</label>
            <input
              type="date"
              id="control_date"
              name="control_date"
              value={formData.control_date}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Detailed Information */}
        <h3 style={{ marginTop: '30px', marginBottom: '20px', color: '#2d3748', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
          Detailed Information
        </h3>
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="s_business_case">Business Case</label>
            <textarea
              id="s_business_case"
              name="s_business_case"
              value={formData.s_business_case}
              onChange={handleChange}
              placeholder="Describe the business case and justification"
              rows="4"
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="s_problem_statement">Problem Statement</label>
            <textarea
              id="s_problem_statement"
              name="s_problem_statement"
              value={formData.s_problem_statement}
              onChange={handleChange}
              placeholder="Define the problem this project aims to solve"
              rows="4"
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="s_goal_statement">Goal Statement</label>
            <textarea
              id="s_goal_statement"
              name="s_goal_statement"
              value={formData.s_goal_statement}
              onChange={handleChange}
              placeholder="Define the project goals and objectives"
              rows="4"
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="s_team_members">Team Members</label>
            <textarea
              id="s_team_members"
              name="s_team_members"
              value={formData.s_team_members}
              onChange={handleChange}
              placeholder="List team members and their roles"
              rows="3"
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="button button-secondary"
            disabled={loading}
          >
            <X size={20} />
            Cancel
          </button>
          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            <Save size={20} />
            {loading ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;