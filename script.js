function validateText(value, minLen, maxLen, required) {
  // Ensuring parameters are of correct types
  if (typeof value !== 'string' || typeof minLen !== 'number' || typeof maxLen !== 'number' || typeof required !== 'boolean') {
    throw new Error('Invalid parameters for validateText');
  }
  if (required && !value.trim()) {
    return 'This field is required.';
  }
  // Only check length if value is provided (for non-required fields)
  if (value.trim() && (value.length < minLen || value.length > maxLen)) {
    return `Must be ${minLen}-${maxLen} characters.`;
  }
  return '';
}

function validateRequired(value) {
  return value && value.trim() !== '';
}

//Validating email address using regex
function validateEmail(value) {
  if (!validateRequired(value)) {
    return 'Email is required.';
  }
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(value)) {
    return 'Invalid email format.';
  }
  return '';
}

//Validating DoB (not in future, reasonable range)
function validateDateOfBirth(value) {
  if (!validateRequired(value)) {
    return 'Date of birth is required.';
  }
  const dob = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalising to date only for a more accurate comparsion
  dob.setHours(0, 0, 0, 0);
  if (dob > today) {
    return 'Date of birth cannot be in the future.';
  }
  const age = today.getFullYear() - dob.getFullYear();
  if (age < 0 || age > 120) {
    return 'Please enter a valid date of birth.';
  }
  return '';
}

//Valdiating phone number (01234-567890)
function validatePhone(value) {
  if (!validateRequired(value)) {
    return 'Phone number is required.';
  }
  const regex = /^[0-9]{5}-[0-9]{6}$/;
  if (!regex.test(value)) {
    return 'Invalid phone number format. Use 07123-456789.';
  }
  return '';
}

//Validating post/ZIP code depending on country
function validatePostalCode(value, country) {
  if (!validateRequired(value)) {
    return 'Postal/Zip code is required.';
  }
  const patterns = {
    'United States': /^\d{5}(-\d{4})?$/, // US ZIP
    'United Kingdom': /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/, // UK Postcode
    'default': /^[A-Za-z0-9\s\-]{3,10}$/
  };
  const regex = patterns[country] || patterns['default'];
  if (!regex.test(value)) {
    return `Invalid postal code for ${country}.`;
  }
  return '';
}

//Validating a single field
function validateField(fieldId) {
  const element = document.getElementById(fieldId);
  const errorSpan = document.getElementById(`error-${fieldId}`);
  let errorMsg = '';
  
  switch (fieldId) {
    case 'fName':
    case 'lName':
      errorMsg = validateText(element.value, 2, 50, fieldId === 'fName');
      break;
    case 'gender':
      errorMsg = validateRequired(element.value) ? '' : 'Gender is required.';
      break;
    case 'dateOfBirth':
      errorMsg = validateDateOfBirth(element.value);
      break;
    case 'address1':
    case 'city':
      errorMsg = validateText(element.value, 2, 100, true);
      break;
    case 'postzipcode':
      errorMsg = validatePostalCode(element.value, document.getElementById('country').value);
      break;
    case 'country':
      errorMsg = validateRequired(element.value) ? '' : 'Country is required.';
      break;
    case 'email':
      errorMsg = validateEmail(element.value);
      break;
    case 'phone':
      errorMsg = validatePhone(element.value);
      break;
    case 'terms':
      errorMsg = element.checked ? '' : 'You must accept the terms and conditions.';
      break;
  }
  
  errorSpan.textContent = errorMsg;
  element.classList.toggle('invalid', !!errorMsg);
  return !errorMsg;
}

//Validating all fields
function validateAllFields() {
  const fields = ['fName', 'lName', 'gender', 'dateOfBirth', 'address1', 'city', 'postzipcode', 'country', 'email', 'phone', 'terms'];
  let allValid = true;
  for (let i = 0; i < fields.length; i++) { // Loop style from answers.js
    if (!validateField(fields[i])) allValid = false;
  }
  return allValid;
}

//Unit test template
function test(message, assertion) {
  try {
    const result = assertion();
    console.log(result ? `Pass: ${message}` : `Fail: ${message}`);
  } catch (error) {
    console.error(`Error: ${message} ${error.message}`);
  }
}

// Event listeners)
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('myForm');
  const fields = ['fName', 'lName', 'gender', 'dateOfBirth', 'address1', 'city', 'postzipcode', 'country', 'email', 'phone', 'terms'];
  for (let i = 0; i < fields.length; i++) { // Listener attachment loop
    const element = document.getElementById(fields[i]);
    if (element) {
      element.addEventListener('blur', () => validateField(fields[i]));
      if (element.type === 'checkbox') {
        element.addEventListener('change', () => validateField(fields[i]));
      }
    }
  }
  const countryElement = document.getElementById('country');
  if (countryElement) {
    countryElement.addEventListener('change', () => validateField('postzipcode'));
  }
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateAllFields()) {
      alert('Form submitted successfully!');
    }
  });
});

// Basic field validations
test('validates required text field (first name)', () => validateText('John', 2, 50, true) === '');
test('validates non-required text field (last name)', () => validateText('Doe', 2, 50, true) === '');
test('validates text field too short', () => validateText('J', 2, 50, true) === 'Must be 2-50 characters.');
test('validates text field too long', () => validateText('A'.repeat(51), 2, 50, true) === 'Must be 2-50 characters.');
test('validates empty required text field', () => validateText('', 2, 50, true) === 'This field is required.');
test('validates empty non-required text field', () => validateText('', 2, 50, false) === '');

