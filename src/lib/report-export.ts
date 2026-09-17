import type { SaleRecord } from "@/stores/sales-store";
import { money } from "@/lib/currency";

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface SalesExportOptions {
  title: string;
  branchName?: string;
  /** Optional resolver for per-sale branch name (used when exporting across branches). */
  branchNameOf?: (s: SaleRecord) => string;
  filename: string;
}

/**
 * Export sales as a CSV (Excel-compatible). One row per line item,
 * including batch and expiry for full auditability.
 */
export function exportSalesCSV(sales: SaleRecord[], opts: SalesExportOptions) {
  const header = [
    "Invoice No", "Date", "Time", "Branch", "Customer", "Phone",
    "Medicine", "Batch", "Expiry",
    "Qty", "Unit Price", "Line Total",
    "Sale Subtotal", "Sale Discount", "Sale VAT", "Sale Total", "Payment",
  ];

  const lines: string[] = [];
  lines.push(header.map(csvEscape).join(","));

  for (const s of sales) {
    const date = s.date.toLocaleDateString();
    const time = s.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const branch = opts.branchNameOf ? opts.branchNameOf(s) : (opts.branchName ?? "");
    for (const i of s.items) {
      lines.push([
        s.invoiceNo, date, time,
        branch,
        s.customerName || "Walk-in", s.customerPhone || "",
        i.name, i.batch ?? "", i.expiry ?? "",
        i.qty, i.price.toFixed(2), (i.qty * i.price).toFixed(2),
        s.subtotal.toFixed(2), s.discount.toFixed(2), s.vat.toFixed(2), s.total.toFixed(2),
        s.paymentMethod,
      ].map(csvEscape).join(","));
    }
  }

  // BOM so Excel detects UTF-8
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8",
  });
  triggerDownload(blob, `${opts.filename}.csv`);
}

function reportHTML(sales: SaleRecord[], opts: SalesExportOptions): string {
  const totalRevenue = sales.reduce((a, s) => a + s.total, 0);
  const totalItems = sales.reduce((a, s) => a + s.items.reduce((b, i) => b + i.qty, 0), 0);

  const rows = sales
    .flatMap((s) =>
      s.items.map(
        (i, idx) => `<tr>
        <td>${idx === 0 ? s.invoiceNo : ""}</td>
        <td>${idx === 0 ? s.date.toLocaleString() : ""}</td>
        <td>${idx === 0 ? (s.customerName || "Walk-in") : ""}</td>
        <td>${i.name}</td>
        <td>${i.batch ?? "—"}</td>
        <td>${i.expiry ?? "—"}</td>
        <td style="text-align:center">${i.qty}</td>
        <td style="text-align:right">${money(i.price)}</td>
        <td style="text-align:right">${money((i.qty * i.price))}</td>
        <td style="text-align:right">${idx === 0 ? "$" + s.total.toFixed(2) : ""}</td>
      </tr>`
      )
    )
    .join("");

  return `<!DOCTYPE html><html><head><title>${opts.title}</title>
<style>
@media print{@page{size:A4 landscape;margin:10mm}}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;padding:16px;margin:0}
h1{margin:0 0 4px 0;font-size:20px;color:#2563eb}
.meta{font-size:11px;color:#666;margin-bottom:12px}
.kpis{display:flex;gap:12px;margin:12px 0}
.kpi{flex:1;padding:10px;background:#f0f7ff;border-radius:8px}
.kpi p{margin:0;font-size:10px;text-transform:uppercase;color:#666;letter-spacing:0.5px}
.kpi strong{font-size:16px;color:#2563eb}
table{width:100%;border-collapse:collapse;margin-top:8px;font-size:11px}
th{background:#2563eb;color:#fff;padding:6px;text-align:left;font-size:10px;text-transform:uppercase}
td{padding:5px 6px;border-bottom:1px solid #eee;vertical-align:top}
tr:nth-child(even) td{background:#fafafa}
.footer{margin-top:14px;font-size:10px;color:#999;text-align:center}
</style></head><body>
<h1>${opts.title}</h1>
<div class="meta">
  Generated: ${new Date().toLocaleString()}${opts.branchName ? ` • Branch: ${opts.branchName}` : ""} • ${sales.length} invoice(s)
</div>
<div class="kpis">
  <div class="kpi"><p>Invoices</p><strong>${sales.length}</strong></div>
  <div class="kpi"><p>Items Sold</p><strong>${totalItems}</strong></div>
  <div class="kpi"><p>Revenue</p><strong>${money(totalRevenue)}</strong></div>
</div>
<table>
<thead><tr>
  <th>Invoice</th><th>Date</th><th>Customer</th>
  <th>Medicine</th><th>Batch</th><th>Expiry</th>
  <th style="text-align:center">Qty</th><th style="text-align:right">Unit</th><th style="text-align:right">Amount</th>
  <th style="text-align:right">Invoice Total</th>
</tr></thead>
<tbody>${rows || `<tr><td colspan="10" style="text-align:center;padding:20px;color:#999">No sales in range</td></tr>`}</tbody>
</table>
<div class="footer">MediCore Pharmacy POS — Sales Register with batch & expiry audit trail</div>
</body></html>`;
}

export async function exportSalesPDF(sales: SaleRecord[], opts: SalesExportOptions) {
  const { default: html2pdf } = await import("html2pdf.js");
  const html = reportHTML(sales, opts);

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = "297mm";
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  container.innerHTML =
    (styleMatch ? `<style>${styleMatch[1]}</style>` : "") +
    (bodyMatch ? bodyMatch[1] : html);
  document.body.appendChild(container);

  const config = {
    margin: [8, 8, 8, 8],
    filename: `${opts.filename}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#fff" },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    pagebreak: { mode: ["css", "legacy"] },
  };

  try {
    await (
      html2pdf as unknown as () => {
        set: (o: unknown) => { from: (el: HTMLElement) => { save: () => Promise<void> } };
      }
    )()
      .set(config)
      .from(container)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}
