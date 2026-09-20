/**
 * The pay stub page's helpers (loaded after app.js): the stub beside the form, the mileage
 * arithmetic spelled out, Last week / This week, and the paying company remembered on this
 * device. None of it builds the PDF — app.js still does that, from the same fields — so the
 * preview mirrors the PDF's sections and wording line for line; if one changes, change both.
 */
(function () {
    'use strict';
    var form = document.getElementById('paystubForm');
    if (!form) return;
    var $ = function (id) { return document.getElementById(id); };
    var COMPANY_KEY = 'paytooling.company.v1';

    function toYmd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    function mdY(ymd) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(ymd || ''); return m ? parseInt(m[2], 10) + '/' + parseInt(m[3], 10) + '/' + m[1] : ''; }
    function money(n) { return '$' + (isFinite(n) ? n : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function num(id) { return parseFloat($(id).value) || 0; }
    function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
    function changed() { form.dispatchEvent(new Event('input', { bubbles: true })); }

    // ---- Last week / This week ------------------------------------------------------------
    function setWeek(offsetWeeks) {
        var monday = new Date();
        monday.setHours(12, 0, 0, 0);
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + offsetWeeks * 7);
        var friday = new Date(monday);
        friday.setDate(monday.getDate() + 4);
        $('payPeriodStart').value = toYmd(monday);
        $('payPeriodEnd').value = toYmd(friday);
        $('paymentDate').value = toYmd(friday);
        changed();
    }
    var startGroup = $('payPeriodStart').closest('.form-row') || $('payPeriodStart').closest('.form-group');
    var chips = el('div', 'week-chips');
    chips.appendChild(el('span', 'week-chips-label', 'Pay period:'));
    [['Last week', -1], ['This week', 0]].forEach(function (c) {
        var b = el('button', 'week-chip', c[0]);
        b.type = 'button';
        b.addEventListener('click', function () { setWeek(c[1]); });
        chips.appendChild(b);
    });
    startGroup.parentNode.insertBefore(chips, startGroup);

    // ---- The mileage arithmetic, and what it is --------------------------------------------
    var calc = el('p', 'mileage-calc');
    $('mileageRate').closest('.form-group').appendChild(calc);
    function paintCalc() {
        var miles = num('milesDriven'), rate = num('mileageRate');
        calc.textContent = '';
        if (!miles) { calc.appendChild(document.createTextNode('No miles this period — the stub will say so.')); return; }
        calc.appendChild(document.createTextNode(miles.toLocaleString('en-US') + ' mi × ' + money(rate) + ' = '));
        calc.appendChild(el('strong', '', money(miles * rate)));
        calc.appendChild(document.createTextNode(' — a record for the contractor’s own tax deduction. It is not added to the payment.'));
    }

    // ---- The stub beside the form ---------------------------------------------------------
    var card = form.closest('.card');
    var preview = el('aside', 'card stub-preview');
    preview.setAttribute('aria-label', 'Pay stub preview');
    card.parentNode.insertBefore(preview, card.nextSibling);
    card.parentNode.classList.add('has-stub-preview');

    function row(label, value, cls) { var r = el('div', 'stub-row' + (cls ? ' ' + cls : '')); r.appendChild(el('span', '', label)); r.appendChild(el('span', value ? '' : 'stub-blank', value || '—')); return r; }
    function paintPreview() {
        var miles = num('milesDriven'), rate = num('mileageRate');
        var company = $('companyName').value.trim();
        preview.textContent = '';
        preview.appendChild(el('p', 'stub-caption', 'The stub as it will print'));
        var sheet = el('div', 'stub-sheet');
        var head = el('div', 'stub-head');
        var who = el('div', '');
        who.appendChild(el('strong', company ? '' : 'stub-blank', company || 'Company name'));
        $('companyAddress').value.split('\n').forEach(function (l) { if (l.trim()) who.appendChild(el('div', '', l)); });
        head.appendChild(who);
        head.appendChild(el('div', 'stub-title', 'PAY STUB'));
        sheet.appendChild(head);
        sheet.appendChild(el('div', 'stub-sec', 'Contractor Information'));
        sheet.appendChild(row('Name', $('contractorName').value.trim()));
        sheet.appendChild(el('div', 'stub-sec', 'Payment Information'));
        var s = mdY($('payPeriodStart').value), e = mdY($('payPeriodEnd').value);
        sheet.appendChild(row('Pay Period', s && e ? s + ' to ' + e : ''));
        sheet.appendChild(row('Payment Date', mdY($('paymentDate').value)));
        sheet.appendChild(el('div', 'stub-sec', 'Payment Details'));
        sheet.appendChild(row('Contractor Payment', $('paymentAmount').value ? money(num('paymentAmount')) : '', 'stub-total'));
        sheet.appendChild(el('div', 'stub-sec', 'Mileage Record (For Contractor Tax Purposes)'));
        if (miles > 0) {
            sheet.appendChild(row('Miles Driven for Company Business', miles.toFixed(1) + ' miles'));
            sheet.appendChild(row('IRS Standard Mileage Rate*', '$' + rate.toFixed(2) + '/mile'));
            sheet.appendChild(row('Estimated Mileage Deduction Value**', '$' + (miles * rate).toFixed(2)));
            sheet.appendChild(el('p', 'stub-fine', '*Provided to assist with your tax reporting; confirm the applicable rate with your tax professional. **For information only; not a payment or reimbursement by ' + (company || 'the paying company') + '.'));
        } else {
            sheet.appendChild(el('p', 'stub-fine', 'No mileage reported for this period'));
        }
        var notes = $('notes').value.trim();
        if (notes) { sheet.appendChild(el('div', 'stub-sec', 'Notes')); sheet.appendChild(el('p', 'stub-notes', notes)); }
        preview.appendChild(sheet);
    }

    function paint() { paintCalc(); paintPreview(); }
    form.addEventListener('input', paint);
    form.addEventListener('change', paint);
    form.addEventListener('reset', function () { setTimeout(paint, 20); });
    var sample = $('fillSampleData');
    if (sample) sample.addEventListener('click', function () { setTimeout(paint, 20); });

    // ---- The paying company, remembered on this device --------------------------------------
    // Learns only from what is typed; a pre-fill link always wins and keeps the block open.
    function loadCompany() { try { return JSON.parse(localStorage.getItem(COMPANY_KEY)) || null; } catch (e) { return null; } }
    function saveCompany() { try { localStorage.setItem(COMPANY_KEY, JSON.stringify({ name: $('companyName').value, address: $('companyAddress').value })); } catch (e) { /* private mode */ } }
    ['companyName', 'companyAddress'].forEach(function (id) { $(id).addEventListener('input', saveCompany); });

    var companyGroups = [$('companyName').closest('.form-group'), $('companyAddress').closest('.form-group')];
    var line = el('p', 'company-line');
    var lineText = el('span', '');
    var change = el('button', 'btn company-change', 'Change');
    change.type = 'button';
    line.appendChild(lineText); line.appendChild(change);
    companyGroups[0].parentNode.insertBefore(line, companyGroups[0]);
    function fold(on) {
        companyGroups.forEach(function (g) { g.style.display = on ? 'none' : ''; });
        line.style.display = on ? '' : 'none';
        if (on) lineText.textContent = '✓ ' + $('companyName').value + ' · ' + $('companyAddress').value.split('\n').filter(Boolean).slice(-1)[0];
    }
    change.addEventListener('click', function () { fold(false); $('companyName').focus(); });
    form.addEventListener('reset', function () { setTimeout(function () { fold(false); }, 30); });

    // app.js applies URL pre-fill on window load; settle after it.
    window.addEventListener('load', function () {
        setTimeout(function () {
            var params = new URLSearchParams(location.search);
            var fromLink = params.has('companyName') || params.has('companyAddress');
            var saved = loadCompany();
            if (!fromLink && saved && saved.name) { $('companyName').value = saved.name; $('companyAddress').value = saved.address || ''; }
            fold(!fromLink && !!$('companyName').value.trim() && !!$('companyAddress').value.trim());
            paint();
        }, 0);
    });
    fold(false);
    paint();
})();
