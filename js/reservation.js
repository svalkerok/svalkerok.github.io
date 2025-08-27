// API Configuration
const API = {
    BASE_URL: '/api',
    ENDPOINTS: {
        AVAILABILITY: '/available-times',
        RESERVATIONS: '/reservations'
    },
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000 // 1 second
};

// State Management
let availabilityCache = new Map();
let currentRetries = 0;

// Utility Functions
const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
};

const isMonday = (date) => {
    return new Date(date).getDay() === 1; // Monday is 1
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPhone = (phone) => {
    const phoneRegex = /^[\d\s\(\)\-\+]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

// API Interaction Functions
async function fetchWithRetry(url, options = {}, retries = API.MAX_RETRIES) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, API.RETRY_DELAY));
            return fetchWithRetry(url, options, retries - 1);
        }
        throw error;
    }
}

async function checkAvailability(date) {
    // Check cache first
    if (availabilityCache.has(date)) {
        return availabilityCache.get(date);
    }

    // For demo purposes, generate mock time slots for valid dates
    if (isDateInPast(date) || isMonday(date)) {
        const result = { available: false, timeSlots: [], message: isMonday(date) ? 'Restaurant closed on Mondays' : 'Date is in the past' };
        availabilityCache.set(date, result);
        return result;
    }

    // Generate mock available time slots
    const timeSlots = [
        { time: '5:00 PM', available: true },
        { time: '5:30 PM', available: true },
        { time: '6:00 PM', available: true },
        { time: '6:30 PM', available: true },
        { time: '7:00 PM', available: true },
        { time: '7:30 PM', available: true },
        { time: '8:00 PM', available: true },
        { time: '8:30 PM', available: true },
        { time: '9:00 PM', available: true }
    ];

    const result = { available: true, timeSlots };
    availabilityCache.set(date, result);
    return result;
}

async function submitReservation(formData) {
    try {
        const response = await fetchWithRetry(`${API.BASE_URL}${API.ENDPOINTS.RESERVATIONS}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        return response;
    } catch (error) {
        console.error('Error submitting reservation:', error);
        throw new Error('Unable to submit reservation. Please try again later.');
    }
}

// UI Update Functions
function updateTimeSlots(availableTimes, selectedTime = '') {
    const timeSelect = document.getElementById('time');
    timeSelect.innerHTML = '<option value="">Select time</option>';
    timeSelect.disabled = !availableTimes || availableTimes.length === 0;

    if (!availableTimes || availableTimes.length === 0) {
        showAvailabilityMessage('No available time slots for selected date', 'error');
        return;
    }

    availableTimes.forEach(slot => {
        if (slot.available) {
            const option = document.createElement('option');
            option.value = slot.time;
            option.textContent = slot.time;
            if (slot.time === selectedTime) {
                option.selected = true;
            }
            timeSelect.appendChild(option);
        }
    });
}

function showAvailabilityMessage(message, type = 'info') {
    const messageElement = document.querySelector('.availability-message');
    messageElement.textContent = message;
    messageElement.className = `availability-message ${type}`;
}

function showSubmissionMessage(message, type = 'success') {
    const messageElement = document.querySelector('.submission-message');
    messageElement.textContent = message;
    messageElement.className = `submission-message ${type}`;
}

function toggleLoadingState(form, isLoading) {
    const submitButton = form.querySelector('button[type="submit"]');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoader = submitButton.querySelector('.button-loader');
    const inputs = form.querySelectorAll('input, select, textarea');

    submitButton.disabled = isLoading;
    buttonText.classList.toggle('hidden', isLoading);
    buttonLoader.classList.toggle('hidden', !isLoading);
    inputs.forEach(input => input.disabled = isLoading);
}

// Form Validation
function validateForm(form) {
    let isValid = true;
    const formData = new FormData(form);
    
    // Clear previous errors
    form.querySelectorAll('.error-message').forEach(error => error.textContent = '');
    
    // Validate required fields
    for (const [name, value] of formData.entries()) {
        const input = form.querySelector(`[name="${name}"]`);
        if (input.hasAttribute('required') && !value.trim()) {
            showFieldError(input, input.dataset.error || 'This field is required');
            isValid = false;
        }
    }

    // Validate email format
    const email = formData.get('email');
    if (email && !isValidEmail(email)) {
        showFieldError(form.querySelector('[name="email"]'), 'Please enter a valid email address');
        isValid = false;
    }

    // Validate phone format
    const phone = formData.get('phone');
    if (phone && !isValidPhone(phone)) {
        showFieldError(form.querySelector('[name="phone"]'), 'Please enter a valid phone number');
        isValid = false;
    }

    // Validate date
    const date = formData.get('date');
    if (date && (isDateInPast(date) || isMonday(date))) {
        showFieldError(
            form.querySelector('[name="date"]'),
            isMonday(date) ? 'We are closed on Mondays' : 'Please select a future date'
        );
        isValid = false;
    }

    return isValid;
}

function showFieldError(field, message) {
    const errorElement = document.getElementById(`${field.id}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        field.setAttribute('aria-invalid', 'true');
    }
}

// Event Handlers
function initReservationForm() {
    const form = document.getElementById('reservationForm');
    const dateInput = document.getElementById('date');

    // Set minimum date to today
    const today = new Date();
    dateInput.min = formatDate(today);

    // Date change handler
    dateInput.addEventListener('change', async (e) => {
        const date = e.target.value;
        
        if (!date || isDateInPast(date) || isMonday(date)) {
            updateTimeSlots([]);
            return;
        }

        try {
            toggleLoadingState(form, true);
            const availability = await checkAvailability(date);
            updateTimeSlots(availability.timeSlots || []);
        } catch (error) {
            showAvailabilityMessage(error.message, 'error');
        } finally {
            toggleLoadingState(form, false);
        }
    });

    // Form submission handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm(form)) {
            return;
        }

        const formData = new FormData(form);
        
        try {
            toggleLoadingState(form, true);
            const response = await submitReservation(formData);
            
            showSubmissionMessage(
                'Reservation submitted successfully! Check your email for confirmation.',
                'success'
            );
            
            // Clear form
            form.reset();
            updateTimeSlots([]);
            
        } catch (error) {
            showSubmissionMessage(error.message, 'error');
        } finally {
            toggleLoadingState(form, false);
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initReservationForm);