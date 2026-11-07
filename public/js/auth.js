const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

async function submitAuth(form, endpoint) {
  const message = document.getElementById('message');
  const button = form.querySelector('button[type="submit"]');
  const values = Object.fromEntries(new FormData(form).entries());

  if (values.email) values.email = values.email.trim().toLowerCase();

  try {
    if (button) button.disabled = true;
    showMessage(message, 'Please wait...');

    const result = await api(`/api/customers/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(values)
    });

    showMessage(message, result.message || 'Success');
    // Registration creates the customer session; login creates it after password verification.
    window.location.href = 'rooms.html';
  } catch (error) {
    showMessage(message, error.message || 'Unable to complete the request.', true);
    console.error('Customer authentication error:', error);
  } finally {
    if (button) button.disabled = false;
  }
}

loginForm?.addEventListener('submit', event => {
  event.preventDefault();
  submitAuth(loginForm, 'login');
});

registerForm?.addEventListener('submit', event => {
  event.preventDefault();
  submitAuth(registerForm, 'register');
});
