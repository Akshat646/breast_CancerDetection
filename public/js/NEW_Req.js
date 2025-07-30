// NPD Tracking System - NEW_Req.js
// Comprehensive JavaScript functionality for all buttons and features with MySQL API integration

$(document).ready(function() {
    // Initialize the application
    initializeApp();
    
    // Initialize DataTable
    initializeDataTable();
    
    // Bind event listeners
    bindEventListeners();
    
    // Load initial data
    loadProjectData();
});

// Global variables
let currentProjects = [];
let filteredProjects = [];
let currentPage = 1;
let itemsPerPage = 10;
let editingProject = null;

// API base URL
const API_BASE_URL = '/api';

// Initialize application
function initializeApp() {
    // Hide loader initially
    hideLoader();
    
    // Set current date for upload date
    $('#d_upload_date').val(new Date().toISOString().split('T')[0]);
    
    // Initialize form validation
    initializeFormValidation();
    
    console.log('NPD Tracking System initialized successfully');
}

// Initialize DataTable
function initializeDataTable() {
    if ($.fn.DataTable.isDataTable('#tbl_npd')) {
        $('#tbl_npd').DataTable().destroy();
    }
    
    $('#tbl_npd').DataTable({
        "paging": false,
        "searching": false,
        "info": false,
        "ordering": true,
        "responsive": true,
        "columnDefs": [
            { "orderable": true, "targets": "_all" }
        ]
    });
}

// Bind all event listeners
function bindEventListeners() {
    // Form submission
    $('#npd_form').on('submit', handleFormSubmit);
    
    // Button events
    $('#btnSave').on('click', saveProject);
    $('#btnUpdate').on('click', updateProject);
    
    // Search functionality
    $('#customSearchBox').on('input', handleSearch);
    
    // Pagination
    $('#prevPage').on('click', goToPreviousPage);
    $('#nextPage').on('click', goToNextPage);
    
    // Region change event
    $('#s_region').on('change', function() {
        getcountry(this.value);
    });
    
    // Go back functionality
    window.goBack = function() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/main';
        }
    };
    
    // Table row click events
    $('#tbl_npd tbody').on('click', 'tr', function() {
        const projectId = $(this).find('td:first').text().trim();
        if (projectId && !$(event.target).hasClass('btn')) {
            viewProjectDetails(projectId);
        }
    });
}

// Form validation setup
function initializeFormValidation() {
    $('#npd_form').validate({
        rules: {
            s_project_name: {
                required: true,
                minlength: 3
            },
            s_region: {
                required: true
            },
            s_unit: {
                required: true
            },
            s_project_leader: {
                required: true
            },
            s_process: {
                required: true
            },
            s_project_desciption: {
                required: true,
                minlength: 10
            },
            d_project_start_date: {
                required: true
            },
            d_planned_completion_date: {
                required: true
            }
        },
        messages: {
            s_project_name: {
                required: "Project name is required",
                minlength: "Project name must be at least 3 characters"
            },
            s_region: "Please select a region",
            s_unit: "Please select a unit",
            s_project_leader: "Project leader is required",
            s_process: "Process is required",
            s_project_desciption: {
                required: "Project description is required",
                minlength: "Description must be at least 10 characters"
            },
            d_project_start_date: "Start date is required",
            d_planned_completion_date: "Planned completion date is required"
        },
        submitHandler: function(form) {
            return false; // Prevent actual form submission
        }
    });
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    if ($('#npd_form').valid()) {
        if (editingProject) {
            updateProject();
        } else {
            saveProject();
        }
    }
    
    return false;
}

// Show/Hide loader
function showLoader() {
    $('.load').show();
}

function hideLoader() {
    $('.load').hide();
}

// Get country/unit based on region using API
async function getcountry(region) {
    try {
        const response = await fetch(`${API_BASE_URL}/units/by-region/${region}`);
        const data = await response.json();
        
        const unitSelect = $('#s_unit');
        unitSelect.empty();
        unitSelect.append('<option value="">Select Unit</option>');
        
        if (data.success && data.data) {
            data.data.forEach(function(unit) {
                unitSelect.append(`<option value="${unit.unit_code}">${unit.unit_name}</option>`);
            });
        }
    } catch (error) {
        console.error('Error fetching units:', error);
        showErrorMessage('Failed to load units for the selected region');
    }
}

