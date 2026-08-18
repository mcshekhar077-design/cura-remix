import { jsPDF } from 'jspdf';

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (time: string): string => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generatePDF = (
  title: string,
  content: Record<string, unknown>,
  filename: string
): void => {
  try {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(title, 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    // Content
    let y = 50;
    doc.setTextColor(15, 23, 42);

    Object.entries(content).forEach(([key, value]) => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(key, 14, y);
      y += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(String(value), 180);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 6;
    });

    doc.save(filename);
  } catch (error) {
    console.error('PDF generation error:', error);
  }
};

export const calculateHealthScore = (
  vitals: { bp: string; hr: number; glucose: string; oxygen: number },
  conditions: string[]
): number => {
  let score = 100;

  // Blood pressure evaluation
  const bpMatch = vitals.bp.match(/(\d+)\/(\d+)/);
  if (bpMatch) {
    const systolic = parseInt(bpMatch[1], 10);
    if (systolic > 140) score -= 15;
    else if (systolic > 130) score -= 10;
    else if (systolic > 120) score -= 5;
  }

  // Heart rate evaluation
  if (vitals.hr > 100 || vitals.hr < 50) score -= 10;
  else if (vitals.hr > 90) score -= 5;

  // Glucose evaluation
  const glucoseMatch = vitals.glucose.match(/(\d+)/);
  if (glucoseMatch) {
    const glucose = parseInt(glucoseMatch[1], 10);
    if (glucose > 140) score -= 15;
    else if (glucose > 120) score -= 10;
  }

  // Oxygen saturation evaluation
  if (vitals.oxygen < 95) score -= 15;
  else if (vitals.oxygen < 97) score -= 5;

  // Conditions count
  if (conditions.length > 3) score -= 10;
  else if (conditions.length > 1) score -= 5;

  return Math.max(0, Math.min(100, score));
};

export const getRiskLevel = (score: number): 'low' | 'moderate' | 'high' => {
  if (score >= 80) return 'low';
  if (score >= 60) return 'moderate';
  return 'high';
};
