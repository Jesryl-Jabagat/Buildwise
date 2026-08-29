import { houseTypes, currency } from "../house-data.js";
import { generateEstimate } from "../estimator/aggregator.js";
import { initRenderer } from "./renderer3d.js";

function setupPDFPage() {
    let stored = null;
    try {
        stored = JSON.parse(localStorage.getItem("buildwiseResult") || "null");
    } catch (e) {
        console.error("Failed to parse buildwiseResult:", e);
    }
    
    if (!stored) {
        alert("No plan data found. Please configure a house first.");
        window.location.href = "designs.html";
        return;
    }
    
    const fallbackType = houseTypes[stored.typeKey] || houseTypes["loft"];
    const data = stored;
    
    // Header
    const d = new Date();
    document.getElementById("pdf-title").innerText = `${data.title} — ${data.floorArea} sqm`;
    document.getElementById("pdf-date").innerText = `Generated on ${d.toLocaleDateString()}`;
    
    // Stats
    const budget = Number(data.budget) || 0;
    document.getElementById("pdf-area").innerText = `${data.floorArea} sqm`;
    document.getElementById("pdf-budget").innerText = currency.format(budget);
    
    // Run Estimator
    const estimateData = generateEstimate(data);
    
    if (!estimateData.error) {
        document.getElementById("pdf-estimate").innerText = currency.format(estimateData.summary.grandTotal);
        
        // Detailed Materials List
        const matTbody = document.getElementById("pdf-materials-tbody");
        estimateData.materialsList.forEach(cat => {
            // Category Header
            const catRow = document.createElement("tr");
            catRow.innerHTML = `<td colspan="4" style="font-weight: 700; color: #1f7a5c; background: #f5f7f4; padding-top: 6px;">${cat.category}</td>`;
            matTbody.appendChild(catRow);
            
            // Items
            cat.items.forEach(item => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="text-truncate" style="max-width: 140px;" title="${item.name}">${item.name}</td>
                    <td>${item.qty}</td>
                    <td>${item.unit}</td>
                    <td class="text-end">${currency.format(item.total)}</td>
                `;
                matTbody.appendChild(tr);
            });
        });
        document.getElementById("pdf-materials-total").innerText = currency.format(estimateData.summary.totalMaterials);
        
        // Labor Breakdown
        const laborTbody = document.getElementById("pdf-labor-tbody");
        estimateData.summary.laborBreakdown.forEach(lb => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${lb.role}</td><td>${lb.days}</td><td class="text-end">${currency.format(lb.total)}</td>`;
            laborTbody.appendChild(tr);
        });
        
        // Phases
        const phasesDiv = document.getElementById("pdf-phases");
        estimateData.forecasting.phases.forEach(ph => {
            const div = document.createElement("div");
            div.className = "timeline-phase";
            div.innerHTML = `
                <div class="phase-bullet"></div>
                <div class="phase-content">
                    <h5>${ph.name}</h5>
                    <p>${ph.days} Days • ${ph.workers} Workers</p>
                </div>
            `;
            phasesDiv.appendChild(div);
        });
    }
    
    // 1. Run standard renderer (Hooks into exterior-container for Front, and fp-container-1 for Floor Plan)
    // The renderer3d.js now also hooks into aerial-container and side-container automatically
    initRenderer(data);
    
    // Give it 1.5 seconds for textures and geometry to fully load before enabling download
    setTimeout(() => {
        document.getElementById("btnDownload").disabled = false;
        document.getElementById("render-status").innerText = "Ready to download!";
    }, 1500);
}

// Attach PDF generation globally for the button
window.generatePDF = async function() {
    const btn = document.getElementById('btnDownload');
    const originalText = btn.innerText;
    btn.innerText = 'Generating PDF...';
    btn.disabled = true;

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Capture Page 1
        const page1 = document.getElementById('pdf-page-1');
        const canvas1 = await html2canvas(page1, { 
            scale: 2, // High res
            useCORS: true,
            backgroundColor: '#ffffff'
        });
        const imgData1 = canvas1.toDataURL('image/jpeg', 0.95);
        const imgHeight1 = (canvas1.height * pdfWidth) / canvas1.width;
        pdf.addImage(imgData1, 'JPEG', 0, 0, pdfWidth, imgHeight1);

        pdf.addPage();

        // Capture Page 2
        const page2 = document.getElementById('pdf-page-2');
        const canvas2 = await html2canvas(page2, { 
            scale: 2, 
            useCORS: true,
            backgroundColor: '#ffffff'
        });
        const imgData2 = canvas2.toDataURL('image/jpeg', 0.95);
        const imgHeight2 = (canvas2.height * pdfWidth) / canvas2.width;
        pdf.addImage(imgData2, 'JPEG', 0, 0, pdfWidth, imgHeight2);

        pdf.addPage();

        // Capture Page 3
        const page3 = document.getElementById('pdf-page-3');
        if (page3) {
            const canvas3 = await html2canvas(page3, { 
                scale: 2, 
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const imgData3 = canvas3.toDataURL('image/jpeg', 0.95);
            const imgHeight3 = (canvas3.height * pdfWidth) / canvas3.width;
            pdf.addImage(imgData3, 'JPEG', 0, 0, pdfWidth, imgHeight3);
        }

        pdf.save('BuildWise_Plan.pdf');

        // Review Modal Logic
        setTimeout(() => {
            const overlay = document.getElementById('review-modal-overlay');
            overlay.classList.remove('d-none');
        }, 1500);

    } catch (err) {
        console.error("PDF generation error: ", err);
        alert("Error generating PDF.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

function setupReviewModal() {
    let currentRating = 0;
    const stars = document.querySelectorAll('#star-rating .star');
    
    // Star interaction
    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            const val = this.getAttribute('data-value');
            stars.forEach(s => {
                s.style.color = s.getAttribute('data-value') <= val ? '#f5b041' : '#d9ddd6';
            });
        });
        
        star.addEventListener('mouseout', function() {
            stars.forEach(s => {
                s.style.color = s.getAttribute('data-value') <= currentRating ? '#f5b041' : '#d9ddd6';
            });
        });
        
        star.addEventListener('click', function() {
            currentRating = this.getAttribute('data-value');
            stars.forEach(s => {
                s.style.color = s.getAttribute('data-value') <= currentRating ? '#f5b041' : '#d9ddd6';
            });
        });
    });

    // Skip
    document.getElementById('btn-skip-review').addEventListener('click', () => {
        document.getElementById('review-modal-overlay').classList.add('d-none');
    });

    // Submit
    document.getElementById('btn-submit-review').addEventListener('click', async () => {
        if (currentRating === 0) {
            alert("Please select a star rating.");
            return;
        }

        const text = document.getElementById('review-text').value;
        const btnSubmit = document.getElementById('btn-submit-review');
        btnSubmit.disabled = true;
        btnSubmit.innerText = "Submitting...";

        // Get user data from Auth session if available, else anonymous
        let session = null;
        try {
            session = JSON.parse(sessionStorage.getItem('buildwise-session-v2') || localStorage.getItem('buildwise-session-v2') || "null");
        } catch(e) {}
        
        const userName = session ? session.name : "Anonymous User";
        const userEmail = session ? session.email : null;
        
        // Get template name
        let stored = null;
        try { stored = JSON.parse(localStorage.getItem("buildwiseResult")); } catch(e){}
        const templateName = stored ? stored.title : "Unknown Template";

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_name: userName,
                    user_email: userEmail,
                    rating: currentRating,
                    review_text: text,
                    template_name: templateName
                })
            });

            if (response.ok) {
                document.getElementById('review-success-msg').classList.remove('d-none');
                btnSubmit.classList.add('d-none');
                document.getElementById('btn-skip-review').classList.add('d-none');
                document.getElementById('star-rating').style.pointerEvents = 'none';
                document.getElementById('review-text').disabled = true;
                
                setTimeout(() => {
                    document.getElementById('review-modal-overlay').classList.add('d-none');
                }, 2000);
            } else {
                alert("Failed to submit review.");
                btnSubmit.disabled = false;
                btnSubmit.innerText = "Submit Review";
            }
        } catch (e) {
            console.error(e);
            alert("Network error.");
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Submit Review";
        }
    });
}

// Boot
setupPDFPage();
setupReviewModal();