// Get form data
function getFormData() {
    return {
        projectName: $('#s_project_name').val(),
        region: $('#s_region').val(),
        unit: $('#s_unit').val(),
        projectLeader: $('#s_project_leader').val(),
        process: $('#s_process').val(),
        projectDescription: $('#s_project_desciption').val(),
        currentStatus: $('#s_current_status').val(),
        expectedBenefit: $('#s_expected_benefit').val(),
        capexNeeded: parseFloat($('#s_capex_needed').val()) || null,
        approvedCapexValue: parseFloat($('#s_approved_capex_value').val()) || null,
        keyMetric: $('#s_key_metric').val(),
        secondaryMetric: $('#s_secondary_metric').val(),
        businessCase: $('#s_business_case').val(),
        problemStatement: $('#s_problem_statement').val(),
        goalStatement: $('#s_goal_statement').val(),
        teamMembers: $('#s_team_members').val(),
        projectStartDate: $('#d_project_start_date').val(),
        plannedCompletionDate: $('#d_planned_completion_date').val(),
        actualCompletionDate: $('#d_actual_completion_date').val() || null,
        expectedSaving: parseFloat($('#s_expected_saving').val()) || null,
        actualSaving: parseFloat($('#s_actual_saving').val()) || null,
        uploadDate: $('#d_upload_date').val(),
        milestones: {
            define: $('#define_date').val() || null,
            measure: $('#measure_date').val() || null,
            analyze: $('#analyze_date').val() || null,
            improve: $('#improve_date').val() || null,
            control: $('#control_date').val() || null
        }
    };
}

// Save new project using API
async function saveProject() {
    showLoader();
    
    try {
        const formData = getFormData();
        
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadProjectData(); // Reload data from server
            resetForm();
            showSuccessMessage('Project saved successfully!');
            
            // Hide form and show table
            $("#npd-form123").hide();
            $("#addbtn").show();
            $("#search_head_div").show();
            $("#form_data").show();
        } else {
            showErrorMessage(data.message || 'Failed to save project');
        }
    } catch (error) {
        console.error('Error saving project:', error);
        showErrorMessage('Failed to save project. Please try again.');
    } finally {
        hideLoader();
    }
}

