class YearPicker {
    constructor(options = {}) {
        this.currentInput = null;
        this.currentDecadeStart = null;
        this.minYear = 1900;
        this.maxYear = 2100;
        this.isVisible = false;
        this.dropdownId = options.dropdownId || 'year-picker-dropdown';
        this.dropdown = null; // Lazy initialization

        this.init();
    }

    createDropdown() {
        const dropdown = document.createElement('div');
        dropdown.id = this.dropdownId;
        dropdown.className = 'year-picker-dropdown';
        dropdown.style.display = 'none';
        dropdown.setAttribute('aria-hidden', 'true');
        dropdown.innerHTML = `
            <div class="year-picker-header">
                <button class="year-picker-nav prev" type="button" aria-label="Previous decade">&lt;</button>
                <span class="year-picker-range" role="status" aria-live="polite"></span>
                <button class="year-picker-nav next" type="button" aria-label="Next decade">&gt;</button>
            </div>
            <div class="year-picker-grid" role="grid"></div>
            <div class="year-picker-footer">
                <button class="year-picker-clear" type="button" aria-label="Clear selection">Clear</button>
            </div>
        `;
        document.body.appendChild(dropdown);

        this.dropdown = dropdown;
        this.rangeSpan = this.dropdown.querySelector('.year-picker-range');
        this.grid = this.dropdown.querySelector('.year-picker-grid');
        this.prevBtn = this.dropdown.querySelector('.year-picker-nav.prev');
        this.nextBtn = this.dropdown.querySelector('.year-picker-nav.next');
        this.clearBtn = this.dropdown.querySelector('.year-picker-clear');

        this.bindNavigationEvents();
    }

    init() {
        this.bindGlobalEvents();
        this.initializeInputs();
    }

