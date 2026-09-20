document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Simple dark mode toggle implementation
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const icon = darkModeToggle.querySelector('i');
    
    // Check for saved preference
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        icon.className = 'fas fa-sun';
    }
    
    // Simple toggle function
    darkModeToggle.onclick = function() {
        if (body.classList.contains('dark-mode')) {
            // Switch to light mode
            body.classList.remove('dark-mode');
            icon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'light');
        } else {
            // Switch to dark mode
            body.classList.add('dark-mode');
            icon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'dark');
        }
    };
    
    // Get form elements
    const paystubForm = document.getElementById('paystubForm');
    const generatePDFBtn = document.getElementById('generatePDF');
    const generateLinkBtn = document.getElementById('generateLink');
    const fillSampleDataBtn = document.getElementById('fillSampleData');
    const copyLinkBtn = document.getElementById('copyLink');
    const prefillLinkInput = document.getElementById('prefillLink');
    const linkSection = document.getElementById('linkSection');
    
    // A date input's value is a calendar day, "YYYY-MM-DD" — never build it from toISOString(),
    // which is the UTC day (tomorrow's date every evening in the US).
    function toYmd(d) {
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    const payPeriodStartInput = document.getElementById('payPeriodStart');
    const payPeriodEndInput = document.getElementById('payPeriodEnd');
    const paymentDateInput = document.getElementById('paymentDate');

    // The form opens on THIS week: Monday to Friday, paid Friday. (Until this fix it was pinned
    // to the week of April 28, 2025.)
    function applyDefaultDates() {
        const monday = new Date();
        monday.setHours(12, 0, 0, 0);
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
        const friday = new Date(monday);
        friday.setDate(monday.getDate() + 4);
        if (payPeriodStartInput) payPeriodStartInput.value = toYmd(monday);
        if (payPeriodEndInput) payPeriodEndInput.value = toYmd(friday);
        if (paymentDateInput) paymentDateInput.value = toYmd(friday);
    }
    applyDefaultDates();
    
    // Set default company information
    const companyNameInput = document.getElementById('companyName');
    const companyAddressInput = document.getElementById('companyAddress');
    
    if (companyNameInput) {
        companyNameInput.value = 'Click Plumbing and Electrical';
    }
    
    if (companyAddressInput) {
        companyAddressInput.value = '5501 Balcones Dr A141\nAustin, TX 78731';
    }
    
    // Reset asks first, and lands back on this week and the default company rather than on blanks
    // (a native reset clears everything that was set from script).
    const paystubFormEl = document.getElementById('paystubForm');
    if (paystubFormEl) {
        paystubFormEl.addEventListener('reset', function(e) {
            if (!window.confirm('Clear this pay stub and start again?')) { e.preventDefault(); return; }
            setTimeout(function() {
                applyDefaultDates();
                if (companyNameInput) companyNameInput.value = 'Click Plumbing and Electrical';
                if (companyAddressInput) companyAddressInput.value = '5501 Balcones Dr A141\nAustin, TX 78731';
            }, 0);
        });
    }

    // Prevent scroll wheel from changing number input values
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        // Prevent mousewheel from changing value
        input.addEventListener('wheel', function(e) {
            e.preventDefault();
        }, { passive: false });
        
        // Prevent up/down arrow keys from changing value
        input.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
            }
        });
    });
    
    // Update payment date when pay period end date changes
    if (payPeriodEndInput && paymentDateInput) {
        payPeriodEndInput.addEventListener('change', function() {
            paymentDateInput.value = this.value;
        });
    }
    
    // Check for URL parameters to pre-fill form
    window.addEventListener('load', function() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Pre-fill form fields if parameters exist
        for (const [key, value] of urlParams.entries()) {
            const input = document.getElementById(key);
            if (input) {
                if (input.type === 'date') {
                    // Handle date inputs
                    input.value = value;
                } else if (input.type === 'number') {
                    // Handle number inputs
                    input.value = parseFloat(value);
                } else {
                    // Handle text inputs and textareas
                    input.value = decodeURIComponent(value);
                }
            }
        }
    });
    
    // Generate PDF when button is clicked
    if (generatePDFBtn) {
        generatePDFBtn.addEventListener('click', function() {
            if (!validateForm()) {
                alert('Please fill in all required fields.');
                return;
            }
            
            generatePayStubPDF();
        });
    }
    
    // Generate pre-fill link when button is clicked
    if (generateLinkBtn) {
        generateLinkBtn.addEventListener('click', function() {
            if (!validateForm()) {
                alert('Please fill in all required fields.');
                return;
            }
            
            const prefillLink = generatePrefillLink();
            if (prefillLinkInput && linkSection) {
                prefillLinkInput.value = prefillLink;
                linkSection.style.display = 'block';
                prefillLinkInput.select();
                
                // Scroll to link section
                linkSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Fill form with sample data when button is clicked
    if (fillSampleDataBtn) {
        fillSampleDataBtn.addEventListener('click', function() {
            // Set sample data values
            const contractorNameInput = document.getElementById('contractorName');
            const paymentAmountInput = document.getElementById('paymentAmount');
            const milesDrivenInput = document.getElementById('milesDriven');
            const payPeriodStartInput = document.getElementById('payPeriodStart');
            const payPeriodEndInput = document.getElementById('payPeriodEnd');
            const paymentDateInput = document.getElementById('paymentDate');
            const companyNameInput = document.getElementById('companyName');
            const companyAddressInput = document.getElementById('companyAddress');
            const notesInput = document.getElementById('notes');
            
            if (contractorNameInput) contractorNameInput.value = 'Sample Contractor';
            if (paymentAmountInput) paymentAmountInput.value = '1500';
            if (milesDrivenInput) milesDrivenInput.value = '1234';
        
            // Set current dates for the sample data
            const today = new Date();
            
            // Set pay period start to 2 weeks ago
            if (payPeriodStartInput) {
                const payPeriodStart = new Date(today);
                payPeriodStart.setDate(today.getDate() - 14);
                payPeriodStartInput.value = toYmd(payPeriodStart);
            }
            
            // Set pay period end to yesterday
            if (payPeriodEndInput) {
                const payPeriodEnd = new Date(today);
                payPeriodEnd.setDate(today.getDate() - 1);
                payPeriodEndInput.value = toYmd(payPeriodEnd);
            }
            
            // Set payment date to today
            if (paymentDateInput) {
                paymentDateInput.value = toYmd(today);
            }
            
            // Set company information
            if (companyNameInput) {
                companyNameInput.value = 'ABC Construction, Inc.';
            }
            
            if (companyAddressInput) {
                companyAddressInput.value = '123 Builder Way\nConstruction City, TX 75001';
            }
            
            // Add a sample note
            if (notesInput) {
                notesInput.value = 'Payment for project completion and travel expenses.';
            }
        });
    }
    
    // Copy link to clipboard
    if (copyLinkBtn && prefillLinkInput) {
        copyLinkBtn.addEventListener('click', function() {
            prefillLinkInput.select();
            document.execCommand('copy');
            
            // Change button text temporarily
            const originalText = copyLinkBtn.innerHTML;
            copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            
            setTimeout(function() {
                copyLinkBtn.innerHTML = originalText;
            }, 2000);
        });
    }
    
    // Validate form
    function validateForm() {
        const requiredInputs = paystubForm.querySelectorAll('[required]');
        let valid = true;
        
        requiredInputs.forEach(function(input) {
            if (!input.value.trim()) {
                input.classList.add('error');
                valid = false;
            } else {
                input.classList.remove('error');
            }
        });
        
        return valid;
    }
    
    // Generate pre-fill link
    function generatePrefillLink() {
        const formData = new FormData(paystubForm);
        const params = new URLSearchParams();
        
        for (const [key, value] of formData.entries()) {
            if (value) {
                params.append(key, encodeURIComponent(value));
            }
        }
        
        const baseUrl = window.location.href.split('?')[0];
        return baseUrl + '?' + params.toString();
    }
    
    // Generate PDF pay stub
    function generatePayStubPDF() {
        // Get form values
        const contractorName = document.getElementById('contractorName').value;
        const payPeriodStart = formatDate(document.getElementById('payPeriodStart').value);
        const payPeriodEnd = formatDate(document.getElementById('payPeriodEnd').value);
        const paymentDate = formatDate(document.getElementById('paymentDate').value);
        const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
        const milesDriven = parseFloat(document.getElementById('milesDriven').value) || 0;
        const mileageRate = parseFloat(document.getElementById('mileageRate').value) || 0;
        const notes = document.getElementById('notes').value;
        const companyName = document.getElementById('companyName').value;
        const companyAddress = document.getElementById('companyAddress').value;
        
        // Create PDF using jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Set font sizes
        const titleFontSize = 16;
        const headerFontSize = 12;
        const normalFontSize = 10;
        const smallFontSize = 8;
        
        // Set margins
        const margin = 20;
        let y = margin;
        
        // Add company info
        doc.setFontSize(headerFontSize);
        doc.setFont(undefined, 'bold');
        doc.text(companyName, margin, y);
        
        doc.setFontSize(normalFontSize);
        doc.setFont(undefined, 'normal');
        const companyAddressLines = companyAddress.split('\n');
        companyAddressLines.forEach(line => {
            y += 6;
            doc.text(line, margin, y);
        });
        
        // Add pay stub title
        y = margin;
        doc.setFontSize(titleFontSize);
        doc.setFont(undefined, 'bold');
        doc.text('PAY STUB', doc.internal.pageSize.width - margin, y, { align: 'right' });
        
        // Add horizontal line
        y += 15;
        doc.setLineWidth(0.5);
        doc.line(margin, y, doc.internal.pageSize.width - margin, y);
        
        // Add contractor info
        y += 10;
        doc.setFontSize(headerFontSize);
        doc.text('Contractor Information', margin, y);
        
        y += 8;
        doc.setFontSize(normalFontSize);
        doc.setFont(undefined, 'normal');
        doc.text(`Name: ${contractorName}`, margin, y);
        
        // Add payment info
        y += 10;
        doc.setFontSize(headerFontSize);
        doc.setFont(undefined, 'bold');
        doc.text('Payment Information', margin, y);
        
        y += 8;
        doc.setFontSize(normalFontSize);
        doc.setFont(undefined, 'normal');
        doc.text(`Pay Period: ${payPeriodStart} to ${payPeriodEnd}`, margin, y);
        
        y += 6;
        doc.text(`Payment Date: ${paymentDate}`, margin, y);
        
        // Add payment details table
        y += 15;
        doc.setFontSize(headerFontSize);
        doc.setFont(undefined, 'bold');
        doc.text('Payment Details', margin, y);
        
        // Table headers
        y += 10;
        const col1 = margin;
        const col2 = 120;
        doc.setFontSize(normalFontSize);
        doc.text('Description', col1, y);
        doc.text('Amount', col2, y);
        
        // Table line
        y += 2;
        doc.line(margin, y, doc.internal.pageSize.width - margin, y);
        
        // Table rows
        y += 8;
        doc.setFont(undefined, 'normal');
        doc.text('Contractor Payment', col1, y);
        doc.text(`$${paymentAmount.toFixed(2)}`, col2, y);
        
        // Add mileage in a separate section with the new format
        y += 20;
        doc.setFontSize(headerFontSize);
        doc.setFont(undefined, 'bold');
        doc.text('Mileage Record (For Contractor Tax Purposes)', margin, y);
        
        if (milesDriven > 0) {
            // Table headers
            y += 10;
            const col1 = margin;
            const col2 = 120;
            doc.setFontSize(normalFontSize);
            doc.setFont(undefined, 'normal');
            
            // Table rows
            y += 8;
            doc.text('Miles Driven for Company Business', col1, y);
            doc.text(`${milesDriven.toFixed(1)} miles`, col2, y);
            
            y += 8;
            doc.text('IRS Standard Mileage Rate*', col1, y);
            doc.text(`$${mileageRate.toFixed(2)}/mile`, col2, y);
            
            y += 8;
            doc.text('Estimated Mileage Deduction Value**', col1, y);
            const deductionValue = milesDriven * mileageRate;
            doc.text(`$${deductionValue.toFixed(2)}`, col2, y);
            
            // Add footnotes
            y += 15;
            doc.setFontSize(smallFontSize);
            doc.setFont(undefined, 'italic');
            const footnote1 = '*This mileage record is provided to assist with your tax reporting. The IRS standard mileage rate is subject to change; confirm the applicable rate with your tax professional.';
            const splitFootnote1 = doc.splitTextToSize(footnote1, doc.internal.pageSize.width - (margin * 2));
            doc.text(splitFootnote1, margin, y);
            
            y += splitFootnote1.length * 5;
            const footnote2 = '**The estimated deduction value is for informational purposes only and does not represent a payment or reimbursement by ' + (companyName || 'the paying company') + '. Consult a tax professional to determine allowable deductions.';
            const splitFootnote2 = doc.splitTextToSize(footnote2, doc.internal.pageSize.width - (margin * 2));
            doc.text(splitFootnote2, margin, y);
        } else {
            y += 10;
            doc.setFontSize(normalFontSize);
            doc.setFont(undefined, 'normal');
            doc.text('No mileage reported for this period', margin, y);
        }
        
        // Add notes if any
        if (notes) {
            y += 20;
            doc.setFontSize(headerFontSize);
            doc.text('Notes', margin, y);
            
            y += 8;
            doc.setFontSize(normalFontSize);
            doc.setFont(undefined, 'normal');
            
            // Split notes into multiple lines if needed
            const splitNotes = doc.splitTextToSize(notes, doc.internal.pageSize.width - (margin * 2));
            doc.text(splitNotes, margin, y);
        }
        
        // Footer removed as requested
        
        // Save the PDF
        const filename = `PayStub_${contractorName.replace(/\s+/g, '_')}_${payPeriodEnd.replace(/\//g, '-')}.pdf`;
        doc.save(filename);
    }
    
    // Format date from YYYY-MM-DD to MM/DD/YYYY
    function formatDate(dateString) {
        if (!dateString) return '';
        
        // "2026-09-18" is a calendar day. new Date('2026-09-18') is UTC midnight, which is the
        // 17th anywhere in the US — every date on the PDF printed one day early until this fix.
        const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateString);
        if (!m) return '';
        return `${parseInt(m[2], 10)}/${parseInt(m[3], 10)}/${m[1]}`;
    }
});