// Update existing project using API
async function updateProject() {
    if (!editingProject) {
        showErrorMessage('No project selected for update');
        return;
    }
    
    showLoader();
    
    try {
        const formData = getFormData();
        
        const response = await fetch(`${API_BASE_URL}/projects/${editingProject.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadProjectData(); // Reload data from server
            resetForm();
            showSuccessMessage('Project updated successfully!');
            editingProject = null;
            
            // Hide form and show table
            $("#npd-form123").hide();
            $("#addbtn").show();
            $("#search_head_div").show();
            $("#form_data").show();
        } else {
            showErrorMessage(data.message || 'Failed to update project');
        }
    } catch (error) {
        console.error('Error updating project:', error);
        showErrorMessage('Failed to update project. Please try again.');
    } finally {
        hideLoader();
    }
}

// Reset form
function resetForm() {
    $('#npd_form')[0].reset();
    $('#npd_form').validate().resetForm();
    $('#n_project_id').val('');
    editingProject = null;
    
    // Reset buttons
    $('#btnSave').show();
    $('#btnUpdate').hide();
    
    // Set current date for upload date
    $('#d_upload_date').val(new Date().toISOString().split('T')[0]);
}

// Load project data from API
async function loadProjectData() {
    showLoader();
    
    try {
        const response = await fetch(`${API_BASE_URL}/projects?limit=1000`);
        const data = await response.json();
        
        if (data.success) {
            currentProjects = data.data.map(project => ({
                id: project.id,
                projectName: project.project_name,
                region: project.region,
                unit: project.unit,
                process: project.process,
                projectStartDate: project.project_start_date,
                plannedCompletionDate: project.planned_completion_date,
                actualCompletionDate: project.actual_completion_date,
                projectDescription: project.project_description,
                businessCase: project.business_case,
                keyMetric: project.key_metric,
                secondaryMetric: project.secondary_metric,
                currentStatus: project.current_status,
                expectedBenefit: project.expected_benefit,
                capexNeeded: project.capex_needed,
                approvedCapexValue: project.approved_capex_value,
                projectLeader: project.project_leader,
                problemStatement: project.problem_statement,
                goalStatement: project.goal_statement,
                teamMembers: project.team_members,
                expectedSaving: project.expected_saving,
                actualSaving: project.actual_saving,
                uploadDate: project.upload_date,
                createdDate: project.created_date,
                lastUpdated: project.last_updated,
                milestones: {
                    define: project.define_date,
                    measure: project.measure_date,
                    analyze: project.analyze_date,
                    improve: project.improve_date,
                    control: project.control_date
                }
            }));
            
            filteredProjects = [...currentProjects];
            refreshTable();
            updatePagination();
        } else {
            showErrorMessage('Failed to load project data');
        }
    } catch (error) {
        console.error('Error loading project data:', error);
        showErrorMessage('Failed to load project data. Please refresh the page.');
    } finally {
        hideLoader();
    }
}

// Refresh table with current data
function refreshTable() {
    const tbody = $('#tbl_npd tbody');
    tbody.empty();
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageProjects = filteredProjects.slice(startIndex, endIndex);
    
    pageProjects.forEach(project => {
        const currentStage = getCurrentStage(project.milestones);
        const row = `
            <tr data-project-id="${project.id}">
                <td>
                    <a href="#" onclick="viewProject('${project.id}')">${project.id}</a>
                    <a class="btn btn-sm btn-success ms-2" onclick="editProject('${project.id}')" 
                       style="background-color:#33a4f6" title="Edit Project">
                        <i class="bi bi-pencil-square"></i>
                    </a>
                </td>
                <td>${project.region || ''}</td>
                <td>${project.unit || ''}</td>
                <td>${project.process || ''}</td>
                <td>${project.projectStartDate || ''}</td>
                <td>${project.plannedCompletionDate || ''}</td>
                <td><div class="td-container">${project.projectDescription || ''}</div></td>
                <td><div class="td-container">${project.businessCase || ''}</div></td>
                <td>${project.keyMetric || ''}</td>
                <td>${project.currentStatus || ''}</td>
                <td>${project.expectedBenefit || ''}</td>
                <td>${project.capexNeeded || ''}</td>
                <td>${project.approvedCapexValue || ''}</td>
                <td>${project.projectLeader || ''}</td>
                <td>${new Date().toISOString().split('T')[0]}</td>
                <td>${currentStage}</td>
                <td>${project.lastUpdated ? new Date(project.lastUpdated).toISOString().split('T')[0] : ''}</td>
            </tr>
        `;
        tbody.append(row);
    });
    
    // Reinitialize DataTable
    if ($.fn.DataTable.isDataTable('#tbl_npd')) {
        $('#tbl_npd').DataTable().destroy();
    }
    initializeDataTable();
}

// Get current DMAIC stage based on milestones
function getCurrentStage(milestones) {
    if (milestones.control) return 'Control';
    if (milestones.improve) return 'Improve';
    if (milestones.analyze) return 'Analyze';
    if (milestones.measure) return 'Measure';
    if (milestones.define) return 'Define';
    return 'Not Started';
}

// Search functionality
function handleSearch() {
    const searchTerm = $('#customSearchBox').val().toLowerCase();
    
    if (searchTerm === '') {
        filteredProjects = [...currentProjects];
    } else {
        filteredProjects = currentProjects.filter(project => {
            return Object.values(project).some(value => {
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(searchTerm);
                }
                if (typeof value === 'object' && value !== null) {
                    return Object.values(value).some(v => 
                        typeof v === 'string' && v.toLowerCase().includes(searchTerm)
                    );
                }
                return false;
            });
        });
    }
    
    currentPage = 1;
    refreshTable();
    updatePagination();
}

// Pagination functions
function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        refreshTable();
        updatePagination();
    }
}

function goToNextPage() {
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        refreshTable();
        updatePagination();
    }
}

function updatePagination() {
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    $('#pageInfo').text(`${currentPage} / ${totalPages}`);
    
    $('#prevPage').prop('disabled', currentPage === 1);
    $('#nextPage').prop('disabled', currentPage === totalPages || totalPages === 0);
}

// View project details
async function viewProject(projectId) {
    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);
        const data = await response.json();
        
        if (data.success) {
            showInfoMessage(`Viewing project: ${data.data.project_name}`);
            // window.location.href = `/project/${projectId}`;
        } else {
            showErrorMessage('Project not found');
        }
    } catch (error) {
        console.error('Error fetching project:', error);
        showErrorMessage('Failed to load project details');
    }
}

// Edit project
function editProject(projectId) {
    const project = currentProjects.find(p => p.id === projectId);
    if (project) {
        editingProject = project;
        populateForm(project);
        
        // Show form and hide table
        $("#npd-form123").show();
        $("#addbtn").hide();
        $("#search_head_div").hide();
        $("#form_data").hide();
        
        // Update buttons
        $('#btnSave').hide();
        $('#btnUpdate').show();
    }
}

// Populate form with project data
async function populateForm(project) {
    $('#n_project_id').val(project.id);
    $('#s_project_name').val(project.projectName);
    $('#s_region').val(project.region);
    
    // Trigger region change to populate units
    if (project.region) {
        await getcountry(project.region);
        setTimeout(() => {
            $('#s_unit').val(project.unit);
        }, 100);
    }
    
    $('#s_project_leader').val(project.projectLeader);
    $('#s_process').val(project.process);
    $('#s_project_desciption').val(project.projectDescription);
    $('#s_current_status').val(project.currentStatus);
    $('#s_expected_benefit').val(project.expectedBenefit);
    $('#s_capex_needed').val(project.capexNeeded);
    $('#s_approved_capex_value').val(project.approvedCapexValue);
    $('#s_key_metric').val(project.keyMetric);
    $('#s_secondary_metric').val(project.secondaryMetric);
    $('#s_business_case').val(project.businessCase);
    $('#s_problem_statement').val(project.problemStatement);
    $('#s_goal_statement').val(project.goalStatement);
    $('#s_team_members').val(project.teamMembers);
    $('#d_project_start_date').val(project.projectStartDate);
    $('#d_planned_completion_date').val(project.plannedCompletionDate);
    $('#d_actual_completion_date').val(project.actualCompletionDate);
    $('#s_expected_saving').val(project.expectedSaving);
    $('#s_actual_saving').val(project.actualSaving);
    $('#d_upload_date').val(project.uploadDate);
    
    // Populate milestones
    if (project.milestones) {
        $('#define_date').val(project.milestones.define);
        $('#measure_date').val(project.milestones.measure);
        $('#analyze_date').val(project.milestones.analyze);
        $('#improve_date').val(project.milestones.improve);
        $('#control_date').val(project.milestones.control);
    }
}

// Work trail functionality
function get_work_trail() {
    showInfoMessage('Work trail feature will be implemented in the next version.');
}

// Project opening functionality
function open_project() {
    // This would typically navigate to a project details page
    window.location.href = 'project_view_with_dumm_data.html';
}

// File upload functionality
function get_npd_Resdata() {
    // Handle file upload response
    showSuccessMessage('File uploaded successfully!');
}

// Utility functions for messages
function showSuccessMessage(message) {
    showNotification(message, 'success');
}

function showErrorMessage(message) {
    showNotification(message, 'error');
}

function showInfoMessage(message) {
    showNotification(message, 'info');
}

function showNotification(message, type = 'info') {
    // Create a simple notification
    const alertClass = type === 'success' ? 'alert-success' : 
                      type === 'error' ? 'alert-danger' : 'alert-info';
    
    const notification = $(`
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert" 
             style="position: fixed; top: 100px; right: 20px; z-index: 9999; min-width: 300px;">
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `);
    
    $('body').append(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.fadeOut(() => notification.remove());
    }, 5000);
}

// Export functions to global scope for HTML onclick handlers
window.addproject = function() {
    resetForm();
    $("#npd-form123").show();
    $("#addbtn").hide();
    $("#search_head_div").hide();
    $("#form_data").hide();
};

window.viewProject = viewProject;
window.editProject = editProject;
window.get_work_trail = get_work_trail;
window.open_project = open_project;
window.getcountry = getcountry;

// Console log for debugging
console.log('NEW_Req.js with MySQL API integration loaded successfully');