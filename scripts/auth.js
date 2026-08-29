/**
 * auth.js
 * Handles client-side authentication using the Neon DB backend.
 */

const SESSION_KEY = 'buildwise-session-v2';

function getSession() {
    try {
        const data = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

function setSession(user, remember = false) {
    if (remember) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    // Determine path based on current location
    const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
    window.location.href = basePath + 'login.html';
}

async function handleSignup(name, email, password) {
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (data.success) {
            setSession(data.user, false);
            return { success: true };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return { 
            success: false, 
            message: 'Unable to connect to the server. Please try again later.' 
        };
    }
}

async function handleLogin(email, password, remember = false) {
    // Secret Local Bypass
    if (email === 'admin' && password === 'admin123') {
        const adminUser = {
            id: 'admin-secret',
            name: 'Project Administrator',
            email: 'admin@buildwise.local',
            initials: 'PA',
            role: 'Admin',
            projects: 142,
            created_at: new Date().toISOString()
        };
        setSession(adminUser, remember);
        return { success: true };
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            setSession(data.user, remember);
            return { success: true };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return { 
            success: false, 
            message: 'Unable to connect to the server. Please try again later.' 
        };
    }
}

// Make globally available
window.Auth = {
    getSession,
    setSession,
    clearSession,
    handleSignup,
    handleLogin
};
