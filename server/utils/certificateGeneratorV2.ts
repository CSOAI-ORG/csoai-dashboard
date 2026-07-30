/**
 * Certificate PDF Generator V2
 * 
 * Generates professional PDF certificates using pdf-lib with
 * CEASAI branding, accreditations, QR codes, and official seals
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export interface CertificateDataV2 {
  certificateId: string;
  studentName: string;
  courseName: string;
  framework: string;
  completionDate: Date;
  verificationUrl: string;
  examScore?: number;
  certificationLevel?: 'Foundation' | 'Professional' | 'Expert';
  timeSpentHours?: number; // Total time spent on course
  durationHours?: number; // Course duration
}

// Color definitions (CEASAI brand colors)
const COLORS = {
  primary: rgb(0.067, 0.533, 0.353),      // #11885a - CEASAI green
  gold: rgb(0.788, 0.635, 0.153),          // #c9a227 - Gold accent
  dark: rgb(0.102, 0.102, 0.102),          // #1a1a1a - Dark text
  gray: rgb(0.333, 0.333, 0.333),          // #555555 - Body text
  lightGray: rgb(0.533, 0.533, 0.533),     // #888888 - Subtle text
  veryLightGray: rgb(0.8, 0.8, 0.8),       // #cccccc - Lines
  background: rgb(0.969, 0.98, 0.969),     // #f8faf8 - Light green tint
};

export async function generateCertificatePDFV2(data: CertificateDataV2): Promise<Buffer> {
  try {
    // Create PDF document - A4 landscape
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]);
    const { width, height } = page.getSize();

    // Embed fonts
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // ===== DECORATIVE BORDERS =====
    // Outer border (green)
    page.drawRectangle({
      x: 15,
      y: 15,
      width: width - 30,
      height: height - 30,
      borderColor: COLORS.primary,
      borderWidth: 4,
    });

    // Inner border (gold)
    page.drawRectangle({
      x: 25,
      y: 25,
      width: width - 50,
      height: height - 50,
      borderColor: COLORS.gold,
      borderWidth: 2,
    });

    // Corner decorations
    const cornerLength = 40;
    const corners = [
      { x: 25, y: height - 25, dx: cornerLength, dy: -cornerLength },  // Top left
      { x: width - 25, y: height - 25, dx: -cornerLength, dy: -cornerLength },  // Top right
      { x: 25, y: 25, dx: cornerLength, dy: cornerLength },  // Bottom left
      { x: width - 25, y: 25, dx: -cornerLength, dy: cornerLength },  // Bottom right
    ];

    // ===== HEADER SECTION =====
    // CEASAI Logo (left)
    page.drawText('CEASAI', {
      x: 50,
      y: height - 55,
      size: 18,
      font: helveticaBoldFont,
      color: COLORS.primary,
    });

    page.drawText('Certified Enterprise AI Safety Institute', {
      x: 50,
      y: height - 72,
      size: 8,
      font: helveticaFont,
      color: COLORS.gray,
    });

    // CSOAI Logo (right)
    page.drawText('CSOAI', {
      x: width - 110,
      y: height - 55,
      size: 18,
      font: helveticaBoldFont,
      color: COLORS.primary,
    });

    page.drawText('Council for Safety Oversight of AI', {
      x: width - 180,
      y: height - 72,
      size: 8,
      font: helveticaFont,
      color: COLORS.gray,
    });

    // ===== MAIN TITLE =====
    const titleText = 'CERTIFICATE';
    const titleWidth = helveticaBoldFont.widthOfTextAtSize(titleText, 42);
    page.drawText(titleText, {
      x: (width - titleWidth) / 2,
      y: height - 115,
      size: 42,
      font: helveticaBoldFont,
      color: COLORS.primary,
    });

    const subtitleText = 'OF PROFESSIONAL ACHIEVEMENT';
    const subtitleWidth = helveticaFont.widthOfTextAtSize(subtitleText, 16);
    page.drawText(subtitleText, {
      x: (width - subtitleWidth) / 2,
      y: height - 140,
      size: 16,
      font: helveticaFont,
      color: COLORS.dark,
    });

    // Certification Level Badge (if provided)
    if (data.certificationLevel) {
      const levelColors: Record<string, { r: number; g: number; b: number }> = {
        'Foundation': { r: 0.231, g: 0.510, b: 0.965 },  // Blue
        'Professional': { r: 0.545, g: 0.361, b: 0.965 }, // Purple
        'Expert': { r: 0.788, g: 0.635, b: 0.153 },       // Gold
      };
      const badgeColor = levelColors[data.certificationLevel] || { r: 0.067, g: 0.533, b: 0.353 };
      
      const badgeWidth = 100;
      const badgeX = (width - badgeWidth) / 2;
      
      page.drawRectangle({
        x: badgeX,
        y: height - 170,
        width: badgeWidth,
        height: 22,
        color: rgb(badgeColor.r, badgeColor.g, badgeColor.b),

      });

      const levelText = data.certificationLevel.toUpperCase();
      const levelWidth = helveticaBoldFont.widthOfTextAtSize(levelText, 10);
      page.drawText(levelText, {
        x: (width - levelWidth) / 2,
        y: height - 164,
        size: 10,
        font: helveticaBoldFont,
        color: rgb(1, 1, 1),
      });
    }

    // ===== CERTIFICATION TEXT =====
    const certifyText = 'This is to certify that';
    const certifyWidth = helveticaFont.widthOfTextAtSize(certifyText, 14);
    page.drawText(certifyText, {
      x: (width - certifyWidth) / 2,
      y: height - 200,
      size: 14,
      font: helveticaFont,
      color: COLORS.gray,
    });

    // Student Name (prominent, elegant)
    const nameWidth = timesRomanBoldFont.widthOfTextAtSize(data.studentName, 36);
    page.drawText(data.studentName, {
      x: (width - nameWidth) / 2,
      y: height - 245,
      size: 36,
      font: timesRomanBoldFont,
      color: COLORS.dark,
    });

    // Decorative line under name
    page.drawLine({
      start: { x: (width - 300) / 2, y: height - 255 },
      end: { x: (width + 300) / 2, y: height - 255 },
      thickness: 1,
      color: COLORS.gold,
    });

    // Completion text
    const completionText = 'has successfully completed the requirements for';
    const completionWidth = helveticaFont.widthOfTextAtSize(completionText, 12);
    page.drawText(completionText, {
      x: (width - completionWidth) / 2,
      y: height - 280,
      size: 12,
      font: helveticaFont,
      color: COLORS.gray,
    });

    // Course Name
    const courseWidth = helveticaBoldFont.widthOfTextAtSize(data.courseName, 22);
    page.drawText(data.courseName, {
      x: (width - courseWidth) / 2,
      y: height - 310,
      size: 22,
      font: helveticaBoldFont,
      color: COLORS.primary,
    });

    // Framework badge
    const frameworkBadgeWidth = 180;
    const frameworkBadgeX = (width - frameworkBadgeWidth) / 2;
    
    page.drawRectangle({
      x: frameworkBadgeX,
      y: height - 350,
      width: frameworkBadgeWidth,
      height: 24,
      borderColor: COLORS.primary,
      borderWidth: 1,
      color: rgb(0.941, 0.976, 0.957), // Light green background
    });

    const frameworkWidth = helveticaBoldFont.widthOfTextAtSize(data.framework, 11);
    page.drawText(data.framework, {
      x: (width - frameworkWidth) / 2,
      y: height - 343,
      size: 11,
      font: helveticaBoldFont,
      color: COLORS.primary,
    });

    // Exam Score (if provided)
    let currentY = height - 375;
    if (data.examScore) {
      const scoreText = `Examination Score: ${data.examScore}%`;
      const scoreWidth = helveticaFont.widthOfTextAtSize(scoreText, 10);
      page.drawText(scoreText, {
        x: (width - scoreWidth) / 2,
        y: currentY,
        size: 10,
        font: helveticaFont,
        color: COLORS.lightGray,
      });
      currentY -= 20;
    }

    // Time Spent (if provided)
    if (data.timeSpentHours) {
      const timeText = `Time Invested: ${data.timeSpentHours} hours`;
      const timeWidth = helveticaFont.widthOfTextAtSize(timeText, 10);
      page.drawText(timeText, {
        x: (width - timeWidth) / 2,
        y: currentY,
        size: 10,
        font: helveticaFont,
        color: COLORS.lightGray,
      });
    }

    // ===== ACCREDITATION SECTION =====
    const accredY = height - 400;
    
    const accredTitle = 'ACCREDITED BY';
    const accredTitleWidth = helveticaFont.widthOfTextAtSize(accredTitle, 8);
    page.drawText(accredTitle, {
      x: (width - accredTitleWidth) / 2,
      y: accredY,
      size: 8,
      font: helveticaFont,
      color: COLORS.lightGray,
    });

    // Accreditation badges
    const accreditations = ['EU AI Act', 'NIST AI RMF', 'ISO 42001', 'TC260'];
    const accredBadgeWidth = 90;
    const accredSpacing = 15;
    const totalAccredWidth = accreditations.length * accredBadgeWidth + (accreditations.length - 1) * accredSpacing;
    let accredX = (width - totalAccredWidth) / 2;

    accreditations.forEach((accred) => {
      page.drawRectangle({
        x: accredX,
        y: accredY - 22,
        width: accredBadgeWidth,
        height: 16,
        color: rgb(0.969, 0.973, 0.976), // Very light gray

      });

      const accredTextWidth = helveticaFont.widthOfTextAtSize(accred, 7);
      page.drawText(accred, {
        x: accredX + (accredBadgeWidth - accredTextWidth) / 2,
        y: accredY - 17,
        size: 7,
        font: helveticaFont,
        color: COLORS.gray,
      });

      accredX += accredBadgeWidth + accredSpacing;
    });

    // ===== SIGNATURE SECTION =====
    const sigY = 100;

    // Left: Date of Issue
    page.drawText('Date of Issue', {
      x: 80,
      y: sigY + 50,
      size: 10,
      font: helveticaFont,
      color: COLORS.lightGray,
    });

    const formattedDate = data.completionDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    page.drawText(formattedDate, {
      x: 80,
      y: sigY + 35,
      size: 12,
      font: helveticaBoldFont,
      color: COLORS.dark,
    });

    page.drawLine({
      start: { x: 60, y: sigY + 25 },
      end: { x: 200, y: sigY + 25 },
      thickness: 1,
      color: COLORS.veryLightGray,
    });

    // Center: QR Code
    const qrCodeDataURL = await QRCode.toDataURL(data.verificationUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#11885a',
        light: '#ffffff',
      },
    });
    
    const qrCodeImageBytes = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
    const qrCodeImage = await pdfDoc.embedPng(qrCodeImageBytes);
    
    page.drawImage(qrCodeImage, {
      x: (width - 80) / 2,
      y: sigY + 10,
      width: 80,
      height: 80,
    });

    const scanText = 'Scan to Verify';
    const scanWidth = helveticaFont.widthOfTextAtSize(scanText, 8);
    page.drawText(scanText, {
      x: (width - scanWidth) / 2,
      y: sigY,
      size: 8,
      font: helveticaFont,
      color: COLORS.lightGray,
    });

    // Right: Authorized By
    page.drawText('Authorized By', {
      x: width - 180,
      y: sigY + 50,
      size: 10,
      font: helveticaFont,
      color: COLORS.lightGray,
    });

    page.drawText('CEASAI Board', {
      x: width - 180,
      y: sigY + 35,
      size: 12,
      font: helveticaBoldFont,
      color: COLORS.dark,
    });

    page.drawLine({
      start: { x: width - 200, y: sigY + 25 },
      end: { x: width - 60, y: sigY + 25 },
      thickness: 1,
      color: COLORS.veryLightGray,
    });

    page.drawText('Training & Certification Authority', {
      x: width - 200,
      y: sigY + 12,
      size: 8,
      font: helveticaFont,
      color: COLORS.lightGray,
    });

    // ===== FOOTER =====
    // Certificate ID
    const certIdText = `Certificate ID: ${data.certificateId}`;
    const certIdWidth = helveticaFont.widthOfTextAtSize(certIdText, 9);
    page.drawText(certIdText, {
      x: (width - certIdWidth) / 2,
      y: 55,
      size: 9,
      font: helveticaFont,
      color: COLORS.lightGray,
    });

    // Verification URL
    const verifyText = `Verify at: ${data.verificationUrl}`;
    const verifyWidth = helveticaFont.widthOfTextAtSize(verifyText, 8);
    page.drawText(verifyText, {
      x: (width - verifyWidth) / 2,
      y: 42,
      size: 8,
      font: helveticaFont,
      color: COLORS.primary,
    });

    // Legal text
    const legalText = 'This certificate is issued by CEASAI in partnership with CSOAI. The holder has demonstrated competency in AI safety frameworks. Valid for 1 year.';
    const legalWidth = helveticaFont.widthOfTextAtSize(legalText, 6);
    page.drawText(legalText, {
      x: (width - Math.min(legalWidth, width - 100)) / 2,
      y: 30,
      size: 6,
      font: helveticaFont,
      color: rgb(0.667, 0.667, 0.667),
      maxWidth: width - 100,
    });

    // ===== METADATA =====
    pdfDoc.setTitle(`CEASAI Certificate - ${data.studentName}`);
    pdfDoc.setSubject(`Certificate of Professional Achievement for ${data.courseName}`);
    pdfDoc.setAuthor('CEASAI - Certified Enterprise AI Safety Institute');
    pdfDoc.setCreator('CSOAI Platform');
    pdfDoc.setProducer('CEASAI Certificate Generator V2');
    pdfDoc.setKeywords(['AI Safety', 'Certification', 'CEASAI', 'CSOAI', data.framework]);
    pdfDoc.setCreationDate(new Date());

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Certificate generation error:', error);
    throw new Error(`Failed to generate certificate: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
