/* ============================================================
   hero-anim.js — Apple-style 3D Hero Animations
   Handles Canvas particles, Mouse Parallax, and Scroll Reveal
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initCanvasParticles();
    initMouseParallax();
    initScrollReveal();
});

/* ---------------------------------------------------------
   1. Canvas Particle System (Rising Grid Lines)
   --------------------------------------------------------- */
function initCanvasParticles() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    
    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || window.innerWidth <= 768) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    // Brand color (Gold) for some particles
    const accentColor = 'rgba(216, 154, 43, ';
    const whiteColor = 'rgba(255, 255, 255, ';

    function resize() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    }
    
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.reset(true);
        }
        
        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : height + 10;
            this.size = Math.random() * 1.5 + 0.5; // Very subtle
            this.speed = Math.random() * 0.5 + 0.1; // Slow rise
            this.opacity = Math.random() * 0.3 + 0.1; // Low opacity
            this.isGold = Math.random() > 0.8; // 20% are gold
            this.length = Math.random() * 40 + 10; // Line length
        }
        
        update() {
            this.y -= this.speed;
            if (this.y < -this.length) {
                this.reset();
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + this.length);
            
            const colorBase = this.isGold ? accentColor : whiteColor;
            ctx.strokeStyle = colorBase + this.opacity + ')';
            ctx.lineWidth = this.size;
            ctx.stroke();
        }
    }

    // Create particles
    const particleCount = Math.floor(width / 20); // Scale with screen size
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

/* ---------------------------------------------------------
   2. Mouse Parallax Effect
   --------------------------------------------------------- */
function initMouseParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || window.innerWidth <= 768) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const lerpFactor = 0.05; // Smoothness

    hero.addEventListener('mousemove', (e) => {
        // Normalize mouse coordinates from -1 to 1 based on hero center
        const rect = hero.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        targetX = ((e.clientX - centerX) / (rect.width / 2));
        targetY = ((e.clientY - centerY) / (rect.height / 2));
    });

    hero.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
    });

    function render() {
        // Lerp for buttery smooth movement
        currentX += (targetX - currentX) * lerpFactor;
        currentY += (targetY - currentY) * lerpFactor;
        
        // Update CSS variables
        hero.style.setProperty('--mx', currentX.toFixed(4));
        hero.style.setProperty('--my', currentY.toFixed(4));
        
        requestAnimationFrame(render);
    }
    
    render();
}

/* ---------------------------------------------------------
   3. Scroll Reveal & Fade
   --------------------------------------------------------- */
function initScrollReveal() {
    const hero = document.querySelector('.hero');
    const rightText = document.querySelector('.hero-right-text');
    if (!hero) return;

    // Reveal right panel after initial animation
    setTimeout(() => {
        if (rightText) rightText.classList.add('revealed');
    }, 3000); // Wait for entry animations to finish

    // Fade out hero content smoothly on scroll
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const heroHeight = hero.offsetHeight;
        
        // Fade out starts after scrolling 10% of hero height
        if (scrollY > heroHeight * 0.1) {
            const opacity = 1 - (scrollY - heroHeight * 0.1) / (heroHeight * 0.5);
            // hero.style.opacity = Math.max(0, opacity);
            if (opacity <= 0) {
                 hero.classList.add('fade-out');
            } else {
                 hero.classList.remove('fade-out');
            }
        } else {
            hero.classList.remove('fade-out');
            // hero.style.opacity = 1;
        }
    });
}
