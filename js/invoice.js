// Define calculateItemAmount as a global function so it can be called from HTML
window.calculateItemAmount = function(index) {
    try {
        console.log('Calculating amount for item ' + index);
        const quantityElement = document.getElementById('itemQuantity' + index);
        const rateElement = document.getElementById('itemRate' + index);
        const amountElement = document.getElementById('itemAmount' + index);
        
        if (!quantityElement || !rateElement || !amountElement) {
            console.error('Missing elements for item ' + index);
            return;
        }
        
        const quantity = parseFloat(quantityElement.value) || 0;
        const rate = parseFloat(rateElement.value) || 0;
        const amount = quantity * rate;
        
        console.log('Item ' + index + ': ' + quantity + ' x ' + rate + ' = ' + amount.toFixed(2));
        amountElement.value = amount.toFixed(2);
        
        // Recalculate totals if the function exists
        if (window.calculateTotals) {
            window.calculateTotals();
        }
    } catch (error) {
        console.error('Error calculating amount for item ' + index + ':', error);
    }
};

// Make itemCount globally accessible
let itemCount = 1;

// Clear any existing global functions to avoid duplicates
window.addInvoiceItem = null;
window.removeInvoiceItem = null;

// Define a single clean implementation for adding items
function addNewInvoiceItem(e) {
    if (e) e.preventDefault();
    console.log('Adding new invoice item - CLEAN VERSION');
    
    try {
        // Get the container
        const invoiceItems = document.getElementById('invoiceItems');
        if (!invoiceItems) {
            console.error('Invoice items container not found');
            return false;
        }
        
        // Increment item count
        itemCount++;
        console.log('New item count:', itemCount);
        
        // Create the new item container
        const newItem = document.createElement('div');
        newItem.className = 'invoice-item';
        newItem.id = 'invoiceItem' + itemCount;
        
        // Set the HTML content
        newItem.innerHTML = `
            <div class="form-row">
                <div class="form-group item-description">
                    <label for="itemDescription${itemCount}">Description:</label>
                    <input type="text" id="itemDescription${itemCount}" name="itemDescription${itemCount}" required>
                </div>
                
                <div class="form-group item-quantity">
                    <label for="itemQuantity${itemCount}">Quantity:</label>
                    <input type="number" id="itemQuantity${itemCount}" name="itemQuantity${itemCount}" min="0" step="0.01" required onchange="calculateItemAmount(${itemCount})" onkeyup="calculateItemAmount(${itemCount})">
                </div>
                
                <div class="form-group item-rate">
                    <label for="itemRate${itemCount}">Rate ($):</label>
                    <input type="number" id="itemRate${itemCount}" name="itemRate${itemCount}" min="0" step="0.01" required onchange="calculateItemAmount(${itemCount})" onkeyup="calculateItemAmount(${itemCount})">
                </div>
                
                <div class="form-group item-amount">
                    <label for="itemAmount${itemCount}">Amount ($):</label>
                    <input type="number" id="itemAmount${itemCount}" name="itemAmount${itemCount}" readonly>
                </div>
            </div>
        `;
        
        // Append the new item to the container
        invoiceItems.appendChild(newItem);
        
        // Force initial calculation for the new item
        setTimeout(function() {
            calculateItemAmount(itemCount);
        }, 100);
        
        return false; // Prevent form submission
    } catch (error) {
        console.error('Error adding invoice item:', error);
        return false;
    }
}

// Define a single clean implementation for removing items
function removeLastInvoiceItem(e) {
    if (e) e.preventDefault();
    console.log('Removing invoice item - CLEAN VERSION');
    
    try {
        const invoiceItems = document.getElementById('invoiceItems');
        if (!invoiceItems) {
            console.error('Invoice items container not found');
            return false;
        }
        
        if (itemCount > 1) {
            const lastItem = document.getElementById('invoiceItem' + itemCount);
            if (lastItem) {
                invoiceItems.removeChild(lastItem);
                itemCount--;
                console.log('Item removed, new count:', itemCount);
                calculateTotals();
            }
        }
        
        return false; // Prevent form submission
    } catch (error) {
        console.error('Error removing invoice item:', error);
        return false;
    }
}

// Assign the functions to the global scope for access from HTML
window.addInvoiceItem = addNewInvoiceItem;
window.removeInvoiceItem = removeLastInvoiceItem;

