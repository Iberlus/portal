/* Presupuesto IBERLUS (A4, pt). Plantilla propia, sencilla, con los colores de Iberlus.
   Uso: const doc = presupuestoIberlus(jsPDF, presupuesto, recursos)
   recursos = window.FACTURA_RES (fuentes Carlito y logo, definidos en factura.js) */
(function (root) {
  "use strict";
  const PINK = [228, 6, 138], BLUE = [0, 191, 255], NAVY = [27, 45, 82], GREY = [95, 95, 95], BLACK = [0, 0, 0], LIGHT = [244, 245, 248], LINE = [222, 225, 232], DEEP = [0, 0, 255];
  const W = 595.28, H = 841.89, L = 36, Rm = W - 36;
  const n2 = (n, min = 2, max = 2) => (Number(n) || 0).toLocaleString("es-ES", { minimumFractionDigits: min, maximumFractionDigits: max, useGrouping: "always" });
  const money = n => n2(n) + " €";
  const qty = n => Number.isInteger(+n) ? String(+n) : n2(n, 0, 3);
  const pct = n => n2(n, 0, 2) + " %";
  const fecha = s => { const m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + "/" + m[2] + "/" + m[1] : String(s || ""); };

  function presupuestoIberlus(jsPDF, p, R) {
    const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
    doc.addFileToVFS("Carlito.ttf", R.carlito); doc.addFont("Carlito.ttf", "Calibri", "normal");
    doc.addFileToVFS("CarlitoB.ttf", R.carlitoBold); doc.addFont("CarlitoB.ttf", "Calibri", "bold");
    doc.setProperties({ title: "Presupuesto " + p.num, author: "Iberlus Distribución Doméstica, S.L." });
    const font = (sz, bold, col) => { doc.setFont("Calibri", bold ? "bold" : "normal"); doc.setFontSize(sz); doc.setTextColor(...(col || BLACK)); };
    const c = p.cli || {};
    // columnas
    const C = { code: L + 6, desc: L + 70, descW: 236, uds: L + 340, pre: L + 392, d1: L + 432, d2: L + 472, imp: Rm - 6 };
    const ROW = 12.5, BOTTOM = H - 58;

    const tableHead = y => {
      doc.setFillColor(...BLUE); doc.rect(L, y, Rm - L, 18, "F");
      font(9.5, true, [255, 255, 255]);
      doc.text("Código", C.code, y + 12.5); doc.text("Descripción", C.desc, y + 12.5);
      doc.text("Uds", C.uds, y + 12.5, { align: "right" }); doc.text("Precio", C.pre, y + 12.5, { align: "right" });
      doc.text("Dto 1", C.d1, y + 12.5, { align: "right" }); doc.text("Dto 2", C.d2, y + 12.5, { align: "right" });
      doc.text("Importe", C.imp, y + 12.5, { align: "right" });
      return y + 18;
    };
    const head = first => {
      if (!first) {
        font(10, true, PINK); doc.text("PRESUPUESTO " + p.num, L, 40);
        font(9.5, false, GREY); doc.text((c.fiscal || c.name || "") + " · " + fecha(p.fecha) + " · (continuación)", Rm, 40, { align: "right" });
        return tableHead(52);
      }
      if (R.logo) doc.addImage(R.logo, R.logoFmt || "JPEG", L - 4, 24, 98, 70);
      font(30, true, PINK); doc.text("PRESUPUESTO", Rm, 56, { align: "right" });
      font(13, true, NAVY); doc.text("Nº " + p.num, Rm, 78, { align: "right" });
      font(10.5, false, GREY); doc.text("Fecha: " + fecha(p.fecha), Rm, 93, { align: "right" });
      font(8.5, false, GREY);
      doc.text("Iberlus Distribución Doméstica, S.L. · Av. de la Estación 11 · 36818 Redondela (Pontevedra) · 986 40 03 40", L, 110);
      // cliente
      const y0 = 122, bw = 330;
      const cl = [];
      font(11, true, BLACK);
      const nm = doc.splitTextToSize(c.fiscal || c.name || "", bw - 20).slice(0, 2);
      const extra = [];
      if (c.fiscal && c.name && c.fiscal.toLowerCase() !== c.name.toLowerCase()) extra.push(c.name);
      const pob = [c.cp, c.pob].filter(Boolean).join(" ") + (c.prov && c.prov !== c.pob ? " (" + c.prov + ")" : "");
      if (pob.trim()) extra.push(pob.trim());
      const ids = [c.nif ? "NIF " + c.nif : "", c.code ? "Cód. cliente " + c.code : ""].filter(Boolean).join(" · ");
      if (ids) extra.push(ids);
      const ct = [c.tel, c.email].filter(Boolean).join(" · ");
      if (ct) extra.push(ct);
      const bh = Math.max(74, 26 + nm.length * 13 + extra.length * 12.5);
      doc.setDrawColor(...LINE); doc.setLineWidth(0.8); doc.roundedRect(L, y0, bw, bh, 5, 5, "S");
      font(8.5, true, BLUE); doc.text("CLIENTE", L + 10, y0 + 14);
      font(11, true, BLACK); nm.forEach((t, k) => doc.text(t, L + 10, y0 + 28 + k * 13));
      font(9.5, false, BLACK); extra.forEach((t, k) => doc.text(doc.splitTextToSize(t, bw - 20)[0], L + 10, y0 + 28 + nm.length * 13 + k * 12.5));
      // comercial y validez
      const x2 = L + bw + 12, w2 = Rm - x2;
      doc.setFillColor(...LIGHT); doc.roundedRect(x2, y0, w2, bh, 5, 5, "F");
      font(8.5, true, BLUE); doc.text("COMERCIAL", x2 + 10, y0 + 14);
      font(11, true, BLACK); doc.text(doc.splitTextToSize(p.comNom || "", w2 - 20)[0] || "", x2 + 10, y0 + 28);
      font(8.5, true, BLUE); doc.text("VALIDEZ DE LA OFERTA", x2 + 10, y0 + 48);
      font(11, true, BLACK); doc.text("30 días", x2 + 10, y0 + 62);
      cl.length = 0;
      return tableHead(y0 + bh + 16);
    };

    let y = head(true);
    const newPage = () => { doc.addPage(); y = head(false); };
    (p.lines || []).forEach((l, i) => {
      if (l.t === "x") {
        font(9.5, true, NAVY);
        const tx = [];
        String(l.desc || "").split(/\r?\n/).forEach(s => tx.push(...(s.trim() ? doc.splitTextToSize(s, Rm - L - 12) : [""])));
        const h = tx.length * ROW + 6;
        if (y + h > BOTTOM) newPage();
        font(9.5, true, NAVY); tx.forEach((t, k) => doc.text(t, C.code, y + 12 + k * ROW));
        y += h; doc.setDrawColor(...LINE); doc.setLineWidth(0.5); doc.line(L, y, Rm, y);
        return;
      }
      font(9.5, false, BLACK);
      const ds = [];
      String(l.desc || "").split(/\r?\n/).forEach(s => ds.push(...(s.trim() ? doc.splitTextToSize(s, C.descW) : [])));
      if (!ds.length) ds.push("");
      const h = ds.length * ROW + 6;
      if (y + h > BOTTOM) newPage();
      const ty = y + 12;
      font(9, false, GREY); doc.text(doc.splitTextToSize(String(l.code || ""), 60)[0] || "", C.code, ty);
      font(9.5, false, BLACK); ds.forEach((t, k) => doc.text(t, C.desc, ty + k * ROW));
      if (+l.qty) doc.text(qty(l.qty), C.uds, ty, { align: "right" });
      if (+l.price) doc.text(n2(l.price, 2, 3), C.pre, ty, { align: "right" });
      if (+l.d1) doc.text(pct(l.d1), C.d1, ty, { align: "right" });
      if (+l.d2) doc.text(pct(l.d2), C.d2, ty, { align: "right" });
      font(9.5, true, BLACK); doc.text(money(l.imp), C.imp, ty, { align: "right" });
      y += h; doc.setDrawColor(...LINE); doc.setLineWidth(0.5); doc.line(L, y, Rm, y);
    });

    // bloque fijo al pie de la última página (como las facturas)
    const y0 = H - 132;
    if (y > y0 - 14) newPage();
    doc.setDrawColor(...LINE); doc.setLineWidth(0.8); doc.line(L, y0 - 8, Rm, y0 - 8);
    const tx = Rm - 210;
    font(10, false, GREY); doc.text("Base imponible", tx, y0 + 10); font(10.5, false, BLACK); doc.text(money(p.base), Rm - 6, y0 + 10, { align: "right" });
    font(10, false, GREY); doc.text("IVA 21 %", tx, y0 + 26); font(10.5, false, BLACK); doc.text(money(p.iva), Rm - 6, y0 + 26, { align: "right" });
    doc.setFillColor(...PINK); doc.roundedRect(tx - 8, y0 + 34, Rm - tx + 8, 26, 4, 4, "F");
    font(12, true, [255, 255, 255]); doc.text("TOTAL", tx, y0 + 51.5); doc.text(money(p.total), Rm - 6, y0 + 51.5, { align: "right" });
    const k = p.contacto || {}, lw = tx - 20 - L;
    let ly = y0 + 10;
    if (k.nom || k.tel) {
      font(10, true, BLACK); doc.text(k.nom || "", L, ly);
      if (k.tel) { const w = doc.getTextWidth(k.nom || ""); font(10, false, BLACK); doc.text((k.nom ? " · " : "") + k.tel, L + w, ly); }
      ly += 13;
    }
    if (k.mail) { font(9.5, false, GREY); doc.text(doc.splitTextToSize(k.mail, lw)[0], L, ly); }
    font(10, true, NAVY); doc.text("Validez de la oferta: 30 días.", L, y0 + 41);
    font(10, true, BLUE); doc.text("Nuestro IBAN:", L, y0 + 57);
    const iw = doc.getTextWidth("Nuestro IBAN: ");
    font(10, true, DEEP); const ib = "ES87 2080 3568 0130 4000 5211 - ABANCA"; doc.text(ib, L + iw, y0 + 57);
    doc.setDrawColor(...DEEP); doc.setLineWidth(0.6); doc.line(L + iw, y0 + 59, L + iw + doc.getTextWidth(ib), y0 + 59);

    const pages = doc.getNumberOfPages();
    for (let k = 1; k <= pages; k++) {
      doc.setPage(k);
      doc.setDrawColor(...PINK); doc.setLineWidth(1); doc.line(L, H - 40, Rm, H - 40);
      font(8.5, false, GREY);
      doc.text("Iberlus Distribución Doméstica, S.L. · CIF B94067253 · iberlus.com · comercial@iberlus.com", L, H - 26);
      doc.text("Página " + k + " de " + pages, Rm, H - 26, { align: "right" });
    }
    return doc;
  }
  if (typeof module !== "undefined") module.exports = presupuestoIberlus; else root.presupuestoIberlus = presupuestoIberlus;
})(this);
