/**
 * Portable Year Picker Widget
 * A reusable year picker component for Django forms and other applications
 */
class PortableYearPicker {
    constructor(options = {}) {
        this.currentInput = null;
        this.currentDecadeStart = null;
        this.minYear = 1900;
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
        
        // Dynamic z-index calculation for modals
        this.setModalZIndex(input);
    }
    
    positionDropdown(input) {
        const rect = input.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        // Use fixed positioning when inside modals to avoid scrolling issues
        const modal = this.findParentModal(input);
        
        if (modal) {
            // Fixed positioning relative to viewport (better for modals)
            this.dropdown.style.position = 'fixed';
            this.dropdown.style.left = rect.left + 'px';
            this.dropdown.style.top = (rect.bottom + 5) + 'px';
        } else {
            // Absolute positioning for normal page content
            this.dropdown.style.position = 'absolute';
            this.dropdown.style.left = (rect.left + scrollLeft) + 'px';
            this.dropdown.style.top = (rect.bottom + scrollTop + 5) + 'px';
        }
        
        // Set appropriate z-index without removing existing classes
        this.setModalZIndex(input, modal);
        
        // Ensure dropdown stays within viewport
        this.adjustPositionIfNeeded();
    }
    
    setModalZIndex(input, modal = null) {
        if (!modal) {
            modal = this.findParentModal(input);
        }
        
        if (modal) {
            const modalZIndex = this.getElementZIndex(modal);
            let dropdownZIndex = Math.max(modalZIndex + 10, 9999);
            
            // Add a data attribute to indicate we're in a modal (non-intrusive)
            this.dropdown.setAttribute('data-in-modal', 'true');
            this.dropdown.setAttribute('data-modal-z-index', modalZIndex);
            
            // Apply z-index higher than the modal
            this.dropdown.style.zIndex = dropdownZIndex;
        } else {
            // Not in modal - remove modal attributes and use default z-index
            this.dropdown.removeAttribute('data-in-modal');
            this.dropdown.removeAttribute('data-modal-z-index');
            this.dropdown.style.zIndex = '9999';
        }
    }
    
    adjustPositionIfNeeded() {
        // Adjust position if dropdown goes outside viewport
        const rect = this.dropdown.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Adjust horizontal position if needed
        if (rect.right > viewportWidth) {
            const overflow = rect.right - viewportWidth;
            const currentLeft = parseInt(this.dropdown.style.left);
            this.dropdown.style.left = (currentLeft - overflow - 10) + 'px';
        }
        
        if (rect.left < 0) {
            this.dropdown.style.left = '10px';
        }
        
        // Adjust vertical position if needed (show above input if no space below)
        if (rect.bottom > viewportHeight) {
            const inputRect = this.currentInput.getBoundingClientRect();
            if (this.dropdown.style.position === 'fixed') {
                this.dropdown.style.top = (inputRect.top - rect.height - 5) + 'px';
            } else {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                this.dropdown.style.top = (inputRect.top + scrollTop - rect.height - 5) + 'px';
            }
            
            // Add class to indicate upward positioning (for styling if needed)
            this.dropdown.setAttribute('data-positioned-above', 'true');
        } else {
            this.dropdown.removeAttribute('data-positioned-above');
        }
    }
    
    findParentModal(element) {
        let parent = element.parentElement;
        
        while (parent && parent !== document.body) {
            const computedStyle = window.getComputedStyle(parent);
            const position = computedStyle.position;
            const zIndex = computedStyle.zIndex;
            
            // Check for modal indicators
            if (
                // Bootstrap modals
                parent.classList.contains('modal') ||
                parent.classList.contains('modal-dialog') ||
                // Generic modal patterns
                (position === 'fixed' && (
                    parent.classList.contains('modal') ||
                    parent.classList.contains('dialog') ||
                    parent.classList.contains('popup') ||
                    parent.classList.contains('overlay')
                )) ||
                // High z-index fixed elements (likely modals)
                (position === 'fixed' && parseInt(zIndex) > 100) ||
                // Material-UI
                parent.classList.contains('MuiModal-root') ||
                parent.classList.contains('MuiDialog-root') ||
                // Tailwind modal patterns
                (parent.classList.contains('fixed') && parent.classList.contains('inset-0'))
            ) {
                return parent;
            }
            
            parent = parent.parentElement;
        }
        
        return null;
    }
    
    getElementZIndex(element) {
        const zIndex = window.getComputedStyle(element).zIndex;
        return zIndex === 'auto' ? 0 : parseInt(zIndex) || 0;
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

// Function to initialize year picker with manual z-index override
window.initYearPickerForModal = function(fieldId, options = {}) {
    const picker = window.initYearPicker(fieldId, options);
    
    if (picker && picker.dropdown && options.zIndex) {
        // Only override z-index if explicitly provided
        picker.dropdown.style.zIndex = options.zIndex;
        picker.dropdown.setAttribute('data-manual-z-index', options.zIndex);
    }
    
    return picker;
};

// Function to set z-index manually for existing year picker
window.setYearPickerZIndex = function(zIndex = 99999) {
    if (window.yearPicker && window.yearPicker.dropdown) {
        window.yearPicker.dropdown.style.zIndex = zIndex;
        window.yearPicker.dropdown.setAttribute('data-manual-z-index', zIndex);
    }
};

// Function to update year picker options for a field
window.updateYearPicker = function(fieldId, options = {}) {
    const input = document.getElementById(fieldId);
    if (input) {
        if (options.minYear !== undefined) input.dataset.minYear = options.minYear;
        if (options.maxYear !== undefined) input.dataset.maxYear = options.maxYear;
        if (options.value !== undefined) input.value = options.value;
        if (options.zIndex !== undefined && window.yearPicker) {
            window.yearPicker.dropdown.style.zIndex = options.zIndex;
            window.yearPicker.dropdown.setAttribute('data-manual-z-index', options.zIndex);
        }
    }
};

// Function to reset year picker to auto-positioning (removes manual overrides)
window.resetYearPickerPositioning = function() {
    if (window.yearPicker && window.yearPicker.dropdown) {
        window.yearPicker.dropdown.removeAttribute('data-manual-z-index');
        window.yearPicker.dropdown.classList.remove('force-front');
        // Re-position using current input
        if (window.yearPicker.currentInput) {
            window.yearPicker.positionDropdown(window.yearPicker.currentInput);
        }
    }
};