// NPD Tracking Frontend JavaScript
const API_BASE_URL = 'http://localhost:3000/api';

// Global variables
let currentPage = 1;
let totalPages = 1;
let currentSearch = '';
let currentEditingId = null;

// Initialize application
$(document).ready(function() {
    initializeApp();
});

function initializeApp() {
    loadProjects();
    setupEventHandlers();
    setupDataTable();
}

// Setup event handlers
function setupEventHandlers() {
    // Search functionality
    $('#customSearchBox').on('input', debounce(function() {
        currentSearch = $(this).val();
        currentPage = 1;
        loadProjects();
    }, 300));
    
    // Pagination
    $('#prevPage').click(function() {
        if (currentPage > 1) {
            currentPage--;
            loadProjects();
        }
    });
    
    $('#nextPage').click(function() {
        if (currentPage < totalPages) {
            currentPage++;
            loadProjects();
        }
    });
    
    // Form submission
    $('#npd_form').on('submit', function(e) {
        e.preventDefault();
        if (currentEditingId) {
            updateProject();
        } else {
            createProject();
        }
    });
    
    // Region change handler
    $('#s_region').on('change', function() {
        getcountry(this.value);
    });
}

// Load projects from API
async function loadProjects() {
    try {
        showLoader();
        
        const response = await fetch(`${API_BASE_URL}/projects?page=${currentPage}&limit=10&search=${currentSearch}`);
        const result = await response.json();
        
        if (result.success) {
            populateProjectTable(result.data);
            updatePagination(result.pagination);
        } else {
            showError('Failed to load projects: ' + result.message);
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        showError('Failed to load projects. Please check your connection.');
    } finally {
        hideLoader();
    }
}

// Populate project table
function populateProjectTable(projects) {
    const tbody = $('#tbl_npd tbody');
    tbody.empty();
    
    if (projects.length === 0) {
        tbody.append('<tr><td colspan="17" class="text-center">No projects found</td></tr>');
        return;
    }
    
    projects.forEach(project => {
        const row = createProjectRow(project);
        tbody.append(row);
    });
}

// Create project table row
function createProjectRow(project) {
    const projectId = `NPD-${String(project.n_project_id).padStart(3, '0')}`;
    const milestones = parseMilestones(project.milestones);
    const currentStage = getCurrentStage(milestones);
    
    return `
        <tr onclick="editProject(${project.n_project_id})">
            <td>
                ${projectId}
                <a class="btn btn-sm btn-success" onclick="get_work_trail(${project.n_project_id})" 
                   style="background-color:#33a4f6; margin-left: 10px;" title="Work Trail">
                    <i class="bi bi-pencil-square"></i>
                </a>
            </td>
            <td>${project.s_region || ''}</td>
            <td>${project.s_unit || ''}</td>
            <td>${project.s_process || ''}</td>
            <td>${formatDate(project.d_project_start_date) || ''}</td>
            <td>${formatDate(project.d_planned_completion_date) || ''}</td>
            <td>
                <div class="td-container">
                    ${project.s_project_description || ''}
                </div>
            </td>
            <td>
                <div class="td-container">
                    ${project.s_business_case || ''}
                </div>
            </td>
            <td>${project.s_key_metric || ''}</td>
            <td>${project.s_current_status || ''}</td>
            <td>${project.s_expected_benefit || ''}</td>
            <td>${formatCurrency(project.s_capex_needed) || ''}</td>
            <td>${formatCurrency(project.s_approved_capex_value) || ''}</td>
            <td>${project.s_project_leader || ''}</td>
            <td>${formatDate(project.d_upload_date) || ''}</td>
            <td>${currentStage}</td>
            <td>${formatDate(project.updated_at) || formatDate(project.created_at) || ''}</td>
        </tr>
    `;
}

// Parse milestones from database format
function parseMilestones(milestonesString) {
    if (!milestonesString) return {};
    
    const milestones = {};
    const pairs = milestonesString.split('|');
    
    pairs.forEach(pair => {
        const [type, date] = pair.split(':');
        if (type && date) {
            milestones[type] = date;
        }
    });
    
    return milestones;
}

// Get current stage from milestones
function getCurrentStage(milestones) {
    const stages = ['define', 'measure', 'analyze', 'improve', 'control'];
    let currentStage = 'Not Started';
    
    for (let i = stages.length - 1; i >= 0; i--) {
        if (milestones[stages[i]]) {
            currentStage = stages[i].charAt(0).toUpperCase() + stages[i].slice(1);
            break;
        }
    }
    
    return currentStage;
}

// Update pagination info
function updatePagination(pagination) {
    currentPage = pagination.page;
    totalPages = pagination.totalPages;
    
    $('#pageInfo').text(`${pagination.page} / ${pagination.totalPages}`);
    
    $('#prevPage').prop('disabled', pagination.page <= 1);
    $('#nextPage').prop('disabled', pagination.page >= pagination.totalPages);
}

// Create new project
async function createProject() {
    try {
        const formData = getFormData();
        
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Project created successfully!');
            resetForm();
            loadProjects();
        } else {
            showError('Failed to create project: ' + result.message);
        }
    } catch (error) {
        console.error('Error creating project:', error);
        showError('Failed to create project. Please try again.');
    }
}

