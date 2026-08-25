async function downloadPlan() {
        const element = document.querySelector('main.builder-page');
        const btn = document.getElementById('downloadBtn');
        const originalText = btn.innerText;
        btn.innerText = 'Generating PDF...';
        btn.disabled = true;

        // Hide ignored elements
        const ignored = Array.from(element.querySelectorAll('[data-html2canvas-ignore]'));
        const originalDisplays = ignored.map(el => el.style.display);
        ignored.forEach(el => el.style.display = 'none');

        try {
            // Give the browser a tiny delay to apply display:none
            await new Promise(r => setTimeout(r, 100));

            // Generate canvas from DOM
            const canvas = await html2canvas(element, { 
                scale: 1.5, 
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            // Extract image data
            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            // Initialize jsPDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Calculate dimensions for A4
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Add subsequent pages if the content is long
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save('BuildWise_Plan.pdf');
        } catch (err) {
            console.error("PDF generation error: ", err);
            alert("Error generating PDF. Please ensure all images are fully loaded.");
        } finally {
            // Restore hidden elements
            ignored.forEach((el, i) => el.style.display = originalDisplays[i]);
            btn.innerText = originalText;
            btn.disabled = false;
        }
      }