    initializeInputs() {
        const inputs = document.querySelectorAll('.year-picker-input');
        inputs.forEach(input => {
            input.setAttribute('aria-haspopup', 'true');
            input.setAttribute('role', 'combobox');
            input.setAttribute('aria-label', 'Year picker input');
            input.setAttribute('readonly', 'readonly');

            const showPicker = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showPicker(input);
            };
            input.addEventListener('click', showPicker);
            input.addEventListener('touchstart', showPicker, { passive: false });
        });
    }

    bindGlobalEvents() {
        const hideOnOutsideInteraction = (e) => {
            if (this.isVisible && 
                this.dropdown && 
                !this.dropdown.contains(e.target) && 
                !e.target.classList.contains('year-picker-input')) {
                this.hidePicker();
            }
        };

        document.addEventListener('click', hideOnOutsideInteraction);
        document.addEventListener('touchstart', hideOnOutsideInteraction, { passive: false });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hidePicker();
            }
        });
    }

    bindNavigationEvents() {
        const navigate = (direction) => (e) => {
            e.stopPropagation();
            this.navigateDecade(direction);
        };
        this.prevBtn.addEventListener('click', navigate(-12));
        this.prevBtn.addEventListener('touchstart', navigate(-12), { passive: false });
        this.nextBtn.addEventListener('click', navigate(12));
        this.nextBtn.addEventListener('touchstart', navigate(12), { passive: false });
        this.clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.clearValue();
        });
        this.clearBtn.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            this.clearValue();
        }, { passive: false });
    }

    showPicker(input) {
        if (!this.dropdown) {
            this.createDropdown();
        }

        this.currentInput = input;
        this.minYear = parseInt(input.dataset.minYear) || 1900;
        this.maxYear = parseInt(input.dataset.maxYear) || 2100;
        const currentValue = input.value;
        const selectedYear = currentValue ? parseInt(currentValue) : new Date().getFullYear();

        this.currentDecadeStart = Math.floor(selectedYear / 12) * 12;
        this.positionDropdown(input);
        this.renderYears(selectedYear);
        this.updateClearButton();
        this.dropdown.style.display = 'block';
        this.dropdown.setAttribute('aria-hidden', 'false');
        this.isVisible = true;
    }

    hidePicker() {
        if (this.dropdown) {
            this.dropdown.style.display = 'none';
            this.dropdown.setAttribute('aria-hidden', 'true');
        }
        this.isVisible = false;
        this.currentInput = null;
    }

    positionDropdown(input) {
        const rect = input.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const modal = this.findParentModal(input);
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        // Use fixed positioning for modals, absolute for others
        if (modal) {
            this.dropdown.style.position = 'fixed';
            this.dropdown.style.left = Math.max(10, rect.left) + 'px'; // Ensure left padding
            let topPosition = rect.bottom + 8;
            const dropdownHeight = this.dropdown.scrollHeight || 300; // Estimate height if not yet rendered
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;

            // Reposition above if not enough space below
            if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                this.dropdown.style.top = Math.max(10, rect.top - dropdownHeight - 8) + 'px';
                this.dropdown.setAttribute('data-positioned-above', 'true');
            } else {
                this.dropdown.style.top = topPosition + 'px';
                this.dropdown.removeAttribute('data-positioned-above');
            }
        } else {
            this.dropdown.style.position = 'absolute';
            this.dropdown.style.left = (rect.left + scrollLeft) + 'px';
            let topPosition = (rect.bottom + scrollTop + 8);
            const dropdownHeight = this.dropdown.scrollHeight || 300;
            const spaceBelow = viewportHeight - (rect.bottom + scrollTop);
            const spaceAbove = rect.top + scrollTop;

            if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                this.dropdown.style.top = Math.max(10, rect.top + scrollTop - dropdownHeight - 8) + 'px';
                this.dropdown.setAttribute('data-positioned-above', 'true');
            } else {
                this.dropdown.style.top = topPosition + 'px';
                this.dropdown.removeAttribute('data-positioned-above');
            }
        }

        this.setModalZIndex(input, modal);
        this.adjustPositionIfNeeded();
    }

    setModalZIndex(input, modal = null) {
        if (!modal) {
            modal = this.findParentModal(input);
        }

        if (modal) {
            const modalZIndex = this.getElementZIndex(modal);
            let dropdownZIndex = Math.max(modalZIndex + 10, 10001);
            this.dropdown.setAttribute('data-in-modal', 'true');
            this.dropdown.setAttribute('data-modal-z-index', dropdownZIndex);
            this.dropdown.style.zIndex = dropdownZIndex;
        } else {
            this.dropdown.removeAttribute('data-in-modal');
            this.dropdown.removeAttribute('data-modal-z-index');
            this.dropdown.style.zIndex = '10000';
        }
    }

    adjustPositionIfNeeded() {
        const rect = this.dropdown.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        // Horizontal adjustment
        if (rect.right > viewportWidth) {
            const overflow = rect.right - viewportWidth;
            const currentLeft = parseInt(this.dropdown.style.left);
            this.dropdown.style.left = Math.max(10, currentLeft - overflow - 10) + 'px';
        }

        if (rect.left < 0) {
            this.dropdown.style.left = '10px';
        }

        // Vertical adjustment
        if (rect.bottom > viewportHeight) {
            const inputRect = this.currentInput.getBoundingClientRect();
            const dropdownHeight = rect.height;
            if (this.dropdown.style.position === 'fixed') {
                this.dropdown.style.top = Math.max(10, inputRect.top - dropdownHeight - 8) + 'px';
            } else {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                this.dropdown.style.top = Math.max(10, inputRect.top + scrollTop - dropdownHeight - 8) + 'px';
            }
            this.dropdown.setAttribute('data-positioned-above', 'true');
        }
    }

    findParentModal(element) {
        let parent = element.parentElement;

        while (parent && parent !== document.body) {
            const computedStyle = window.getComputedStyle(parent);
            const {position, zIndex} = computedStyle;

            if (
                parent.classList.contains('modal') ||
                parent.classList.contains('modal-dialog') ||
                (position === 'fixed' && (
                    parent.classList.contains('modal') ||
                    parent.classList.contains('dialog') ||
                    parent.classList.contains('popup') ||
                    parent.classList.contains('overlay') ||
                    parent.classList.contains('MuiModal-root') ||
                    parent.classList.contains('MuiDialog-root') ||
                    parent.classList.contains('fixed') && parent.classList.contains('inset-0')
                )) ||
                (position === 'fixed' && parseInt(zIndex) > 100)
            ) {
                return parent;
            }
            parent = parent.parentElement;
        }
        return null;
    }

    getElementZIndex(element) {
        const {zIndex} = window.getComputedStyle(element);
        return zIndex === 'auto' ? 0 : parseInt(zIndex) || 0;
    }

    navigateDecade(direction) {
        this.currentDecadeStart += direction;

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
        this.grid.innerHTML = '';
        const endYear = this.currentDecadeStart + 11;
        const displayStart = Math.max(this.currentDecadeStart, this.minYear);
        const displayEnd = Math.min(endYear, this.maxYear);

        this.rangeSpan.textContent = `${displayStart}-${displayEnd}`;
        this.prevBtn.disabled = this.currentDecadeStart <= Math.floor(this.minYear / 12) * 12;
        this.nextBtn.disabled = this.currentDecadeStart >= Math.floor(this.maxYear / 12) * 12;

        for (let year = this.currentDecadeStart; year <= endYear; year++) {
            const yearDiv = document.createElement('div');
            yearDiv.className = 'year-item';
            yearDiv.textContent = year;
            yearDiv.setAttribute('role', 'gridcell');
            yearDiv.setAttribute('aria-label', `Year ${year}`);

            if (year === selectedYear) {
                yearDiv.classList.add('selected');
                yearDiv.setAttribute('aria-selected', 'true');
            }

            if (year < this.minYear || year > this.maxYear) {
                yearDiv.classList.add('disabled');
                yearDiv.setAttribute('aria-disabled', 'true');
            } else {
                yearDiv.classList.add('selectable');
                const selectYear = () => this.selectYear(year);
                yearDiv.addEventListener('click', selectYear);
                yearDiv.addEventListener('touchstart', selectYear, { passive: false });
            }
            this.grid.appendChild(yearDiv);
        }
    }

    selectYear(year) {
        if (this.currentInput) {
            this.currentInput.value = year;
            this.currentInput.classList.add('year-picker-has-value');
            const changeEvent = new Event('change', { bubbles: true });
            this.currentInput.dispatchEvent(changeEvent);
            const yearSelectEvent = new CustomEvent('yearSelected', { 
                bubbles: true, 
                detail: { year: year, input: this.currentInput } 
            });
            this.currentInput.dispatchEvent(yearSelectEvent);
        }
        this.hidePicker();
    }

    clearValue() {
        if (this.currentInput) {
            const oldValue = this.currentInput.value;
            this.currentInput.value = '';
            this.currentInput.classList.remove('year-picker-has-value');
            const changeEvent = new Event('change', { bubbles: true });
            this.currentInput.dispatchEvent(changeEvent);
            const yearClearEvent = new CustomEvent('yearCleared', { 
                bubbles: true, 
                detail: { oldValue: oldValue, input: this.currentInput } 
            });
            this.currentInput.dispatchEvent(yearClearEvent);
        }
        this.hidePicker();
    }

    updateClearButton() {
        if (this.currentInput && this.currentInput.value) {
            this.clearBtn.style.display = 'inline-block';
            this.clearBtn.textContent = `Clear (${this.currentInput.value})`;
        } else {
            this.clearBtn.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (!window.yearPicker) {
        window.yearPicker = new YearPicker();
    }
});

