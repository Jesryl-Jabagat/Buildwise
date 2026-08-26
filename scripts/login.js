// login.js - Handles UI and interaction logic for the login page

document.addEventListener('DOMContentLoaded', () => {
    // 1. Redirect if already logged in
    if (typeof Auth !== 'undefined' && Auth.getSession()) {
        window.location.href = 'pages/profile.html';
        return; // Stop execution if redirecting
    }

    // 2. Tab switching logic
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form-container').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.target}-form-container`).classList.add('active');
        });
    });

    // 3. Password visibility toggle
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const input = e.target.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                e.target.textContent = 'Hide';
            } else {
                input.type = 'password';
                e.target.textContent = 'Show';
            }
        });
    });

    // 4. Toast notification helper
    function showToast(message, type = 'error') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Check for auth notice
    const authNotice = sessionStorage.getItem('authNotice');
    if (authNotice) {
        showToast(authNotice, 'error');
        sessionStorage.removeItem('authNotice');
    }

    // 5. Handle Login Form Submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const remember = document.getElementById('login-remember').checked;
            
            const result = await Auth.handleLogin(email, password, remember);
            if (result.success) {
                showToast('Login successful!', 'success');
                setTimeout(() => window.location.href = 'pages/profile.html', 1000);
            } else {
                showToast(result.message);
            }
        });
    }

    // 6. Handle Signup Form Submission
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const pass = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm').value;

            if (pass !== confirm) {
                return showToast('Passwords do not match');
            }
            if (pass.length < 6) {
                return showToast('Password must be at least 6 characters');
            }

            const result = await Auth.handleSignup(name, email, pass);
            if (result.success) {
                showToast('Account created successfully!', 'success');
                setTimeout(() => window.location.href = 'pages/profile.html', 1000);
            } else {
                showToast(result.message);
            }
        });
    }
});
