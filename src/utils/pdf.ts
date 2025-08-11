import { jsPDF } from "jspdf";
import type { StoredInspection } from "./storage";

export async function exportInspectionAsPDF(inspection: StoredInspection) {
  const doc = new jsPDF();
  const margin = 14;
  let y = margin;

  doc.setFontSize(16);
  doc.text("Vehicle Inspection Report", margin, y);
  y += 8;

  doc.setFontSize(11);
  doc.text(`Date: ${new Date(inspection.createdAt).toLocaleString()}`, margin, y); y += 6;
  doc.text(`Type: ${inspection.inspectionType}`, margin, y); y += 6;
  doc.text(`Vehicle: ${inspection.vehicle.make} ${inspection.vehicle.model}`, margin, y); y += 6;
  doc.text(`Registration: ${inspection.vehicle.registration}`, margin, y); y += 6;
  doc.text(`Mileage: ${inspection.vehicle.mileage}`, margin, y); y += 10;

  doc.setFontSize(13);
  doc.text("Checklist", margin, y); y += 8;
  doc.setFontSize(10);

  Object.entries(inspection.checklist).forEach(([categoryId, items]) => {
    doc.text(categoryId.toUpperCase(), margin, y);
    y += 5;
    Object.entries(items).forEach(([itemId, state]) => {
      const line = `- ${itemId}: ${state.status ?? "n/a"}${state.comment ? ` ("${state.comment}")` : ""}`;
      doc.text(line, margin + 4, y);
      y += 5;
      if (y > 280) { doc.addPage(); y = margin; }
    });
    y += 2;
    if (y > 280) { doc.addPage(); y = margin; }
  });

  if (inspection.generalComments) {
    y += 4;
    doc.setFontSize(13);
    doc.text("General Comments", margin, y); y += 6;
    doc.setFontSize(10);
    const split = doc.splitTextToSize(inspection.generalComments, 180);
    split.forEach((line: string) => { doc.text(line, margin, y); y += 5; });
  }

  doc.save(`inspection-${inspection.vehicle.registration}-${inspection.id}.pdf`);
}
