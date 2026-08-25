// Initialize theme from local storage
const savedTheme = localStorage.getItem('buildwise-theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

async function loadComponents() {
    try {
        const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
        
        // Load Navbar
        const navRes = await fetch(basePath + 'components/navbar.html?v=' + new Date().getTime());
        if (navRes.ok) {
            let navHtml = await navRes.text();
            
            // Adjust links in navbar dynamically if we are not at the root
            if (basePath === '../') {
                navHtml = navHtml.replace(/href="\/index\.html/g, 'href="../index.html');
                navHtml = navHtml.replace(/href="\/pages\//g, 'href="./');
            } else {
                navHtml = navHtml.replace(/href="\/index\.html/g, 'href="./index.html');
                navHtml = navHtml.replace(/href="\/pages\//g, 'href="./pages/');
            }
            
            document.getElementById('navbar-container').innerHTML = navHtml;
            initNavbarFunctions();
            
            // Inject auth.js if not present, then update navbar
            if (!document.querySelector('script[src*="auth.js"]')) {
                const script = document.createElement('script');
                script.src = basePath + 'scripts/auth.js';
                script.onload = () => {
                    if (window.updateNavbarUser) updateNavbarUser();
                };
                document.head.appendChild(script);
            } else if (window.updateNavbarUser) {
                updateNavbarUser();
            }
        }

        // Load Footer
        const footRes = await fetch(basePath + 'components/footer.html');
        if (footRes.ok) {
            const footHtml = await footRes.text();
            document.getElementById('footer-container').innerHTML = footHtml;
        }
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

function initNavbarFunctions() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add scroll effect for navbar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Mobile Menu Toggle
    const hamburger = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }




    // Simple Profile Dropdown Logic
    const simpleAvatarBtn = document.getElementById('simple-avatar-btn');
    const simpleDropdownMenu = document.getElementById('simple-dropdown-menu');
    
    if (simpleAvatarBtn && simpleDropdownMenu) {
        simpleAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (simpleDropdownMenu.style.display === 'flex') {
                simpleDropdownMenu.style.display = 'none';
            } else {
                simpleDropdownMenu.style.display = 'flex';
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!simpleDropdownMenu.contains(e.target) && e.target !== simpleAvatarBtn) {
                simpleDropdownMenu.style.display = 'none';
            }
        });
    }

    // Theme Toggle Logic
    const themeToggleRow = document.getElementById('theme-toggle-row');
    const themeToggleSwitch = document.getElementById('theme-toggle-switch');
    
    if (themeToggleRow && themeToggleSwitch) {
        // Sync initial state
        const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        if (initialTheme === 'dark') {
            themeToggleSwitch.classList.add('active');
        } else {
            themeToggleSwitch.classList.remove('active');
        }

        themeToggleRow.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('buildwise-theme', newTheme);
            
            if (newTheme === 'dark') {
                themeToggleSwitch.classList.add('active');
            } else {
                themeToggleSwitch.classList.remove('active');
            }
        });
    }

}

document.addEventListener('DOMContentLoaded', () => {
    // Load components first
    loadComponents();

    // Simple reveal animation for sections
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply initial styles and observe
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        if (!section.classList.contains('hero')) {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(section);
        }
    });

    // Stats Counter Animation
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counters = document.querySelectorAll('.count');
                    // duration control (higher = slower)
                    const speed = 40; 
                    
                    counters.forEach(counter => {
                        const target = +counter.getAttribute('data-target');
                        let count = 0;
                        const inc = target / speed;
                        
                        const updateCount = () => {
                            count += inc;
                            if (count < target) {
                                counter.innerText = Math.ceil(count).toString().padStart(2, '0');
                                setTimeout(updateCount, 40);
                            } else {
                                counter.innerText = target.toString().padStart(2, '0');
                            }
                        };
                        updateCount();
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statsObserver.observe(statsSection);
    }
});

// Update navbar avatar dynamically based on session
window.updateNavbarUser = function() {
    try {
        const session = typeof Auth !== 'undefined' ? Auth.getSession() : null;
        const avatarContainer = document.getElementById('avatar-dropdown-container');
        const avatar = document.getElementById('simple-avatar-btn');
        const loginLink = document.getElementById('nav-login-link');
        
        if (session) {
            if (avatarContainer) avatarContainer.style.display = 'block';
            if (loginLink) loginLink.style.display = 'none';
            if (avatar) avatar.textContent = session.initials;
        } else {
            if (avatarContainer) avatarContainer.style.display = 'none';
            if (loginLink) loginLink.style.display = 'block';
        }
    } catch (err) {
        console.error("Navbar update error:", err);
    }
};
