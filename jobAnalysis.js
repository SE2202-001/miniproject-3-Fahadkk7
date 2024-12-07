// Job class definition
class Job {
    constructor(jobData) {
        this.title = jobData.Title || 'Untitled Job';
        this.postedTime = jobData.Posted || 'N/A';
        this.type = jobData.Type || 'Unspecified';
        this.level = jobData.Level || 'Not Specified';
        this.skill = jobData.Skill || [];
        this.detail = jobData.Detail || 'No additional details available.';
    }

    //Format posted time
    getFormattedTime() {
        //return(this.postedTime)
        
        try {
            const minutesRegex = /(\d+)\s*minutes?\s*ago/i;
            const hoursRegex = /(\d+)\s*hours?\s*ago/i;
            const daysRegex = /(\d+)\s*days?\s*ago/i;

        
        const minutesMatch = this.postedTime.match(minutesRegex);
        const hoursMatch = this.postedTime.match(hoursRegex);
        const daysMatch = this.postedTime.match(daysRegex);
        if (minutesMatch){
            return (`${parseFloat(minutesMatch[1]) } minutes ago`);
        }
        else if(hoursMatch){
            return (`${parseFloat(hoursMatch[1]*60)} minutes ago`);
        }
        else if(daysMatch){
            return (`${parseFloat(daysMatch[1]*1440)} minutes ago`);
        }
        
        } catch {
            return this.postedTime;
        }
            
    }
}

// Main Application Logic
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fileInput = document.getElementById('jsonFileInput');
    const loadDataBtn = document.getElementById('loadDataBtn');
    const errorDisplay = document.getElementById('errorDisplay');
    const jobListings = document.getElementById('jobListings');
    const levelFilter = document.getElementById('levelFilter');
    const typeFilter = document.getElementById('typeFilter');
    const skillFilter = document.getElementById('skillFilter');
    const sortTitle = document.getElementById('sortTitle');
    const sortPostedTime = document.getElementById('sortPostedTime');

    // State
    let jobs = [];

    // Display Error
    function showError(message) {
        errorDisplay.textContent = message;
        errorDisplay.style.display = 'block';
        jobListings.innerHTML = '';
    }

    // Clear Error
    function clearError() {
        errorDisplay.textContent = '';
        errorDisplay.style.display = 'none';
    }

    // Populate Filters
    function populateFilters() {
        // Reset filters
        levelFilter.innerHTML = '<option value="">All Levels</option>';
        typeFilter.innerHTML = '<option value="">All Types</option>';
        skillFilter.innerHTML = '<option value="">All Skills</option>';

        // Collect unique values
        const levels = new Set(jobs.map(job => job.level).filter(Boolean));
        const types = new Set(jobs.map(job => job.type).filter(Boolean));
        const skills = new Set(jobs.flatMap(job => 
            Array.isArray(job.skill) ? job.skill : [job.skill]
        ).filter(Boolean));

        // Populate level filter
        levels.forEach(level => {
            const option = document.createElement('option');
            option.value = level;
            option.textContent = level;
            levelFilter.appendChild(option);
        });

        // Populate type filter
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeFilter.appendChild(option);
        });

        // Populate skill filter
        skills.forEach(skill => {
            const option = document.createElement('option');
            option.value = skill;
            option.textContent = skill;
            skillFilter.appendChild(option);
        });
    }

    // Render Jobs
    function renderJobs(jobsToRender) {
        jobListings.innerHTML = '';

        if (jobsToRender.length === 0) {
            jobListings.innerHTML = '<p>No jobs match the current filters.</p>';
            return;
        }

        jobsToRender.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card';
            jobCard.innerHTML = `
                <h3>${job.title}</h3>
                <p>Type: ${job.type}</p>
                <p>Level: ${job.level}</p>
                <p>Posted: ${job.getFormattedTime()}</p>
            `;
            jobListings.appendChild(jobCard);
        });
    }

    // Filter and Sort Jobs
    function filterAndSortJobs() {
        let filteredJobs = jobs.filter(job => {
            const levelMatch = !levelFilter.value || job.level === levelFilter.value;
            const typeMatch = !typeFilter.value || job.type === typeFilter.value;
            const skillMatch = !skillFilter.value || 
                (Array.isArray(job.skill) 
                    ? job.skill.includes(skillFilter.value) 
                    : job.skill === skillFilter.value);
            
            return levelMatch && typeMatch && skillMatch;
        });

        // Sort by title
        if (sortTitle.value === 'asc') {
            filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortTitle.value === 'desc') {
            filteredJobs.sort((a, b) => b.title.localeCompare(a.title));
        }

        // Sort by posted time
        if (sortPostedTime.value === 'oldest') {
            filteredJobs.sort((a, b) => parseInt(b.getFormattedTime().split(' ')[0]) - parseInt(a.getFormattedTime().split(' ')[0]));
        } else if (sortPostedTime.value === 'newest') {
            filteredJobs.sort((a, b) => parseInt(a.getFormattedTime().split(' ')[0]) - parseInt(b.getFormattedTime().split(' ')[0]));
        }

        renderJobs(filteredJobs);
    }

    // Load JSON File
    loadDataBtn.addEventListener('click', () => {
        clearError();
        const file = fileInput.files[0];
        
        if (!file) {
            showError('Please select a JSON file first.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                
                // Validate JSON structure
                if (!Array.isArray(jsonData)) {
                    throw new Error('Invalid JSON format. Expected an array of jobs.');
                }

                // Create Job instances
                jobs = jsonData.map(jobData => new Job(jobData));

                // Populate filters
                populateFilters();

                // first render
                renderJobs(jobs);
            } catch (error) {
                showError(`Error parsing JSON: ${error.message}`);
            }
        };

        reader.onerror = function() {
            showError('Error reading file.');
        };

        reader.readAsText(file);
    });

    // event listeners for filters and sorting
    [levelFilter, typeFilter, skillFilter, sortTitle, sortPostedTime].forEach(element => {
        element.addEventListener('change', filterAndSortJobs);
    });
});
