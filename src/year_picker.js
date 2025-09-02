/**
 * Portable Year Picker Widget
 * A reusable year picker component for Django forms and other applications
 */
class PortableYearPicker {
    constructor(options = {}) {
        this.currentInput = null;
        this.currentDecadeStart = null;
        this.minYear = 1974;
        this.maxYear = 2100;
        this.isVisible = false;
        this.dropdownId = options.dropdownId || 'year-picker-dropdown';

        // Auto-create dropdown if it doesn't exist
        this.createDropdownIfNeeded();

        this.dropdown = document.getElementById(this.dropdownId);
        this.rangeSpan = this.dropdown.querySelector('.year-picker-range');
        this.grid = this.dropdown.querySelector('.year-picker-grid');
        this.prevBtn = this.dropdown.querySelector('.year-picker-nav.prev');
        this.nextBtn = this.dropdown.querySelector('.year-picker-nav.next');

        this.init();
    }

    createDropdownIfNeeded() {
        if (!document.getElementById(this.dropdownId)) {
            const dropdown = document.createElement('div');
            dropdown.id = this.dropdownId;
            dropdown.className = 'year-picker-dropdown';
            dropdown.innerHTML = `
                <div class="year-picker-header">
                    <button class="year-picker-nav prev" type="button">&lt;</button>
                    <span class="year-picker-range"></span>
                    <button class="year-picker-nav next" type="button">&gt;</button>
                </div>
                <div class="year-picker-grid"></div>
            `;
            document.body.appendChild(dropdown);
        }
    }

    init() {
        // Find all year picker inputs and bind events
        this.bindGlobalEvents();
        this.bindNavigationEvents();
        this.initializeInputs();
    }

    initializeInputs() {
        const inputs = document.querySelectorAll('.year-picker-input');
        inputs.forEach(input => {
            input.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showPicker(input);
            });

            // Make input readonly to prevent manual typing
            input.setAttribute('readonly', 'readonly');
        });
    }
    
    bindGlobalEvents() {
        // Hide picker when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isVisible && 
                !this.dropdown.contains(e.target) && 
                !e.target.classList.contains('year-picker-input')) {
                this.hidePicker();
            }
        });
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hidePicker();
            }
        });
    }
    
    bindNavigationEvents() {
        this.prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigateDecade(-12);
        });
        
        this.nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigateDecade(12);
        });
    }
    
    showPicker(input) {
        this.currentInput = input;
        
        // Get min/max years from data attributes
        this.minYear = parseInt(input.dataset.minYear) || 1900;
        this.maxYear = parseInt(input.dataset.maxYear) || 2100;
        
        // Get current value or use current year
        const currentValue = input.value;
        const selectedYear = currentValue ? parseInt(currentValue) : new Date().getFullYear();
        
        // Calculate decade to show
        this.currentDecadeStart = Math.floor(selectedYear / 12) * 12;
        
        // Position dropdown near the input
        this.positionDropdown(input);
        
        // Render years and show
        this.renderYears(selectedYear);
        this.dropdown.style.display = 'block';
        this.isVisible = true;
    }
    
    hidePicker() {
        this.dropdown.style.display = 'none';
        this.isVisible = false;
        this.currentInput = null;
    }
    
    positionDropdown(input) {
        const rect = input.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        this.dropdown.style.position = 'absolute';
        this.dropdown.style.left = (rect.left + scrollLeft) + 'px';
        this.dropdown.style.top = (rect.bottom + scrollTop + 5) + 'px';
        this.dropdown.style.zIndex = '1000';
    }
    
    navigateDecade(direction) {
        this.currentDecadeStart += direction;
        
        // Don't go beyond reasonable limits
        if (this.currentDecadeStart < this.minYear - 11) {
            this.currentDecadeStart = Math.floor(this.minYear / 12) * 12;
        }
        if (this.currentDecadeStart > this.maxYear) {
            this.currentDecadeStart = Math.floor(this.maxYear / 12) * 12;
        }
        
        const selectedYear = this.currentInput.value ? parseInt(this.currentInput.value) : null;
        this.renderYears(selectedYear);
    }
    
    renderYears(selectedYear = null) {
        // Clear previous years
        this.grid.innerHTML = '';
        
        // Calculate display range
        const endYear = this.currentDecadeStart + 11;
        const displayStart = Math.max(this.currentDecadeStart, this.minYear);
        const displayEnd = Math.min(endYear, this.maxYear);
        
        // Update range display
        this.rangeSpan.textContent = `${displayStart}-${displayEnd}`;
        
        // Update navigation buttons
        this.prevBtn.disabled = this.currentDecadeStart <= Math.floor(this.minYear / 12) * 12;
        this.nextBtn.disabled = this.currentDecadeStart >= Math.floor(this.maxYear / 12) * 12;
        
        // Generate year items
        for (let year = this.currentDecadeStart; year <= endYear; year++) {
            const yearDiv = document.createElement('div');
            yearDiv.className = 'year-item';
            yearDiv.textContent = year;
            
            // Mark selected year
            if (year === selectedYear) {
                yearDiv.classList.add('selected');
            }
            
            // Disable years outside min/max range
            if (year < this.minYear || year > this.maxYear) {
                yearDiv.classList.add('disabled');
            } else {
                yearDiv.classList.add('selectable');
                yearDiv.addEventListener('click', () => {
                    this.selectYear(year);
                });
            }
            
            this.grid.appendChild(yearDiv);
        }
    }
    
    selectYear(year) {
        if (this.currentInput) {
            this.currentInput.value = year;
            
            // Trigger change event for form handling
            const changeEvent = new Event('change', { bubbles: true });
            this.currentInput.dispatchEvent(changeEvent);
        }
        this.hidePicker();
    }
}

