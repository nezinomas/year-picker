# YearPicker

A modern, lightweight JavaScript year picker component designed for Django input fields. Features a clean dropdown interface with decade navigation, customizable year ranges, and full modal support.

## Features

- **Clean UI**: Modern dropdown interface with decade-based navigation (12 years per view)
- **Modal Compatible**: Intelligent z-index handling and positioning for modals
- **Customizable Ranges**: Set minimum and maximum year constraints
- **Responsive Design**: Mobile-friendly with adaptive layouts
- **Django Integration**: Designed specifically for Django forms and input fields
- **Event System**: Custom events for form integration and validation
- **Accessibility**: Keyboard navigation and screen reader support
- **Auto-positioning**: Smart dropdown positioning that adjusts to viewport boundaries
- **Zero Dependencies**: Pure vanilla JavaScript implementation

## Project Structure

```
year-picker/
├── src/
│   ├── year-picker.js      # Source JavaScript
│   └── year-picker.css     # Source CSS
├── dist/
│   ├── year-picker.min.js  # Minified JavaScript
│   ├── year-picker.min.js.map
│   └── year-picker.min.css # Minified CSS
├── examples/
│   ├── basic.html          # Basic usage example
│   └── django-example.html # Django integration
├── package.json
├── README.md
├── LICENSE
└── .gitignore
```

## Installation

### Option 1: Direct Download

1. Download the files from the `dist/` directory
2. Copy to your Django static files directory:
   ```
   static/
   ├── css/
   │   └── year-picker.min.css
   └── js/
       └── year-picker.min.js
   ```

3. Include in your template:
   ```html
   {% load static %}
   <link rel="stylesheet" href="{% static 'css/year-picker.min.css' %}">
   <script src="{% static 'js/year-picker.min.js' %}"></script>
   ```

### Option 2: Development Version

Use the source files from `src/` for development:

```html
{% load static %}
<link rel="stylesheet" href="{% static 'css/year-picker.css' %}">
<script src="{% static 'js/year-picker.js' %}"></script>
```

### Option 3: NPM (Future)

```bash
npm install django-year-picker
```

## Basic Usage

### HTML Setup

Add the `year-picker-input` class to any input field:

```html
<input type="text" id="year-field" class="year-picker-input" 
       data-min-year="1950" data-max-year="2030" placeholder="Select year">
```

The year picker will automatically initialize when the page loads.

### Django Forms Integration

```python
# forms.py
from django import forms

class MyForm(forms.Form):
    birth_year = forms.CharField(
        max_length=4,
        widget=forms.TextInput(attrs={
            'class': 'form-control year-picker-input',
            'data-min-year': '1900',
            'data-max-year': '2023',
            'placeholder': 'Select birth year'
        })
    )
```

## Configuration Options

### Data Attributes

Configure individual fields using HTML data attributes:

- `data-min-year`: Minimum selectable year (default: 1900)
- `data-max-year`: Maximum selectable year (default: 2100)

```html
<input type="text" class="year-picker-input" 
       data-min-year="2000" 
       data-max-year="2050">
```

## JavaScript API

### Initialization Functions

#### `initYearPicker(fieldClass, options)`
Initialize year picker for elements with a specific class:

```javascript
// Initialize for elements with class 'my-year-field'
initYearPicker('my-year-field', {
    minYear: 1980,
    maxYear: 2030,
    defaultYear: 2023
});
```

#### `addYearPicker(selector, options)`
Add year picker to elements matching a CSS selector:

```javascript
// Add to all inputs with class 'year-input'
addYearPicker('.year-input', {
    minYear: 2000,
    maxYear: 2050
});
```

### Modal Support Functions

#### `initYearPickerForModal(fieldId, options)`
Initialize with manual z-index override for modals:

```javascript
initYearPickerForModal('modal-year-field', {
    minYear: 1990,
    maxYear: 2030,
    zIndex: 10000
});
```

#### `setYearPickerZIndex(zIndex)`
Set z-index for existing year picker:

```javascript
setYearPickerZIndex(99999);
```