// Update existing project
async function updateProject() {
    try {
        const formData = getFormData();
        
        const response = await fetch(`${API_BASE_URL}/projects/${currentEditingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Project updated successfully!');
            resetForm();
            loadProjects();
        } else {
            showError('Failed to update project: ' + result.message);
        }
    } catch (error) {
        console.error('Error updating project:', error);
        showError('Failed to update project. Please try again.');
    }
}

// Edit project
async function editProject(projectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);
        const result = await response.json();
        
        if (result.success) {
            currentEditingId = projectId;
            populateForm(result.data);
            showForm();
            $('#btnSave').hide();
            $('#btnUpdate').show();
        } else {
            showError('Failed to load project details: ' + result.message);
        }
    } catch (error) {
        console.error('Error loading project:', error);
        showError('Failed to load project details.');
    }
}

// Get form data
function getFormData() {
    const formData = {
        s_project_name: $('#s_project_name').val(),
        s_region: $('#s_region').val(),
        s_unit: $('#s_unit').val(),
        s_project_leader: $('#s_project_leader').val(),
        s_process: $('#s_process').val(),
        s_project_description: $('#s_project_desciption').val(),
        s_current_status: $('#s_current_status').val(),
        s_expected_benefit: $('#s_expected_benefit').val(),
        s_capex_needed: parseFloat($('#s_capex_needed').val()) || null,
        s_approved_capex_value: $('#s_approved_capex_value').val(),
        s_key_metric: $('#s_key_metric').val(),
        s_secondary_metric: $('#s_secondary_metric').val(),
        s_business_case: $('#s_business_case').val(),
        s_problem_statement: $('#s_problem_statement').val(),
        s_goal_statement: $('#s_goal_statement').val(),
        s_team_members: $('#s_team_members').val(),
        d_project_start_date: $('#d_project_start_date').val() || null,
        d_planned_completion_date: $('#d_planned_completion_date').val() || null,
        d_actual_completion_date: $('#d_actual_completion_date').val() || null,
        s_expected_saving: parseFloat($('#s_expected_saving').val()) || null,
        s_actual_saving: parseFloat($('#s_actual_saving').val()) || null,
        d_upload_date: $('#d_upload_date').val() || null,
        milestone: {
            define: $('#define_date').val() || null,
            measure: $('#measure_date').val() || null,
            analyze: $('#analyze_date').val() || null,
            improve: $('#improve_date').val() || null,
            control: $('#control_date').val() || null
        }
    };
    
    return formData;
}

// Populate form with project data
function populateForm(project) {
    $('#n_project_id').val(project.n_project_id);
    $('#s_project_name').val(project.s_project_name);
    $('#s_region').val(project.s_region);
    $('#s_unit').val(project.s_unit);
    $('#s_project_leader').val(project.s_project_leader);
    $('#s_process').val(project.s_process);
    $('#s_project_desciption').val(project.s_project_description);
    $('#s_current_status').val(project.s_current_status);
    $('#s_expected_benefit').val(project.s_expected_benefit);
    $('#s_capex_needed').val(project.s_capex_needed);
    $('#s_approved_capex_value').val(project.s_approved_capex_value);
    $('#s_key_metric').val(project.s_key_metric);
    $('#s_secondary_metric').val(project.s_secondary_metric);
    $('#s_business_case').val(project.s_business_case);
    $('#s_problem_statement').val(project.s_problem_statement);
    $('#s_goal_statement').val(project.s_goal_statement);
    $('#s_team_members').val(project.s_team_members);
    $('#d_project_start_date').val(formatDateForInput(project.d_project_start_date));
    $('#d_planned_completion_date').val(formatDateForInput(project.d_planned_completion_date));
    $('#d_actual_completion_date').val(formatDateForInput(project.d_actual_completion_date));
    $('#s_expected_saving').val(project.s_expected_saving);
    $('#s_actual_saving').val(project.s_actual_saving);
    $('#d_upload_date').val(formatDateForInput(project.d_upload_date));
    
    // Populate milestones
    const milestones = parseMilestones(project.milestones);
    $('#define_date').val(formatDateForInput(milestones.define));
    $('#measure_date').val(formatDateForInput(milestones.measure));
    $('#analyze_date').val(formatDateForInput(milestones.analyze));
    $('#improve_date').val(formatDateForInput(milestones.improve));
    $('#control_date').val(formatDateForInput(milestones.control));
    
    // Load units for the selected region
    if (project.s_region) {
        getcountry(project.s_region);
    }
}

// Get countries/units by region
async function getcountry(region) {
    try {
        const response = await fetch(`${API_BASE_URL}/projects/units/${region}`);
        const result = await response.json();
        
        if (result.success) {
            const unitSelect = $('#s_unit');
            unitSelect.empty();
            unitSelect.append('<option value="">Select Unit</option>');
            
            result.data.forEach(unit => {
                unitSelect.append(`<option value="${unit}">${unit}</option>`);
            });
        }
    } catch (error) {
        console.error('Error loading units:', error);
    }
}

// Show/hide form functions
function addproject() {
    resetForm();
    showForm();
    $('#btnSave').show();
    $('#btnUpdate').hide();
}

function showForm() {
    $("#npd-form123").show();
    $("#addbtn").hide();
    $("#search_head_div").hide();
    $("#form_data").hide();
}

function resetForm() {
    $('#npd_form')[0].reset();
    currentEditingId = null;
    $('#n_project_id').val('');
    $("#npd-form123").hide();
    $("#addbtn").show();
    $("#search_head_div").show();
    $("#form_data").show();
}

// Initialize DataTable (keeping for compatibility)
function setupDataTable() {
    // This is kept for compatibility but we're using custom pagination
    if ($.fn.DataTable) {
        $('#tbl_npd').DataTable({
            paging: false,
            searching: false,
            info: false,
            ordering: true
        });
    }
}

// Work trail function (placeholder)
function get_work_trail(projectId) {
    console.log('Getting work trail for project:', projectId);
    // Implement work trail functionality here
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

function formatCurrency(amount) {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function showLoader() {
    $('.load').show();
}

function hideLoader() {
    $('.load').hide();
}

function showSuccess(message) {
    alert('Success: ' + message);
    // You can replace this with a better notification system
}

function showError(message) {
    alert('Error: ' + message);
    // You can replace this with a better notification system
}

// Go back function
function goBack() {
    window.history.back();
}