// Auto-initialize when DOM is loaded (for backward compatibility)
document.addEventListener('DOMContentLoaded', function() {
    if (!window.yearPicker) {
        window.yearPicker = new PortableYearPicker();
    }
});

// Function to add year picker to specific field by ID
window.initYearPicker = function(fieldId, options = {}) {
    const input = document.getElementById(fieldId);
    if (!input) {
        console.warn(`Year picker: Field with ID '${fieldId}' not found`);
        return null;
    }
    
    // Create or get existing year picker instance
    if (!window.yearPicker) {
        window.yearPicker = new PortableYearPicker();
    }
    
    // Add year picker functionality to the specific field
    input.classList.add('year-picker-input');
    input.setAttribute('readonly', 'readonly');
    
    // Set min/max years from options or data attributes
    if (options.minYear) input.dataset.minYear = options.minYear;
    if (options.maxYear) input.dataset.maxYear = options.maxYear;
    if (options.defaultYear) input.value = options.defaultYear;
    
    // Remove existing event listeners to prevent duplicates
    input.removeEventListener('click', input._yearPickerHandler);
    
    // Add click event listener
    input._yearPickerHandler = function(e) {
        e.preventDefault();
        e.stopPropagation();
        window.yearPicker.showPicker(input);
    };
    input.addEventListener('click', input._yearPickerHandler);
    
    return window.yearPicker;
};

// Function to add year picker to multiple fields by selector
window.addYearPicker = function(selector, options = {}) {
    const inputs = document.querySelectorAll(selector);
    const results = [];
    
    inputs.forEach(input => {
        if (input.id) {
            results.push(window.initYearPicker(input.id, options));
        } else {
            // Generate ID if not present
            const generatedId = 'year-picker-' + Math.random().toString(36).substr(2, 9);
            input.id = generatedId;
            results.push(window.initYearPicker(generatedId, options));
        }
    });
    
    return results;
};

// Function to remove year picker from a field
window.removeYearPicker = function(fieldId) {
    const input = document.getElementById(fieldId);
    if (input && input._yearPickerHandler) {
        input.removeEventListener('click', input._yearPickerHandler);
        input.classList.remove('year-picker-input');
        input.removeAttribute('readonly');
        delete input._yearPickerHandler;
    }
};

// Function to update year picker options for a field
window.updateYearPicker = function(fieldId, options = {}) {
    const input = document.getElementById(fieldId);
    if (input) {
        if (options.minYear !== undefined) input.dataset.minYear = options.minYear;
        if (options.maxYear !== undefined) input.dataset.maxYear = options.maxYear;
        if (options.value !== undefined) input.value = options.value;
    }
};