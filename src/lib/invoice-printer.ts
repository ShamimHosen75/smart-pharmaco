interface InvoiceData {
  invoiceNo: string;
  date: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  paymentMethod: string;
}

const pharmacyInfo = {
  name: "MediCore Pharmacy",
  address: "123 Health Street, Medical District",
  phone: "+1 234 567 890",
  email: "info@medicore.com",
  license: "PH-2024-12345",
};

function generateInvoiceNo() {
  const d = new Date();
  return `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
}

function thermalHTML(data: InvoiceData): string {
  const rows = data.items
    .map(
      (i) =>
        `<tr><td style="text-align:left;font-size:11px;padding:2px 0">${i.name}</td><td style="text-align:center;font-size:11px">${i.qty}</td><td style="text-align:right;font-size:11px">$${(i.price * i.qty).toFixed(2)}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html><html><head><title>Receipt</title>
<style>
@media print{@page{size:80mm auto;margin:0}body{margin:4mm}}
body{font-family:'Courier New',monospace;width:72mm;margin:0 auto;color:#000}
.center{text-align:center}
.line{border-top:1px dashed #000;margin:6px 0}
table{width:100%;border-collapse:collapse}
th{font-size:10px;text-transform:uppercase;border-bottom:1px solid #000;padding:3px 0}
.total-row{font-weight:bold;font-size:13px}
</style></head><body>
<div class="center">
  <h2 style="margin:4px 0;font-size:16px">${pharmacyInfo.name}</h2>
  <p style="margin:2px 0;font-size:10px">${pharmacyInfo.address}</p>
  <p style="margin:2px 0;font-size:10px">Tel: ${pharmacyInfo.phone}</p>
  <p style="margin:2px 0;font-size:10px">License: ${pharmacyInfo.license}</p>
</div>
<div class="line"></div>
<table><tr><td style="font-size:10px">Invoice: ${data.invoiceNo}</td><td style="text-align:right;font-size:10px">${data.date}</td></tr></table>
${data.customerName ? `<p style="font-size:10px;margin:2px 0">Customer: ${data.customerName} ${data.customerPhone ? "| " + data.customerPhone : ""}</p>` : ""}
<div class="line"></div>
<table>
<thead><tr><th style="text-align:left">Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<div class="line"></div>
<table>
<tr><td style="font-size:11px">Subtotal</td><td style="text-align:right;font-size:11px">$${data.subtotal.toFixed(2)}</td></tr>
<tr><td style="font-size:11px">Discount</td><td style="text-align:right;font-size:11px">-$${data.discount.toFixed(2)}</td></tr>
<tr><td style="font-size:11px">VAT (5%)</td><td style="text-align:right;font-size:11px">$${data.vat.toFixed(2)}</td></tr>
</table>
<div class="line"></div>
<table><tr class="total-row"><td>TOTAL</td><td style="text-align:right">$${data.total.toFixed(2)}</td></tr></table>
<p style="font-size:10px;margin:4px 0">Payment: ${data.paymentMethod.toUpperCase()}</p>
<div class="line"></div>
<div class="center" style="margin-top:6px">
  <p style="font-size:10px">Thank you for your purchase!</p>
  <p style="font-size:9px;color:#666">Powered by MediCore POS</p>
</div>
</body></html>`;
}

function a4HTML(data: InvoiceData): string {
  const rows = data.items
    .map(
      (i, idx) =>
        `<tr style="border-bottom:1px solid #eee"><td style="padding:8px;font-size:13px">${idx + 1}</td><td style="padding:8px;font-size:13px">${i.name}</td><td style="padding:8px;text-align:center;font-size:13px">${i.qty}</td><td style="padding:8px;text-align:right;font-size:13px">$${i.price.toFixed(2)}</td><td style="padding:8px;text-align:right;font-size:13px">$${(i.price * i.qty).toFixed(2)}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html><html><head><title>Invoice ${data.invoiceNo}</title>
<style>
@media print{@page{size:A4;margin:15mm}}
body{font-family:'Segoe UI',Arial,sans-serif;max-width:210mm;margin:0 auto;padding:20mm;color:#1a1a2e}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px}
.brand h1{margin:0;font-size:24px;color:#2563eb}
.brand p{margin:2px 0;font-size:12px;color:#666}
.invoice-info{text-align:right}
.invoice-info h2{margin:0;font-size:28px;color:#2563eb;font-weight:300;text-transform:uppercase;letter-spacing:2px}
.invoice-info p{margin:3px 0;font-size:12px;color:#666}
.meta{display:flex;justify-content:space-between;margin:24px 0;padding:16px;background:#f0f7ff;border-radius:8px}
.meta div p{margin:2px 0;font-size:12px}
.meta div p:first-child{font-weight:600;color:#333;font-size:11px;text-transform:uppercase;letter-spacing:0.5px}
table{width:100%;border-collapse:collapse;margin:20px 0}
thead th{background:#2563eb;color:#fff;padding:10px 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px}
thead th:first-child{border-radius:6px 0 0 0}
thead th:last-child{border-radius:0 6px 0 0}
.summary{display:flex;justify-content:flex-end;margin-top:20px}
.summary table{width:280px}
.summary td{padding:6px 8px;font-size:13px}
.summary .total-row td{font-size:18px;font-weight:700;color:#2563eb;border-top:2px solid #2563eb;padding-top:10px}
.footer{margin-top:40px;padding-top:16px;border-top:1px solid #eee;text-align:center;font-size:11px;color:#999}
</style></head><body>
<div class="header">
  <div class="brand">
    <h1>⚕ ${pharmacyInfo.name}</h1>
    <p>${pharmacyInfo.address}</p>
    <p>Tel: ${pharmacyInfo.phone} | Email: ${pharmacyInfo.email}</p>
    <p>License: ${pharmacyInfo.license}</p>
  </div>
  <div class="invoice-info">
    <h2>Invoice</h2>
    <p><strong>${data.invoiceNo}</strong></p>
    <p>Date: ${data.date}</p>
  </div>
</div>
<div class="meta">
  <div>
    <p>Bill To</p>
    <p style="font-size:14px;color:#000">${data.customerName || "Walk-in Customer"}</p>
    ${data.customerPhone ? `<p>${data.customerPhone}</p>` : ""}
  </div>
  <div style="text-align:right">
    <p>Payment Method</p>
    <p style="font-size:14px;color:#000">${data.paymentMethod.charAt(0).toUpperCase() + data.paymentMethod.slice(1)}</p>
  </div>
</div>
<table>
<thead><tr><th style="text-align:left">#</th><th style="text-align:left">Medicine</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Amount</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<div class="summary"><table>
<tr><td>Subtotal</td><td style="text-align:right">$${data.subtotal.toFixed(2)}</td></tr>
<tr><td>Discount</td><td style="text-align:right">-$${data.discount.toFixed(2)}</td></tr>
<tr><td>VAT (5%)</td><td style="text-align:right">$${data.vat.toFixed(2)}</td></tr>
<tr class="total-row"><td>Total</td><td style="text-align:right">$${data.total.toFixed(2)}</td></tr>
</table></div>
<div class="footer">
  <p>Thank you for choosing ${pharmacyInfo.name}!</p>
  <p>This is a computer-generated invoice. No signature required.</p>
</div>
</body></html>`;
}

export function printInvoice(
  format: "thermal" | "a4",
  data: InvoiceData
) {
  const html = format === "thermal" ? thermalHTML(data) : a4HTML(data);
  const win = window.open("", "_blank", "width=800,height=600");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    win.print();
  };
}

export { generateInvoiceNo };
export type { InvoiceData };
