// NPD Tracking System - NEW_Req.js
// Comprehensive JavaScript functionality for all buttons and features with MySQL backend

$(document).ready(function() {
    // Initialize the application
    initializeApp();

    // Initialize DataTable
    initializeDataTable();

    // Bind event listeners
    bindEventListeners();

    // Load initial data from MySQL
    loadProjectData();
});

// Global variables
let currentProjects = [];
let filteredProjects = [];
let currentPage = 1;
let itemsPerPage = 10;
let editingProject = null;

// Base URL for API calls
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

// Get country/unit based on region
function getcountry(region) {
    const countryOptions = {
        'AMESA': [
            { value: 'IND_MUM', text: 'India - Mumbai' },
            { value: 'IND_DEL', text: 'India - Delhi' },
            { value: 'UAE_DUB', text: 'UAE - Dubai' },
            { value: 'SA_JHB', text: 'South Africa - Johannesburg' }
        ],
        'AMERICAS': [
            { value: 'USA_CHI', text: 'USA - Chicago' },
            { value: 'USA_NY', text: 'USA - New York' },
            { value: 'BRA_SAO', text: 'Brazil - São Paulo' },
            { value: 'MEX_MEX', text: 'Mexico - Mexico City' }
        ],
        'EU': [
            { value: 'GER_BER', text: 'Germany - Berlin' },
            { value: 'UK_LON', text: 'UK - London' },
            { value: 'FRA_PAR', text: 'France - Paris' },
            { value: 'ITA_MIL', text: 'Italy - Milan' }
        ],
        'EAP': [
            { value: 'CHN_SHA', text: 'China - Shanghai' },
            { value: 'JPN_TOK', text: 'Japan - Tokyo' },
            { value: 'KOR_SEO', text: 'South Korea - Seoul' },
            { value: 'AUS_SYD', text: 'Australia - Sydney' }
        ]
    };

    const unitSelect = $('#s_unit');
    unitSelect.empty();
    unitSelect.append('<option value="">Select Unit</option>');

    if (region && countryOptions[region]) {
        countryOptions[region].forEach(function(option) {
            unitSelect.append(`<option value="${option.value}">${option.text}</option>`);
        });
    }
}

// Save new project to MySQL
function saveProject() {
    showLoader();

    const formData = getFormData();
    
    // Make API call to save project
    $.ajax({
        url: `${API_BASE_URL}/projects`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function(response) {
            if (response.success) {
                loadProjectData(); // Reload data from database
                resetForm();
                showSuccessMessage('Project saved successfully!');
                
                // Hide form and show table
                $("#npd-form123").hide();
                $("#addbtn").show();
                $("#search_head_div").show();
                $("#form_data").show();
            } else {
                showErrorMessage('Failed to save project');
            }
            hideLoader();
        },
        error: function(xhr, status, error) {
            console.error('Error saving project:', error);
            showErrorMessage('Error saving project: ' + error);
            hideLoader();
        }
    });
}

// Update existing project in MySQL
function updateProject() {
    if (!editingProject) {
        showErrorMessage('No project selected for update');
        return;
    }

    showLoader();

    const formData = getFormData();
    
    // Make API call to update project
    $.ajax({
        url: `${API_BASE_URL}/projects/${editingProject.id}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function(response) {
            if (response.success) {
                loadProjectData(); // Reload data from database
                resetForm();
                showSuccessMessage('Project updated successfully!');
                editingProject = null;
                
                // Hide form and show table
                $("#npd-form123").hide();
                $("#addbtn").show();
                $("#search_head_div").show();
                $("#form_data").show();
            } else {
                showErrorMessage('Failed to update project');
            }
            hideLoader();
        },
        error: function(xhr, status, error) {
            console.error('Error updating project:', error);
            showErrorMessage('Error updating project: ' + error);
            hideLoader();
        }
    });
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
        capexNeeded: $('#s_capex_needed').val(),
        approvedCapexValue: $('#s_approved_capex_value').val(),
        keyMetric: $('#s_key_metric').val(),
        secondaryMetric: $('#s_secondary_metric').val(),
        businessCase: $('#s_business_case').val(),
        problemStatement: $('#s_problem_statement').val(),
        goalStatement: $('#s_goal_statement').val(),
        teamMembers: $('#s_team_members').val(),
        projectStartDate: $('#d_project_start_date').val(),
        plannedCompletionDate: $('#d_planned_completion_date').val(),
        actualCompletionDate: $('#d_actual_completion_date').val(),
        expectedSaving: $('#s_expected_saving').val(),
        actualSaving: $('#s_actual_saving').val(),
        uploadDate: $('#d_upload_date').val(),
        milestones: {
            define: $('#define_date').val(),
            measure: $('#measure_date').val(),
            analyze: $('#analyze_date').val(),
            improve: $('#improve_date').val(),
            control: $('#control_date').val()
        }
    };
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

// Load project data from MySQL database
function loadProjectData() {
    showLoader();

    $.ajax({
        url: `${API_BASE_URL}/projects`,
        method: 'GET',
        success: function(data) {
            currentProjects = data;
            filteredProjects = [...currentProjects];
            refreshTable();
            updatePagination();
            hideLoader();
            console.log('Projects loaded from database:', data.length, 'projects');
        },
        error: function(xhr, status, error) {
            console.error('Error loading projects:', error);
            showErrorMessage('Error loading projects: ' + error);
            hideLoader();
        }
    });
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
                <td>${project.lastUpdated || ''}</td>
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
    if (!milestones) return 'Not Started';
    if (milestones.control) return 'Control';
    if (milestones.improve) return 'Improve';
    if (milestones.analyze) return 'Analyze';
    if (milestones.measure) return 'Measure';
    if (milestones.define) return 'Define';
    return 'Not Started';
}

// Search functionality with database backend
function handleSearch() {
    const searchTerm = $('#customSearchBox').val().toLowerCase();

    if (searchTerm === '') {
        filteredProjects = [...currentProjects];
        currentPage = 1;
        refreshTable();
        updatePagination();
    } else {
        // Use local filtering for real-time search
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

        currentPage = 1;
        refreshTable();
        updatePagination();
    }
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
function viewProject(projectId) {
    const project = currentProjects.find(p => p.id === projectId);
    if (project) {
        // For now, just show an alert. In a real app, this would navigate to a detail page
        showInfoMessage(`Viewing project: ${project.projectName}`);
        // window.location.href = `/project/${projectId}`;
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
function populateForm(project) {
    $('#n_project_id').val(project.id);
    $('#s_project_name').val(project.projectName);
    $('#s_region').val(project.region);

    // Trigger region change to populate units
    if (project.region) {
        getcountry(project.region);
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

// Delete project function (optional)
function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        showLoader();
        
        $.ajax({
            url: `${API_BASE_URL}/projects/${projectId}`,
            method: 'DELETE',
            success: function(response) {
                if (response.success) {
                    loadProjectData(); // Reload data from database
                    showSuccessMessage('Project deleted successfully!');
                } else {
                    showErrorMessage('Failed to delete project');
                }
                hideLoader();
            },
            error: function(xhr, status, error) {
                console.error('Error deleting project:', error);
                showErrorMessage('Error deleting project: ' + error);
                hideLoader();
            }
        });
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
window.deleteProject = deleteProject;
window.get_work_trail = get_work_trail;
window.open_project = open_project;
window.getcountry = getcountry;

// Console log for debugging
console.log('NEW_Req.js loaded successfully with MySQL backend integration');