### Value Management Functions

#### `setYearPickerValue(fieldId, year)`
```javascript
setYearPickerValue('my-field', 2023);
```

#### `getYearPickerValue(fieldId)`
```javascript
const year = getYearPickerValue('my-field');
```

#### `clearYearPicker(fieldId)`
```javascript
clearYearPicker('my-field');
```

#### `hasYearPickerValue(fieldId)`
```javascript
const hasValue = hasYearPickerValue('my-field');
```

### Configuration Functions

#### `updateYearPicker(fieldId, options)`
Update field configuration:

```javascript
updateYearPicker('my-field', {
    minYear: 2020,
    maxYear: 2030,
    value: 2025
});
```

#### `removeYearPicker(fieldId)`
Remove year picker from a field:

```javascript
removeYearPicker('my-field');
```

## Events

The year picker dispatches custom events for integration:

### yearSelected Event
Triggered when a year is selected:

```javascript
document.getElementById('my-field').addEventListener('yearSelected', function(e) {
    console.log('Selected year:', e.detail.year);
    console.log('Input element:', e.detail.input);
    console.log('Programmatic:', e.detail.programmatic); // true if set via API
});
```

### yearCleared Event
Triggered when the field is cleared:

```javascript
document.getElementById('my-field').addEventListener('yearCleared', function(e) {
    console.log('Cleared year:', e.detail.oldValue);
    console.log('Input element:', e.detail.input);
});
```

### change Event
Standard change event is also triggered for form compatibility:

```javascript
document.getElementById('my-field').addEventListener('change', function(e) {
    console.log('Field changed:', e.target.value);
});
```

## Styling

### CSS Classes

The component uses these CSS classes for styling:

- `.year-picker-input`: Applied to input fields
- `.year-picker-dropdown`: Main dropdown container
- `.year-picker-has-value`: Added when field has a value
- `.year-item.selected`: Currently selected year
- `.year-item.selectable`: Selectable years
- `.year-item.disabled`: Disabled years (outside min/max range)

### Custom Styling Example

```css
/* Custom input styling */
.year-picker-input {
    border: 2px solid #e9ecef;
    border-radius: 8px;
    padding: 12px;
    font-size: 16px;
}

.year-picker-input:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

/* Custom dropdown styling */
.year-picker-dropdown {
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

/* Custom year item styling */
.year-item.selected {
    background: #28a745;
    border-color: #1e7e34;
}
```

## Django Template Examples

### Basic Form

```html
<!-- template.html -->
{% load static %}
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="{% static 'css/year_picker.css' %}">
</head>
<body>
    <form method="post">
        {% csrf_token %}
        {{ form.as_p }}
        <button type="submit">Submit</button>
    </form>
    
    <script src="{% static 'js/year_picker.js' %}"></script>
</body>
</html>
```

### Bootstrap Modal Integration

```html
<!-- Modal with year picker -->
<div class="modal fade" id="myModal">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-body">
                <input type="text" id="modal-year" class="form-control year-picker-input" 
                       data-min-year="2000" data-max-year="2030">
            </div>
        </div>
    </div>
</div>

<script>
// Initialize for modal with higher z-index
$('#myModal').on('shown.bs.modal', function() {
    initYearPickerForModal('modal-year', {
        zIndex: 10000
    });
});
</script>
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Internet Explorer 11 (with polyfills)

## Dependencies

- No external JavaScript dependencies
- Pure vanilla JavaScript implementation
- CSS uses modern features (Grid, Flexbox)

## License

This project is open source. Feel free to use and modify according to your needs.

## Contributing

When contributing:

1. Maintain backward compatibility
2. Test with different modal libraries (Bootstrap, Material-UI, etc.)
3. Ensure responsive design works on all screen sizes
4. Follow existing code style and patterns
5. Update this README for any new features

## Changelog

### v1.0.0
- Initial release
- Basic year picker functionality
- Modal support with automatic z-index detection
- Responsive design
- Django form integration
- Custom event system
- Comprehensive JavaScript API