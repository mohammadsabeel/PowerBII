// Power BI Configuration
const config = {
    type: 'report',
    tokenType: window.powerbi.models.TokenType.Embed,
    accessToken: 'mock-token',
    embedUrl: 'mock-url',
    id: 'mock-report-id',
    settings: {
        panes: {
            filters: false,
            pageNavigation: false
        }
    }
};

// User role configuration
const userRoles = {
    BED_USER: 'bed_user',
    MONITOR_USER: 'monitor_user',
    BOTH: 'both'
};

// Visual configuration - updated to match new visual names
const visualConfig = {
    [userRoles.BED_USER]: ['Sales Trend', 'Revenue Distribution'], // Hide these for bed users
    [userRoles.MONITOR_USER]: ['Product Performance', 'Sales Details'], // Hide these for monitor users
    [userRoles.BOTH]: [] // Show all for both
};

// Global variables
let currentReport = null;
let currentRole = userRoles.BED_USER;

// DOM Elements
const roleSelector = document.getElementById('roleSelector');
const applyRoleButton = document.getElementById('applyRole');
const statusDiv = document.getElementById('status');

// Function to update status message
function updateStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${isError ? 'error' : 'success'}`;
}

// Function to get all visuals in the report
async function getAllVisuals(report) {
    const visuals = [];
    try {
        const pages = await report.getPages();
        for (const page of pages) {
            const pageVisuals = await page.getVisuals();
            visuals.push(...pageVisuals);
        }
        return visuals;
    } catch (error) {
        console.error('Error getting visuals:', error);
        updateStatus('Error getting visuals: ' + error.message, true);
        return [];
    }
}

// Function to hide visuals based on role
async function hideVisuals(report, role) {
    const visualsToHide = visualConfig[role];
    
    if (!visualsToHide || visualsToHide.length === 0) {
        updateStatus('No visuals to hide for this role');
        return;
    }

    try {
        const visuals = await getAllVisuals(report);
        let hiddenCount = 0;

        for (const visual of visuals) {
            if (visualsToHide.includes(visual.name)) {
                visual.visible = false;
                hiddenCount++;
            } else {
                visual.visible = true;
            }
        }

        report.renderMockReport();
        updateStatus(`Successfully hidden ${hiddenCount} visuals for ${role} role`);
    } catch (error) {
        console.error('Error hiding visuals:', error);
        updateStatus('Error hiding visuals: ' + error.message, true);
    }
}

// Function to show all visuals
async function showAllVisuals(report) {
    try {
        const visuals = await getAllVisuals(report);
        for (const visual of visuals) {
            visual.visible = true;
        }
        report.renderMockReport();
        updateStatus('All visuals are now visible');
    } catch (error) {
        console.error('Error showing visuals:', error);
        updateStatus('Error showing visuals: ' + error.message, true);
    }
}

// Function to apply role changes
async function applyRole(role) {
    if (!currentReport) {
        updateStatus('Report not loaded yet', true);
        return;
    }

    try {
        // First show all visuals
        await showAllVisuals(currentReport);
        
        // Then hide visuals based on new role
        await hideVisuals(currentReport, role);
        
        currentRole = role;
        updateStatus(`Role changed to ${role}`);
    } catch (error) {
        console.error('Error applying role:', error);
        updateStatus('Error applying role: ' + error.message, true);
    }
}

// Main function to embed the report
async function embedReport() {
    const reportContainer = document.getElementById('reportContainer');
    const powerbi = new window.powerbi.service.Service(
        window.powerbi.factories.hpmFactory,
        window.powerbi.factories.wpmpFactory,
        window.powerbi.factories.routerFactory
    );

    try {
        // Embed the report
        currentReport = await powerbi.embed(reportContainer, config);
        updateStatus('Report embedded successfully');
        
        // Add event listener for when the report is fully loaded
        currentReport.on('loaded', async () => {
            updateStatus('Report loaded successfully');
            // Apply initial role
            await applyRole(currentRole);
        });
        
        // Add event listener for errors
        currentReport.on('error', (error) => {
            console.error('Report error:', error);
            updateStatus('Report error: ' + error.message, true);
        });
        
    } catch (error) {
        console.error('Error embedding report:', error);
        updateStatus('Error embedding report: ' + error.message, true);
    }
}

// Event Listeners
applyRoleButton.addEventListener('click', () => {
    const newRole = roleSelector.value;
    applyRole(newRole);
});

// Initialize the report when the page loads
document.addEventListener('DOMContentLoaded', () => {
    embedReport();
}); 