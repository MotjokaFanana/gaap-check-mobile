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
  doc.text(`Mileage: ${inspection.vehicle.mileage}`, margin, y); y += 6;
  if (inspection.driverName) { doc.text(`Driver: ${inspection.driverName}`, margin, y); y += 6; }
  if (inspection.inspectorName) { doc.text(`Inspector: ${inspection.inspectorName}`, margin, y); y += 10; } else { y += 4; }


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
    y += 4;
  }

  // Add signature if present
  if (inspection.signatureDataUrl) {
    y += 4;
    if (y > 240) { doc.addPage(); y = margin; }
    doc.setFontSize(13);
    doc.text("Driver Signature", margin, y); y += 8;
    
    try {
      // Add signature image to PDF
      doc.addImage(inspection.signatureDataUrl, 'PNG', margin, y, 60, 30);
      y += 35;
    } catch (error) {
      console.warn("Could not add signature to PDF:", error);
      doc.setFontSize(10);
      doc.text("Signature: [Present but could not be displayed]", margin, y);
      y += 6;
    }
  }

  // Format filename: DATE_NAMEOFDRIVER_INSPECTOR_REGISTRATIONNUMBER
  const date = new Date(inspection.createdAt).toISOString().split('T')[0].replace(/-/g, '');
  const driverName = (inspection.driverName || 'UNKNOWN').toUpperCase().replace(/\s+/g, '');
  const inspectorName = (inspection.inspectorName || 'UNKNOWN').toUpperCase().replace(/\s+/g, '');
  const registration = inspection.vehicle.registration.toUpperCase().replace(/\s+/g, '');
  
  const filename = `${date}_${driverName}_${inspectorName}_${registration}.pdf`;
  doc.save(filename);
}
