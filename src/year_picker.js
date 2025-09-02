/**
 * Portable Year Picker Widget
 * A reusable year picker component for Django forms and other applications
 */
class PortableYearPicker {
    constructor() {
        this.currentInput = null;
        this.currentDecadeStart = null;
        this.minYear = 1900;
        this.maxYear = 2100;
        this.isVisible = false;
        
        this.dropdown = document.getElementById('year-picker-dropdown');
        this.rangeSpan = this.dropdown.querySelector('.year-picker-range');
        this.grid = this.dropdown.querySelector('.year-picker-grid');
        this.prevBtn = this.dropdown.querySelector('.year-picker-nav.prev');
        this.nextBtn = this.dropdown.querySelector('.year-picker-nav.next');
        
        this.init();
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

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.yearPicker = new PortableYearPicker();
});

// Function to add year picker to new inputs dynamically
window.addYearPicker = function(selector) {
    const inputs = document.querySelectorAll(selector);
    inputs.forEach(input => {
        if (!input.classList.contains('year-picker-input')) {
            input.classList.add('year-picker-input');
            input.setAttribute('readonly', 'readonly');
            input.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.yearPicker.showPicker(input);
            });
        }
    });
};