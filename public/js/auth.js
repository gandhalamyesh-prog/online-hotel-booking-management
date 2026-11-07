
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

async function submitAuth(form, endpoint) {
    const message = document.getElementById('message');
    const button = form.querySelector('button[type="submit"]');

    try {
        button.disabled = true;
        message.textContent = 'Please wait...';
        message.style.color = '#555';

        // Get details entered by the customer
        const formData = new FormData(form);

        const customerData = {
            email: formData.get('email').trim().toLowerCase(),
            password: formData.get('password')
        };

        // Send customer details to Express backend
        const response = await fetch(`/api/customers/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(customerData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Login failed.');
        }

        message.textContent = result.message;
        message.style.color = 'green';

        // Redirect after successful login
        window.location.href = 'rooms.html';

    } catch (error) {
        message.textContent = error.message;
        message.style.color = 'red';
        console.error('Login error:', error);

    } finally {
        button.disabled = false;
    }
}

// Customer login
loginForm?.addEventListener('submit', function(event) {
    event.preventDefault();
    submitAuth(loginForm, 'login');
});

// Customer registration
registerForm?.addEventListener('submit', function(event) {
    event.preventDefault();
    submitAuth(registerForm, 'register');
});