test('validates required selection (gender)', () => validateRequired('Male') === true);
test('validates empty required selection (gender)', () => validateRequired(' ') === false);

test('validates valid email', () => validateEmail('john.doe@example.com') === '');
test('validates invalid email (no @)', () => validateEmail('invalid') === 'Invalid email format.');
test('validates invalid email (no domain)', () => validateEmail('invalid@') === 'Invalid email format.');
test('validates empty email', () => validateEmail('') === 'Email is required.');

test('validates valid date of birth', () => validateDateOfBirth('1990-05-15') === '');
test('validates future date of birth', () => validateDateOfBirth('2026-05-15') === 'Date of birth cannot be in the future.');
test('validates invalid date of birth (too old)', () => validateDateOfBirth('1800-01-01') === 'Please enter a valid date of birth.');
test('validates empty date of birth', () => validateDateOfBirth('') === 'Date of birth is required.');

test('validates valid phone (exact pattern)', () => validatePhone('07123-456789') === '');
test('validates invalid phone (wrong length)', () => validatePhone('07123-45678') === 'Invalid phone number format. Use 07123-456789.');
test('validates invalid phone (no dash)', () => validatePhone('07123456789') === 'Invalid phone number format. Use 07123-456789.');
test('validates invalid phone (non-numeric)', () => validatePhone('abcde-123456') === 'Invalid phone number format. Use 07123-456789.');
test('validates empty phone', () => validatePhone('') === 'Phone number is required.');

test('validates valid US postal code', () => validatePostalCode('10001', 'United States') === '');
test('validates valid US postal code with extension', () => validatePostalCode('10001-1234', 'United States') === '');
test('validates invalid US postal code', () => validatePostalCode('ABCDE', 'United States') === 'Invalid postal code for United States.');
test('validates valid UK postal code', () => validatePostalCode('SW1A 1AA', 'United Kingdom') === '');
test('validates invalid UK postal code', () => validatePostalCode('12345', 'United Kingdom') === 'Invalid postal code for United Kingdom.');
test('validates default postal code (unknown country)', () => validatePostalCode('12345', 'Unknown') === '');
test('validates empty postal code', () => validatePostalCode('', 'United States') === 'Postal/Zip code is required.');

// Full form validation
test('validates full form with valid data', () => {
  const mockElements = {
    fName: { value: 'Alfred', classList: { toggle: () => {} } },
    lName: { value: 'Osagiede', classList: { toggle: () => {} } },
    gender: { value: 'Male', classList: { toggle: () => {} } },
    dateOfBirth: { value: '2006-02-27', classList: { toggle: () => {} } },
    address1: { value: '123 Main St', classList: { toggle: () => {} } },
    city: { value: 'London', classList: { toggle: () => {} } },
    postzipcode: { value: 'AB12 3CD', classList: { toggle: () => {} } },
    country: { value: 'United Kingdom', classList: { toggle: () => {} } },
    email: { value: 'alf.osa@example.com', classList: { toggle: () => {} } },
    phone: { value: '07123-456789', classList: { toggle: () => {} } },
    terms: { checked: true, classList: { toggle: () => {} } }
  };
  const originalGetElementById = document.getElementById;
  document.getElementById = (id) => mockElements[id] || { value: '', checked: false, classList: { toggle: () => {} } };
  const result = validateAllFields();
  document.getElementById = originalGetElementById
  return result === true;
});

test('validates full form with invalid data (missing required)', () => {
  const mockElements = {
    fName: { value: '', classList: { toggle: () => {} } }, //Missing
    lName: { value: 'Doe', classList: { toggle: () => {} } },
    gender: { value: 'Male', classList: { toggle: () => {} } },
    dateOfBirth: { value: '1990-05-15', classList: { toggle: () => {} } },
    address1: { value: '123 Main St', classList: { toggle: () => {} } },
    city: { value: 'New York', classList: { toggle: () => {} } },
    postzipcode: { value: '10001', classList: { toggle: () => {} } },
    country: { value: 'United States', classList: { toggle: () => {} } },
    email: { value: 'john.doe@example.com', classList: { toggle: () => {} } },
    phone: { value: '07123-456789', classList: { toggle: () => {} } },
    terms: { checked: true, classList: { toggle: () => {} } }
  };
  const originalGetElementById = document.getElementById;
  document.getElementById = (id) => mockElements[id] || { value: '', checked: false, classList: { toggle: () => {} } };
  const result = validateAllFields();
  document.getElementById = originalGetElementById;
  return result === false;
});

test('validates full form with cross-field invalid (postal for country)', () => {
  const mockElements = {
    fName: { value: 'John', classList: { toggle: () => {} } },
    lName: { value: 'Doe', classList: { toggle: () => {} } },
    gender: { value: 'Male', classList: { toggle: () => {} } },
    dateOfBirth: { value: '1990-05-15', classList: { toggle: () => {} } },
    address1: { value: '123 Main St', classList: { toggle: () => {} } },
    city: { value: 'London', classList: { toggle: () => {} } },
    postzipcode: { value: '10001', classList: { toggle: () => {} } }, //Invalid postcode for UK
    country: { value: 'United Kingdom', classList: { toggle: () => {} } },
    email: { value: 'john.doe@example.com', classList: { toggle: () => {} } },
    phone: { value: '07123-456789', classList: { toggle: () => {} } },
    terms: { checked: true, classList: { toggle: () => {} } }
  };
  const originalGetElementById = document.getElementById;
  document.getElementById = (id) => mockElements[id] || { value: '', checked: false, classList: { toggle: () => {} } };
  const result = validateAllFields();
  document.getElementById = originalGetElementById;
  return result === false;
});