document.addEventListener('DOMContentLoaded', function() {
    // Prevent mouse wheel from changing number input values
    document.addEventListener('wheel', function(event) {
        if (document.activeElement.type === 'number') {
            event.preventDefault();
        }
    }, { passive: false });

    // Initialize variables
    const invoiceItems = document.getElementById('invoiceItems');
    const addItemBtn = document.getElementById('addItem');
    const removeItemBtn = document.getElementById('removeItem');
    const fillSampleDataBtn = document.getElementById('fillSampleData');
    const previewInvoiceBtn = document.getElementById('previewInvoice');
    const editInvoiceBtn = document.getElementById('editInvoice');
    const generatePDFFromPreviewBtn = document.getElementById('generatePDFFromPreview');
    const invoicePreviewSection = document.getElementById('invoicePreviewSection');
    const invoicePreviewContainer = document.getElementById('invoicePreview');
    
    console.log('DOM loaded, buttons found:', {
        addItemBtn: !!addItemBtn,
        removeItemBtn: !!removeItemBtn,
        invoiceItems: !!invoiceItems
    });
    
    // Set up single event handlers for buttons
    if (addItemBtn) {
        // Remove any existing event listeners (just to be safe)
        addItemBtn.replaceWith(addItemBtn.cloneNode(true));
        // Get the fresh reference
        const freshAddBtn = document.getElementById('addItem');
        if (freshAddBtn) {
            freshAddBtn.addEventListener('click', addNewInvoiceItem);
            console.log('Add button event listener added (single instance)');
        }
    }
    
    if (removeItemBtn) {
        // Remove any existing event listeners (just to be safe)
        removeItemBtn.replaceWith(removeItemBtn.cloneNode(true));
        // Get the fresh reference
        const freshRemoveBtn = document.getElementById('removeItem');
        if (freshRemoveBtn) {
            freshRemoveBtn.addEventListener('click', removeLastInvoiceItem);
            console.log('Remove button event listener added (single instance)');
        }
    }
    const generatePDFBtn = document.getElementById('generatePDF');
    const generateLinkBtn = document.getElementById('generateLink');
    const prefillLinkInput = document.getElementById('prefillLink');
    const copyLinkBtn = document.getElementById('copyLink');
    const linkSection = document.getElementById('linkSection');
    
    // Set current date for invoice date
    const today = new Date();
    document.getElementById('invoiceDate').valueAsDate = today;
    
    // Set due date (30 days from today)
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 30);
    document.getElementById('dueDate').valueAsDate = dueDate;
    
    // Generate invoice number (current date in YYYYMMDD format + random 3 digits)
    const randomDigits = Math.floor(Math.random() * 900) + 100; // Random 3-digit number
    const dateString = today.getFullYear().toString() +
                      (today.getMonth() + 1).toString().padStart(2, '0') +
                      today.getDate().toString().padStart(2, '0');
    document.getElementById('invoiceNumber').value = 'INV-' + dateString + '-' + randomDigits;
    
    // Signature pad has been removed
    // Creating a placeholder for signaturePad to avoid errors in existing code
    const signaturePad = {
        isEmpty: function() { return false; },
        toDataURL: function() { return ''; }
    };
    
    // Calculate item amount when quantity or rate changes
    function calculateItemAmount(index) {
        try {
            console.log('Calculating amount for item ' + index);
            const quantityElement = document.getElementById('itemQuantity' + index);
            const rateElement = document.getElementById('itemRate' + index);
            const amountElement = document.getElementById('itemAmount' + index);
            
            if (!quantityElement || !rateElement || !amountElement) {
                console.error('Missing elements for item ' + index);
                return;
            }
            
            const quantity = parseFloat(quantityElement.value) || 0;
            const rate = parseFloat(rateElement.value) || 0;
            const amount = quantity * rate;
            
            console.log('Item ' + index + ': ' + quantity + ' x ' + rate + ' = ' + amount.toFixed(2));
            amountElement.value = amount.toFixed(2);
            
            // Recalculate totals
            calculateTotals();
        } catch (error) {
            console.error('Error calculating amount for item ' + index + ':', error);
        }
    }
    
    // Make calculateTotals globally accessible
    window.calculateTotals = function() {
        try {
            console.log('Calculating totals');
            // Calculate subtotal from all invoice items
            let subtotal = 0;
            for (let i = 1; i <= itemCount; i++) {
                const amountElement = document.getElementById('itemAmount' + i);
                if (amountElement) {
                    subtotal += parseFloat(amountElement.value) || 0;
                }
            }
            
            const subtotalElement = document.getElementById('subtotal');
            if (subtotalElement) {
                subtotalElement.value = subtotal.toFixed(2);
                console.log('Subtotal: ' + subtotal.toFixed(2));
            }
            
            // Calculate mileage total
            const milesDrivenElement = document.getElementById('milesDriven');
            const mileageRateElement = document.getElementById('mileageRate');
            const mileageTotalElement = document.getElementById('mileageTotal');
            
            let mileageTotal = 0;
            if (milesDrivenElement && mileageRateElement && mileageTotalElement) {
                const milesDriven = parseFloat(milesDrivenElement.value) || 0;
                const mileageRate = parseFloat(mileageRateElement.value) || 0;
                mileageTotal = milesDriven * mileageRate;
                mileageTotalElement.value = mileageTotal.toFixed(2);
                console.log('Mileage total: ' + mileageTotal.toFixed(2));
            }
            
            // Calculate invoice total
            const invoiceTotalElement = document.getElementById('invoiceTotal');
            const includeMileageCheckbox = document.getElementById('includeMileageInTotal');
            
            if (invoiceTotalElement) {
                let invoiceTotal = subtotal;
                
                // Only include mileage in total if checkbox is checked
                if (includeMileageCheckbox && includeMileageCheckbox.checked) {
                    invoiceTotal += mileageTotal;
                    console.log('Including mileage in total');
                } else {
                    console.log('Mileage shown as non-billable');
                }
                
                invoiceTotalElement.value = invoiceTotal.toFixed(2);
                console.log('Invoice total: ' + invoiceTotal.toFixed(2));
            }
        } catch (error) {
            console.error('Error calculating totals:', error);
        }
    };
    
    // Add event listeners to first item with multiple event types for better reliability
    const quantityField = document.getElementById('itemQuantity1');
    const rateField = document.getElementById('itemRate1');
    
    // Use multiple event types to ensure we catch all changes
    ['input', 'change', 'keyup', 'blur'].forEach(function(eventType) {
        quantityField.addEventListener(eventType, function() {
            calculateItemAmount(1);
        });
        
        rateField.addEventListener(eventType, function() {
            calculateItemAmount(1);
        });
    });
    
    // Calculate initial amount if values are present (for page reload or pre-filled forms)
    if (quantityField.value || rateField.value) {
        calculateItemAmount(1);
    }
    
    // Force initial calculation
    setTimeout(function() {
        calculateItemAmount(1);
    }, 100);
    
    // Add event listeners to mileage fields
    document.getElementById('milesDriven').addEventListener('input', calculateTotals);
    document.getElementById('mileageRate').addEventListener('input', calculateTotals);
    
    // Add event listener for the include mileage checkbox
    const includeMileageCheckbox = document.getElementById('includeMileageInTotal');
    if (includeMileageCheckbox) {
        includeMileageCheckbox.addEventListener('change', calculateTotals);
    }
    
    // Create global functions for Add Item and Remove Item buttons
    // This function has been removed as we're now using the standalone createNewInvoiceItem function
    // The global addInvoiceItem function is now defined elsewhere
    
    window.removeInvoiceItem = function() {
        try {
            console.log('Removing invoice item - FIXED VERSION');
            const invoiceItems = document.getElementById('invoiceItems');
            if (!invoiceItems) {
                console.error('Invoice items container not found');
                alert('Error: Could not find the invoice items container');
                return false;
            }
            
            if (itemCount > 1) {
                // Find the last invoice item by ID
                const lastItem = document.getElementById('invoiceItem' + itemCount);
                if (lastItem) {
                    invoiceItems.removeChild(lastItem);
                    itemCount--;
                    console.log('Item removed, new count:', itemCount);
                    calculateTotals();
                } else {
                    // Fallback to removing the last child if ID-based approach fails
                    console.log('Falling back to removing last child');
                    if (invoiceItems.lastChild) {
                        invoiceItems.removeChild(invoiceItems.lastChild);
                        itemCount--;
                        console.log('Item removed (fallback), new count:', itemCount);
                        calculateTotals();
                    } else {
                        console.error('No last child found to remove');
                    }
                }
            } else {
                console.log('Cannot remove the last item');
                alert('Cannot remove the first item. At least one item is required.');
            }
            
            return false; // Prevent form submission
        } catch (error) {
            console.error('Error removing invoice item:', error);
            alert('Error removing item: ' + error.message);
            return false;
        }
    };
    
    // Add event listeners to buttons
    if (addItemBtn) {
        addItemBtn.addEventListener('click', window.addInvoiceItem);
        console.log('Add item button event listener added');
    }
    
    if (removeItemBtn) {
        removeItemBtn.addEventListener('click', window.removeInvoiceItem);
        console.log('Remove item button event listener added');
    }
    
    // Fill form with sample data
    if (fillSampleDataBtn) {
        fillSampleDataBtn.addEventListener('click', function() {
            // Set current dates
            const today = new Date();
            const dueDate = new Date(today);
            dueDate.setDate(today.getDate() + 30); // Due in 30 days
            
            // Set basic invoice information
            document.getElementById('invoiceNumber').value = 'INV-2025-001';
            document.getElementById('invoiceDate').value = today.toISOString().split('T')[0];
            document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];
            
            // Set contractor information
            document.getElementById('contractorName').value = 'Trace Whites';
            document.getElementById('contractorAddress').value = '456 Contractor Lane\nServiceville, TX 75002';
            document.getElementById('contractorPhone').value = '(555) 123-4567';
            document.getElementById('contractorEmail').value = 'trace@example.com';
            
            // Set client information
            document.getElementById('companyName').value = 'ABC Construction, Inc.';
            document.getElementById('companyAddress').value = '123 Builder Way\nConstruction City, TX 75001';
            document.getElementById('contactPerson').value = 'John Builder';
            
            // Set first invoice item
            document.getElementById('itemDescription1').value = 'Professional Services';
            document.getElementById('itemQuantity1').value = '10';
            document.getElementById('itemRate1').value = '75';
            calculateItemAmount(1);
            
            // Add a second invoice item
            if (itemCount < 2) {
                window.addInvoiceItem();
                document.getElementById('itemDescription2').value = 'Materials';
                document.getElementById('itemQuantity2').value = '1';
                document.getElementById('itemRate2').value = '250';
                calculateItemAmount(2);
            }
            
            // Set mileage information
            document.getElementById('milesDriven').value = '1234';
            document.getElementById('mileageRate').value = '0.70';
            
            // Set payment terms and notes
            document.getElementById('paymentTerms').value = 'Net 30. Please make payment within 30 days of invoice date.';
            document.getElementById('notes').value = 'Thank you for your business!';
            
            // Check the notarial language checkbox
            if (document.getElementById('addNotarialLanguage')) {
                document.getElementById('addNotarialLanguage').checked = true;
            }
            
            // Calculate totals
            calculateTotals();
            
            console.log('Sample data filled');
        });
        console.log('Fill sample data button event listener added');
    }
    
    // Preview Invoice
    if (previewInvoiceBtn) {
        previewInvoiceBtn.addEventListener('click', function() {
            if (!validateForm()) {
                return;
            }
            
            // Generate HTML preview
            generateInvoicePreview();
            
            // Hide form and show preview
            document.getElementById('invoiceForm').parentElement.style.display = 'none';
            invoicePreviewSection.style.display = 'block';
            
            // Scroll to preview section
            invoicePreviewSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Edit Invoice (go back to form)
    if (editInvoiceBtn) {
        editInvoiceBtn.addEventListener('click', function() {
            // Hide preview and show form
            invoicePreviewSection.style.display = 'none';
            document.getElementById('invoiceForm').parentElement.style.display = 'block';
            
            // Scroll to form
            document.getElementById('invoiceForm').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Generate PDF from Preview
    if (generatePDFFromPreviewBtn) {
        generatePDFFromPreviewBtn.addEventListener('click', function() {
            generateInvoicePDF();
        });
    }
    
    // Generate PDF (original button, now hidden)
    if (generatePDFBtn) {
        generatePDFBtn.addEventListener('click', function() {
            if (!validateForm()) {
                return;
            }
            
            generateInvoicePDF();
        });
    }
    
    // Generate pre-fill link
    generateLinkBtn.addEventListener('click', function() {
        if (!validateForm()) {
            return;
        }
        
        const link = generatePrefillLink();
        prefillLinkInput.value = link;
        linkSection.style.display = 'block';
        
        // Scroll to link section
        linkSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Copy link to clipboard
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
    
    // Validate form
    function validateForm() {
        const requiredInputs = document.querySelectorAll('#invoiceForm [required]');
        let valid = true;
        let missingFields = [];
        
        requiredInputs.forEach(function(input) {
            if (!input.value.trim()) {
                input.classList.add('error');
                valid = false;
                
                // Get field label or name for error message
                let fieldName = '';
                const labelFor = document.querySelector(`label[for="${input.id}"]`);
                if (labelFor) {
                    fieldName = labelFor.textContent.replace('*', '').trim();
                } else {
                    // If no label, use the input placeholder or id
                    fieldName = input.placeholder || input.id;
                }
                
                missingFields.push(fieldName);
            } else {
                input.classList.remove('error');
            }
        });
        
        // If validation fails, show specific missing fields
        if (!valid) {
            alert('Please fill in the following required fields:\n• ' + missingFields.join('\n• '));
        }
        
        return valid;
    }
    
    // Generate pre-fill link
    function generatePrefillLink() {
        const formData = new FormData(document.getElementById('invoiceForm'));
        const params = new URLSearchParams();
        
        for (const [key, value] of formData.entries()) {
            if (value) {
                params.append(key, encodeURIComponent(value));
            }
        }
        
        const baseUrl = window.location.href.split('?')[0];
        return baseUrl + '?' + params.toString();
    }
    
    // Generate PDF invoice
    function generateInvoicePDF() {
        try {
            console.log('Generating PDF invoice...');
            
            // Get form values
            const invoiceNumber = document.getElementById('invoiceNumber').value;
            const invoiceDate = formatDate(document.getElementById('invoiceDate').value);
            const dueDate = formatDate(document.getElementById('dueDate').value);
            const contractorName = document.getElementById('contractorName').value;
            const contractorAddress = document.getElementById('contractorAddress').value;
            const contractorPhone = document.getElementById('contractorPhone').value || 'N/A';
            const contractorEmail = document.getElementById('contractorEmail').value || 'N/A';
            const companyName = document.getElementById('companyName').value;
            const companyAddress = document.getElementById('companyAddress').value;
            const contactPerson = document.getElementById('contactPerson').value || 'N/A';
            const subtotal = parseFloat(document.getElementById('subtotal').value) || 0;
            const mileageTotal = parseFloat(document.getElementById('mileageTotal').value) || 0;
            const invoiceTotal = parseFloat(document.getElementById('invoiceTotal').value) || 0;
            const paymentTerms = document.getElementById('paymentTerms').value || '';
            const notes = document.getElementById('notes').value || '';
            const addNotarialLanguage = document.getElementById('addNotarialLanguage') ? 
                document.getElementById('addNotarialLanguage').checked : false;
                
            console.log('Form values retrieved successfully');
            console.log('Invoice total:', invoiceTotal);
            
            // Check if jsPDF is available
            if (!window.jspdf || !window.jspdf.jsPDF) {
                throw new Error('jsPDF library not loaded. Please check your internet connection and try again.');
            }
            
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
            
            // Add contractor info
            doc.setFontSize(titleFontSize);
            doc.setFont(undefined, 'bold');
            doc.text('INVOICE', margin, y);
            
            // Add invoice number and dates
            doc.setFontSize(normalFontSize);
            doc.setFont(undefined, 'normal');
            doc.text(`Invoice #: ${invoiceNumber}`, doc.internal.pageSize.width - margin - 60, y);
            y += 10;
            doc.text(`Date: ${invoiceDate}`, doc.internal.pageSize.width - margin - 60, y);
            y += 6;
            doc.text(`Due Date: ${dueDate}`, doc.internal.pageSize.width - margin - 60, y);
            
            // Add contractor info
            y = margin + 20;
            doc.setFont(undefined, 'bold');
            doc.text('From:', margin, y);
            doc.setFont(undefined, 'normal');
            y += 6;
            doc.text(contractorName, margin, y);
            y += 6;
            
            // Split address into multiple lines if needed
            const addressLines = doc.splitTextToSize(contractorAddress, 80);
            addressLines.forEach(line => {
                doc.text(line, margin, y);
                y += 6;
            });
            
            doc.text(`Phone: ${contractorPhone}`, margin, y);
            y += 6;
            doc.text(`Email: ${contractorEmail}`, margin, y);
            
            // Add client info
            y = margin + 20;
            doc.setFont(undefined, 'bold');
            doc.text('To:', doc.internal.pageSize.width - margin - 80, y);
            doc.setFont(undefined, 'normal');
            y += 6;
            doc.text(companyName, doc.internal.pageSize.width - margin - 80, y);
            y += 6;
            
            // Split address into multiple lines if needed
            const clientAddressLines = doc.splitTextToSize(companyAddress, 80);
            clientAddressLines.forEach(line => {
                doc.text(line, doc.internal.pageSize.width - margin - 80, y);
                y += 6;
            });
            
            if (contactPerson) {
                doc.text(`Attn: ${contactPerson}`, doc.internal.pageSize.width - margin - 80, y);
                y += 6;
            }
            
            // Add invoice items table
            y += 15;
            doc.setFont(undefined, 'bold');
            doc.text('Description', margin, y);
            doc.text('Quantity', margin + 90, y);
            doc.text('Rate', margin + 120, y);
            doc.text('Amount', margin + 150, y);
            doc.setFont(undefined, 'normal');
            
            // Add horizontal line
            y += 2;
            doc.line(margin, y, doc.internal.pageSize.width - margin, y);
            y += 8;
            
            // Add invoice items
            for (let i = 1; i <= itemCount; i++) {
                const description = document.getElementById(`itemDescription${i}`).value;
                const quantity = parseFloat(document.getElementById(`itemQuantity${i}`).value) || 0;
                const rate = parseFloat(document.getElementById(`itemRate${i}`).value) || 0;
                const amount = parseFloat(document.getElementById(`itemAmount${i}`).value) || 0;
                
                // Split description into multiple lines if needed
                const descriptionLines = doc.splitTextToSize(description, 85);
                descriptionLines.forEach((line, index) => {
                    if (index === 0) {
                        doc.text(line, margin, y);
                        doc.text(quantity.toString(), margin + 90, y);
                        doc.text(`$${rate.toFixed(2)}`, margin + 120, y);
                        doc.text(`$${amount.toFixed(2)}`, margin + 150, y);
                    } else {
                        y += 6;
                        doc.text(line, margin, y);
                    }
                });
                
                y += 8;
            }
            
            // Add horizontal line
            doc.line(margin, y, doc.internal.pageSize.width - margin, y);
            y += 10;
            
            // Add mileage if applicable
            const milesDriven = parseFloat(document.getElementById('milesDriven').value) || 0;
            const mileageRate = parseFloat(document.getElementById('mileageRate').value) || 0;
            const includeMileageInTotal = document.getElementById('includeMileageInTotal') ? 
                document.getElementById('includeMileageInTotal').checked : true;
            
            if (milesDriven > 0 && mileageRate > 0) {
                if (includeMileageInTotal) {
                    // Show mileage as a regular billable item
                    doc.text(`Mileage: ${milesDriven} miles at $${mileageRate.toFixed(3)}/mile`, margin, y);
                    doc.text(`$${mileageTotal.toFixed(2)}`, margin + 150, y);
                } else {
                    // Show mileage as a non-billable item
                    doc.setTextColor(100, 100, 100); // Gray color for non-billable
                    doc.setFont(undefined, 'italic');
                    doc.text(`Mileage (Non-billable): ${milesDriven} miles at $${mileageRate.toFixed(3)}/mile`, margin, y);
                    doc.text(`$${mileageTotal.toFixed(2)}`, margin + 150, y);
                    doc.setTextColor(0, 0, 0); // Reset to black
                    doc.setFont(undefined, 'normal');
                }
                y += 8;
            }
            
            // Add totals
            doc.setFont(undefined, 'bold');
            doc.text('TOTAL', margin + 120, y);
            doc.text(`$${invoiceTotal.toFixed(2)}`, margin + 150, y);
            doc.setFont(undefined, 'normal');
            
            // Add payment terms
            if (paymentTerms) {
                y += 15;
                doc.setFont(undefined, 'bold');
                doc.text('Payment Terms:', margin, y);
                doc.setFont(undefined, 'normal');
                y += 7;
                
                const termsLines = doc.splitTextToSize(paymentTerms, 170);
                termsLines.forEach(line => {
                    doc.text(line, margin, y);
                    y += 7;
                });
            }
            
            // Add notes if any
            if (notes) {
                y += 5;
                doc.setFont(undefined, 'bold');
                doc.text('Notes:', margin, y);
                doc.setFont(undefined, 'normal');
                y += 7;
                
                const notesLines = doc.splitTextToSize(notes, 170);
                notesLines.forEach(line => {
                    doc.text(line, margin, y);
                    y += 7;
                });
            }
            
            // Add notarial language if checkbox is checked
            if (addNotarialLanguage) {
                y += 15;
                doc.setFont(undefined, 'bold');
                doc.text('NOTARIAL ACKNOWLEDGMENT', margin, y);
                doc.setFont(undefined, 'normal');
                y += 10;
                
                const notarialText = `STATE OF ______________ )
COUNTY OF _____________ )

On this day, personally appeared before me ${contractorName}, to me known to be the individual described in and who executed the foregoing instrument, and acknowledged that they signed the same as their free and voluntary act and deed, for the uses and purposes therein mentioned.

Given under my hand and official seal this ____ day of ______________, ${new Date().getFullYear()}.


_______________________________
NOTARY PUBLIC
My commission expires: ___________`;
                
                const notarialLines = doc.splitTextToSize(notarialText, 170);
                notarialLines.forEach(line => {
                    doc.text(line, margin, y);
                    y += 7;
                });
            }
            
            // Save the PDF
            doc.save(`Invoice_${invoiceNumber}.pdf`);
            console.log('PDF generated successfully');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF: ' + error.message);
        }
    }
    
    // Generate HTML preview of the invoice
    function generateInvoicePreview() {
        // Get form values
        const invoiceNumber = document.getElementById('invoiceNumber').value;
        const invoiceDate = formatDate(document.getElementById('invoiceDate').value);
        const dueDate = formatDate(document.getElementById('dueDate').value);
        const contractorName = document.getElementById('contractorName').value;
        const contractorAddress = document.getElementById('contractorAddress').value;
        const contractorPhone = document.getElementById('contractorPhone').value || 'N/A';
        const contractorEmail = document.getElementById('contractorEmail').value || 'N/A';
        const companyName = document.getElementById('companyName').value;
        const companyAddress = document.getElementById('companyAddress').value;
        const contactPerson = document.getElementById('contactPerson').value || 'N/A';
        const subtotal = parseFloat(document.getElementById('subtotal').value) || 0;
        const mileageTotal = parseFloat(document.getElementById('mileageTotal').value) || 0;
        const invoiceTotal = parseFloat(document.getElementById('invoiceTotal').value) || 0;
        const paymentTerms = document.getElementById('paymentTerms').value || '';
        const notes = document.getElementById('notes').value || '';
        const addNotarialLanguage = document.getElementById('addNotarialLanguage') ? 
            document.getElementById('addNotarialLanguage').checked : false;
        
        // Format addresses with line breaks
        const formattedContractorAddress = contractorAddress.replace(/\n/g, '<br>');
        const formattedCompanyAddress = companyAddress.replace(/\n/g, '<br>');
        
        // Create HTML for invoice items
        let itemsHTML = '';
        let itemsTotal = 0;
        
        for (let i = 1; i <= itemCount; i++) {
            const description = document.getElementById(`itemDescription${i}`).value;
            const quantity = parseFloat(document.getElementById(`itemQuantity${i}`).value) || 0;
            const rate = parseFloat(document.getElementById(`itemRate${i}`).value) || 0;
            const amount = parseFloat(document.getElementById(`itemAmount${i}`).value) || 0;
            
            if (description && quantity > 0 && rate > 0) {
                itemsHTML += `
                <tr>
                    <td>${description}</td>
                    <td>${quantity}</td>
                    <td>$${rate.toFixed(2)}</td>
                    <td>$${amount.toFixed(2)}</td>
                </tr>`;
                
                itemsTotal += amount;
            }
        }
        
        // Create HTML for mileage
        const milesDriven = parseFloat(document.getElementById('milesDriven').value) || 0;
        const mileageRate = parseFloat(document.getElementById('mileageRate').value) || 0;
        const includeMileageInTotal = document.getElementById('includeMileageInTotal') ? 
            document.getElementById('includeMileageInTotal').checked : true;
        let mileageHTML = '';
        
        if (milesDriven > 0 && mileageRate > 0) {
            if (includeMileageInTotal) {
                // Show mileage as a regular billable item
                mileageHTML = `
                <tr>
                    <td>Mileage</td>
                    <td>${milesDriven} miles</td>
                    <td>$${mileageRate.toFixed(3)}/mile</td>
                    <td>$${mileageTotal.toFixed(2)}</td>
                </tr>`;
            } else {
                // Show mileage as a non-billable item (with a note)
                mileageHTML = `
                <tr class="non-billable">
                    <td>Mileage (Non-billable)</td>
                    <td>${milesDriven} miles</td>
                    <td>$${mileageRate.toFixed(3)}/mile</td>
                    <td>$${mileageTotal.toFixed(2)}</td>
                </tr>`;
            }
        }
        
        // Create HTML for payment terms and notes
        let termsAndNotesHTML = '';
        
        if (paymentTerms) {
            termsAndNotesHTML += `
            <div class="invoice-section">
                <h3>Payment Terms</h3>
                <p>${paymentTerms}</p>
            </div>`;
        }
        
        if (notes) {
            termsAndNotesHTML += `
            <div class="invoice-section">
                <h3>Notes</h3>
                <p>${notes}</p>
            </div>`;
        }
        
        // Create HTML for notarial acknowledgment
        let notarialHTML = '';
        
        if (addNotarialLanguage) {
            notarialHTML = `
            <div class="invoice-section notarial">
                <h3>NOTARIAL ACKNOWLEDGMENT</h3>
                <p>
                    STATE OF ______________ )<br>
                    COUNTY OF _____________ )<br>
                </p>
                <p>
                    On this day, personally appeared before me ${contractorName}, to me known to be the individual described in and who executed the foregoing instrument, and acknowledged that they signed the same as their free and voluntary act and deed, for the uses and purposes therein mentioned.
                </p>
                <p>
                    Given under my hand and official seal this ____ day of ______________, ${new Date().getFullYear()}.
                </p>
                <p class="signature-line">
                    _______________________________<br>
                    NOTARY PUBLIC<br>
                    My commission expires: ___________
                </p>
            </div>`;
        }
        
        // Build the complete invoice HTML
        const invoiceHTML = `
        <div class="invoice-document">
            <div class="invoice-header">
                <div class="invoice-title">
                    <h1>INVOICE</h1>
                </div>
                <div class="invoice-number">
                    <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
                    <p><strong>Date:</strong> ${invoiceDate}</p>
                    <p><strong>Due Date:</strong> ${dueDate}</p>
                </div>
            </div>
            
            <div class="invoice-parties">
                <div class="invoice-from">
                    <h3>From:</h3>
                    <p><strong>${contractorName}</strong></p>
                    <p>${formattedContractorAddress}</p>
                    <p>Phone: ${contractorPhone}</p>
                    <p>Email: ${contractorEmail}</p>
                </div>
                
                <div class="invoice-to">
                    <h3>To:</h3>
                    <p><strong>${companyName}</strong></p>
                    <p>${formattedCompanyAddress}</p>
                    ${contactPerson !== 'N/A' ? `<p>Attn: ${contactPerson}</p>` : ''}
                </div>
            </div>
            
            <div class="invoice-content">
                <table class="invoice-items">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Rate</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                        ${mileageHTML}
                    </tbody>
                </table>
                
                <div class="invoice-totals">
                    <p><strong>TOTAL:</strong> $${invoiceTotal.toFixed(2)}</p>
                </div>
                
                ${termsAndNotesHTML}
                
                ${notarialHTML}
            </div>
        </div>`;
        
        // Insert the HTML into the preview container
        invoicePreviewContainer.innerHTML = invoiceHTML;
    }
    
    // Format date from YYYY-MM-DD to MM/DD/YYYY
    function formatDate(dateString) {
        if (!dateString) return '';
        const parts = dateString.split('-');
        return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }
    
    // Check for URL parameters to pre-fill form
    window.addEventListener('load', function() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Check if there are multiple items in the URL parameters
        let maxItemIndex = 1;
        for (const [key, value] of urlParams.entries()) {
            // Look for itemDescription2, itemDescription3, etc. to determine how many items we need
            if (key.startsWith('itemDescription') && key !== 'itemDescription1') {
                const itemIndex = parseInt(key.replace('itemDescription', ''));
                if (!isNaN(itemIndex) && itemIndex > maxItemIndex) {
                    maxItemIndex = itemIndex;
                }
            }
        }
        
        // Add additional items if needed
        console.log('Found ' + maxItemIndex + ' items in URL parameters');
        for (let i = 2; i <= maxItemIndex; i++) {
            addInvoiceItem();
        }
        
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
        
        // Calculate all item amounts first
        for (let i = 1; i <= itemCount; i++) {
            calculateItemAmount(i);
        }
        
        // Then calculate totals
        calculateTotals();
    });
    
    // Trigger calculations when the DOM is fully loaded
    calculateItemAmount(1);
    calculateTotals();
});