window.initYearPicker = function(fieldClass, options = {}) {
    const inputs = document.getElementsByClassName(fieldClass);
    if (!inputs.length) {
        console.warn(`Year picker: No elements with class '${fieldClass}' found`);
        return null;
    }

    if (!window.yearPicker) {
        window.yearPicker = new YearPicker();
    }

    Array.from(inputs).forEach(input => {
        input.classList.add('year-picker-input');
        input.setAttribute('readonly', 'readonly');
        input.setAttribute('aria-haspopup', 'true');
        input.setAttribute('role', 'combobox');
        input.setAttribute('aria-label', 'Year picker input');

        if (options.minYear) {
            input.dataset.minYear = options.minYear;
        }
        if (options.maxYear) {
            input.dataset.maxYear = options.maxYear;
        }
        if (options.defaultYear) {
            input.value = options.defaultYear;
        }

        input.removeEventListener('click', input._yearPickerHandler);
        input.removeEventListener('touchstart', input._yearPickerHandler);

        input._yearPickerHandler = function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.yearPicker.showPicker(input);
        };
        input.addEventListener('click', input._yearPickerHandler);
        input.addEventListener('touchstart', input._yearPickerHandler, { passive: false });
    });

    return window.yearPicker;
};

window.addYearPicker = function(selector, options = {}) {
    const inputs = document.querySelectorAll(selector);
    const results = [];

    inputs.forEach(input => {
        if (input.id) {
            results.push(window.initYearPicker(input.id, options));
        } else {
            const generatedId = 'year-picker-' + Math.random().toString(36).substr(2, 9);
            input.id = generatedId;
            results.push(window.initYearPicker(generatedId, options));
        }
    });

    return results;
};

