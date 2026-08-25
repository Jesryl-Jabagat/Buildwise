document.addEventListener('DOMContentLoaded', () => {
    
    // Materials Accordion Logic
    const matsHeaders = document.querySelectorAll('.mats-header');
    
    matsHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            
            // Toggle current
            if (item.classList.contains('expanded')) {
                item.classList.remove('expanded');
            } else {
                // Close others
                document.querySelectorAll('.mats-item').forEach(i => i.classList.remove('expanded'));
                // Open clicked
                item.classList.add('expanded');
            }
        });
    });

    // Intersection Observer for advanced animations
    const hiwObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const hiwObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                
                // AI Checklist stagger animation
                if (entry.target.classList.contains('ai-processing-box')) {
                    const listItems = entry.target.querySelectorAll('.ai-checklist li');
                    listItems.forEach((li, index) => {
                        setTimeout(() => {
                            li.style.opacity = '1';
                            li.style.transform = 'translateX(0)';
                        }, index * 300);
                    });
                }
                
                // Budget Bars animation
                if (entry.target.classList.contains('budget-bars')) {
                    const fills = entry.target.querySelectorAll('.budget-bar-fill');
                    fills.forEach(fill => {
                        const targetWidth = fill.style.width;
                        fill.style.width = '0';
                        setTimeout(() => {
                            fill.style.width = targetWidth;
                        }, 200);
                    });
                }

                observer.unobserve(entry.target);
            }
        });
    }, hiwObserverOptions);

    // Setup AI Checklist initial state
    const aiBox = document.querySelector('.ai-processing-box');
    if (aiBox) {
        const items = aiBox.querySelectorAll('.ai-checklist li');
        items.forEach(li => {
            li.style.opacity = '0';
            li.style.transform = 'translateX(-20px)';
            li.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        });
        hiwObserver.observe(aiBox);
    }

    // Setup Budget Bars initial state
    const budgetBars = document.querySelector('.budget-bars');
    if (budgetBars) {
        const fills = budgetBars.querySelectorAll('.budget-bar-fill');
        fills.forEach(fill => {
            fill.style.transition = 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)';
        });
        hiwObserver.observe(budgetBars);
    }
});
