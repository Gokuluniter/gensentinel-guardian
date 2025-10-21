import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ThreatData {
  id: string;
  threat_type: string;
  threat_level: string;
  description: string;
  risk_score: number;
  created_at: string;
  resolved_at?: string;
  is_resolved: boolean;
  resolution_notes?: string;
  ai_explanation?: string;
  detection_method?: string;
  user?: {
    first_name: string;
    last_name: string;
    employee_id: string;
    department: string;
  };
  resolver?: {
    first_name: string;
    last_name: string;
  };
}

/**
 * Generate a comprehensive PDF report for a single threat
 */
export const generateThreatReport = (threat: ThreatData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number = 20) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // Helper function to add wrapped text
  const addWrappedText = (text: string, fontSize: number = 10, maxWidth: number = 170) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      checkPageBreak();
      doc.text(line, 20, yPos);
      yPos += fontSize * 0.5;
    });
    yPos += 5;
  };

  // ========== HEADER ==========
  doc.setFillColor(220, 38, 38); // Red background
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('GenSentinel Guardian', 20, 20);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Security Threat Detection Report', 20, 30);

  // Reset text color
  doc.setTextColor(0, 0, 0);
  yPos = 55;

  // ========== THREAT SUMMARY BOX ==========
  checkPageBreak(40);
  
  // Threat level badge
  let badgeColor: [number, number, number] = [156, 163, 175]; // gray
  switch (threat.threat_level) {
    case 'critical':
      badgeColor = [220, 38, 38]; // red
      break;
    case 'high':
      badgeColor = [249, 115, 22]; // orange
      break;
    case 'medium':
      badgeColor = [234, 179, 8]; // yellow
      break;
    case 'low':
      badgeColor = [34, 197, 94]; // green
      break;
  }

  doc.setFillColor(...badgeColor);
  doc.roundedRect(20, yPos, 50, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(threat.threat_level?.toUpperCase() || 'UNKNOWN', 25, yPos + 7);

  // Status badge
  if (threat.is_resolved) {
    doc.setFillColor(34, 197, 94); // green
    doc.roundedRect(75, yPos, 35, 10, 2, 2, 'F');
    doc.text('RESOLVED', 80, yPos + 7);
  } else {
    doc.setFillColor(220, 38, 38); // red
    doc.roundedRect(75, yPos, 30, 10, 2, 2, 'F');
    doc.text('ACTIVE', 80, yPos + 7);
  }

  yPos += 20;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  // ========== BASIC INFORMATION ==========
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Threat Information', 20, yPos);
  yPos += 10;

  const basicInfo = [
    ['Threat ID', threat.id],
    ['Threat Type', threat.threat_type || 'Unknown'],
    ['Risk Score', `${threat.risk_score}/100`],
    ['Detection Method', threat.detection_method?.replace('_', ' ').toUpperCase() || 'Automated'],
    ['Detected At', new Date(threat.created_at).toLocaleString()],
  ];

  if (threat.is_resolved && threat.resolved_at) {
    basicInfo.push(['Resolved At', new Date(threat.resolved_at).toLocaleString()]);
    if (threat.resolver) {
      basicInfo.push([
        'Resolved By',
        `${threat.resolver.first_name} ${threat.resolver.last_name}`,
      ]);
    }
  }

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: basicInfo,
    theme: 'striped',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 120 },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ========== DESCRIPTION ==========
  checkPageBreak(30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  addWrappedText(threat.description || 'No description provided');

  // ========== USER INFORMATION ==========
  if (threat.user) {
    checkPageBreak(40);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Affected User', 20, yPos);
    yPos += 10;

    const userInfo = [
      ['Name', `${threat.user.first_name} ${threat.user.last_name}`],
      ['Employee ID', threat.user.employee_id],
      ['Department', threat.user.department?.toUpperCase()],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: userInfo,
      theme: 'striped',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 120 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // ========== AI EXPLANATION ==========
  if (threat.ai_explanation) {
    checkPageBreak(40);
    
    // AI Explanation header box
    doc.setFillColor(59, 130, 246); // blue
    doc.rect(20, yPos - 5, pageWidth - 40, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('🤖 AI Security Analysis (XAI)', 25, yPos + 3);
    
    yPos += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Add border box for AI explanation
    const explanationText = threat.ai_explanation;
    const lines = doc.splitTextToSize(explanationText, 160);
    const boxHeight = lines.length * 5 + 10;
    
    checkPageBreak(boxHeight + 10);
    
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.rect(20, yPos, pageWidth - 40, boxHeight);
    
    yPos += 8;
    lines.forEach((line: string) => {
      doc.text(line, 25, yPos);
      yPos += 5;
    });
    yPos += 10;
  }

  // ========== RESOLUTION NOTES ==========
  if (threat.is_resolved && threat.resolution_notes) {
    checkPageBreak(40);
    
    // Resolution header box
    doc.setFillColor(34, 197, 94); // green
    doc.rect(20, yPos - 5, pageWidth - 40, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('✅ Resolution Notes', 25, yPos + 3);
    
    yPos += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const resolutionLines = doc.splitTextToSize(threat.resolution_notes, 160);
    const resBoxHeight = resolutionLines.length * 5 + 10;
    
    checkPageBreak(resBoxHeight + 10);
    
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.5);
    doc.rect(20, yPos, pageWidth - 40, resBoxHeight);
    
    yPos += 8;
    resolutionLines.forEach((line: string) => {
      doc.text(line, 25, yPos);
      yPos += 5;
    });
    yPos += 10;
  }

  // ========== FOOTER ==========
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `GenSentinel Guardian - Confidential | Generated: ${new Date().toLocaleString()} | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // ========== SAVE PDF ==========
  const fileName = `Threat_Report_${threat.threat_type}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  return fileName;
};

/**
 * Generate a summary report for multiple threats
 */
export const generateMultipleThreatReport = (threats: ThreatData[], title: string = 'Threat Summary Report') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ========== HEADER ==========
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('GenSentinel Guardian', 20, 20);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 20, 30);

  doc.setTextColor(0, 0, 0);
  let yPos = 55;

  // ========== SUMMARY STATISTICS ==========
  const total = threats.length;
  const active = threats.filter(t => !t.is_resolved).length;
  const resolved = threats.filter(t => t.is_resolved).length;
  const critical = threats.filter(t => t.threat_level === 'critical').length;
  const high = threats.filter(t => t.threat_level === 'high').length;
  const medium = threats.filter(t => t.threat_level === 'medium').length;
  const low = threats.filter(t => t.threat_level === 'low').length;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 20, yPos);
  yPos += 10;

  const summaryData = [
    ['Total Threats', total.toString()],
    ['Active Threats', active.toString()],
    ['Resolved Threats', resolved.toString()],
    ['Critical', critical.toString()],
    ['High', high.toString()],
    ['Medium', medium.toString()],
    ['Low', low.toString()],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: summaryData,
    theme: 'striped',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 90, halign: 'center' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // ========== THREATS TABLE ==========
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Threat Details', 20, yPos);
  yPos += 5;

  const tableData = threats.map(threat => [
    threat.threat_type || 'Unknown',
    threat.threat_level?.toUpperCase() || 'N/A',
    `${threat.risk_score}/100`,
    threat.is_resolved ? 'Resolved' : 'Active',
    new Date(threat.created_at).toLocaleDateString(),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Type', 'Level', 'Risk', 'Status', 'Date']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [220, 38, 38], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 30 },
    },
  });

  // ========== FOOTER ==========
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `GenSentinel Guardian - Confidential | Generated: ${new Date().toLocaleString()} | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // ========== SAVE PDF ==========
  const fileName = `Threat_Summary_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  return fileName;
};