window.removeYearPicker = function(fieldId) {
    const input = document.getElementById(fieldId);
    if (input && input._yearPickerHandler) {
        input.removeEventListener('click', input._yearPickerHandler);
        input.removeEventListener('touchstart', input._yearPickerHandler);
        input.classList.remove('year-picker-input');
        input.removeAttribute('readonly');
        input.removeAttribute('aria-haspopup');
        input.removeAttribute('role');
        input.removeAttribute('aria-label');
        delete input._yearPickerHandler;
    }
};

window.initYearPickerForModal = function(fieldId, options = {}) {
    const picker = window.initYearPicker(fieldId, options);

    if (picker && picker.dropdown && options.zIndex) {
        picker.dropdown.style.zIndex = options.zIndex;
        picker.dropdown.setAttribute('data-manual-z-index', options.zIndex);
    }

    return picker;
};

window.setYearPickerZIndex = function(zIndex = 10001) {
    if (window.yearPicker && window.yearPicker.dropdown) {
        window.yearPicker.dropdown.style.zIndex = zIndex;
        window.yearPicker.dropdown.setAttribute('data-manual-z-index', zIndex);
    }
};

window.updateYearPicker = function(fieldId, options = {}) {
    const input = document.getElementById(fieldId);
    if (input) {
        if (options.minYear !== undefined) {
            input.dataset.minYear = options.minYear;
        }
        if (options.maxYear !== undefined) {
            input.dataset.maxYear = options.maxYear;
        }
        if (options.value !== undefined) {
            input.value = options.value;
        }
        if (options.zIndex !== undefined && window.yearPicker) {
            window.yearPicker.dropdown.style.zIndex = options.zIndex;
            window.yearPicker.dropdown.setAttribute('data-manual-z-index', options.zIndex);
        }
    }
};

window.clearYearPicker = function(fieldId) {
    const input = document.getElementById(fieldId);
    if (input && window.yearPicker) {
        const oldValue = input.value;
        input.value = '';
        input.classList.remove('year-picker-has-value');
        const changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(changeEvent);
        const yearClearEvent = new CustomEvent('yearCleared', {
            bubbles: true,
            detail: { oldValue: oldValue, input: input }
        });
        input.dispatchEvent(yearClearEvent);
    }
};

window.hasYearPickerValue = function(fieldId) {
    const input = document.getElementById(fieldId);
    return input ? !!input.value : false;
};

window.getYearPickerValue = function(fieldId) {
    const input = document.getElementById(fieldId);
    return input ? input.value : null;
};

window.setYearPickerValue = function(fieldId, year) {
    const input = document.getElementById(fieldId);
    if (input) {
        const oldValue = input.value;
        input.value = year;
        if (year) {
            input.classList.add('year-picker-has-value');
        } else {
            input.classList.remove('year-picker-has-value');
        }
        const changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(changeEvent);
        if (year) {
            const yearSelectEvent = new CustomEvent('yearSelected', {
                bubbles: true,
                detail: { year: year, input: input, programmatic: true }
            });
            input.dispatchEvent(yearSelectEvent);
        } else {
            const yearClearEvent = new CustomEvent('yearCleared', {
                bubbles: true,
                detail: { oldValue: oldValue, input: input, programmatic: true }
            });
            input.dispatchEvent(yearClearEvent);
        }
    }
};

window.resetYearPickerPositioning = function() {
    if (window.yearPicker && window.yearPicker.dropdown) {
        window.yearPicker.dropdown.removeAttribute('data-manual-z-index');
        window.yearPicker.dropdown.classList.remove('force-front');
        if (window.yearPicker.currentInput) {
            window.yearPicker.positionDropdown(window.yearPicker.currentInput);
        }
    }
};