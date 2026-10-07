document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('reviews-container');
    const loading = document.getElementById('reviews-loading');
    const emptyState = document.getElementById('empty-state');
    const statsSection = document.getElementById('reviews-stats');

    try {
        const res = await fetch('/api/reviews');
        const data = await res.json();
        
        loading.classList.add('d-none');

        if (data.success && data.reviews && data.reviews.length > 0) {
            const reviews = data.reviews;
            
            // Calculate stats
            const total = reviews.length;
            const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
            const avg = (sum / total).toFixed(1);
            
            document.getElementById('total-reviews').textContent = total;
            document.getElementById('avg-rating').textContent = avg;
            document.getElementById('avg-stars').textContent = getStarString(Math.round(avg));
            
            statsSection.style.display = 'flex';

            // Render cards
            reviews.forEach(review => {
                const card = document.createElement('div');
                card.className = 'review-card';
                
                const date = new Date(review.created_at).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric'
                });
                
                const templateHtml = review.template_name 
                    ? `<div class="review-template">${review.template_name}</div>` 
                    : '';
                
                const reviewText = review.review_text 
                    ? `"${review.review_text}"` 
                    : `<span class="text-muted">No written review</span>`;

                card.innerHTML = `
                    <div class="review-stars">${getStarString(review.rating)}</div>
                    <div class="review-text">${reviewText}</div>
                    <div class="review-meta">
                        <div>
                            <div class="review-author">${review.user_name}</div>
                            <div class="review-date">${date}</div>
                        </div>
                        ${templateHtml}
                    </div>
                `;
                container.appendChild(card);
            });
        } else {
            emptyState.classList.remove('d-none');
        }
    } catch (err) {
        console.error('Failed to load reviews:', err);
        loading.innerHTML = `<div class="alert alert-danger">Failed to load reviews. Please try again later.</div>`;
    }
});

function getStarString(rating) {
    let str = '';
    for (let i = 1; i <= 5; i++) {
        str += i <= rating ? '★' : '☆';
    }
    return str;
}
