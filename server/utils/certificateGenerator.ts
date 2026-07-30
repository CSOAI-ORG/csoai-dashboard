/**
 * Certificate PDF Generator
 * 
 * Generates professional PDF certificates with CEASAI branding,
 * accreditations, QR codes for verification, and official seals
 */

import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export interface CertificateData {
  certificateId: string;
  studentName: string;
  courseName: string;
  framework: string;
  completionDate: Date;
  verificationUrl: string;
  examScore?: number;
  certificationLevel?: 'Foundation' | 'Professional' | 'Expert';
}

export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      });

      // Collect PDF data in buffer
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Generate QR code
      const qrCodeDataURL = await QRCode.toDataURL(data.verificationUrl, {
        width: 150,
        margin: 1,
        color: {
          dark: '#11885a', // CEASAI green
          light: '#ffffff',
        },
      });

      // Extract base64 data from data URL
      const qrCodeBase64 = qrCodeDataURL.split(',')[1];
      const qrCodeBuffer = Buffer.from(qrCodeBase64, 'base64');

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // ===== BACKGROUND AND BORDERS =====
      // Outer decorative border (gold/green)
      doc.rect(15, 15, pageWidth - 30, pageHeight - 30)
        .lineWidth(4)
        .stroke('#11885a');

      // Inner border
      doc.rect(25, 25, pageWidth - 50, pageHeight - 50)
        .lineWidth(2)
        .stroke('#c9a227');

      // Corner decorations (simple elegant corners)
      const cornerSize = 30;
      // Top left
      doc.moveTo(25, 55).lineTo(25, 25).lineTo(55, 25).lineWidth(3).stroke('#11885a');
      // Top right
      doc.moveTo(pageWidth - 55, 25).lineTo(pageWidth - 25, 25).lineTo(pageWidth - 25, 55).stroke('#11885a');
      // Bottom left
      doc.moveTo(25, pageHeight - 55).lineTo(25, pageHeight - 25).lineTo(55, pageHeight - 25).stroke('#11885a');
      // Bottom right
      doc.moveTo(pageWidth - 55, pageHeight - 25).lineTo(pageWidth - 25, pageHeight - 25).lineTo(pageWidth - 25, pageHeight - 55).stroke('#11885a');

      // ===== HEADER SECTION =====
      // CEASAI Logo/Title
      doc.fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#11885a')
        .text('CEASAI', 40, 45, {
          align: 'left',
          width: 150,
        });

      doc.fontSize(8)
        .font('Helvetica')
        .fillColor('#666666')
        .text('Certified Enterprise AI Safety Institute', 40, 63, {
          align: 'left',
          width: 200,
        });

      // CSOAI Logo on right
      doc.fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#11885a')
        .text('CSOAI', pageWidth - 190, 45, {
          align: 'right',
          width: 150,
        });

      doc.fontSize(8)
        .font('Helvetica')
        .fillColor('#666666')
        .text('Council for Safety Oversight of AI', pageWidth - 190, 63, {
          align: 'right',
          width: 150,
        });

      // Main Title
      doc.fontSize(36)
        .font('Helvetica-Bold')
        .fillColor('#11885a')
        .text('CERTIFICATE', 40, 95, {
          align: 'center',
          width: pageWidth - 80,
        });

      doc.fontSize(18)
        .font('Helvetica')
        .fillColor('#333333')
        .text('OF PROFESSIONAL ACHIEVEMENT', 40, 135, {
          align: 'center',
          width: pageWidth - 80,
        });

      // Certification Level Badge (if provided)
      if (data.certificationLevel) {
        const levelColors: Record<string, string> = {
          'Foundation': '#3b82f6',
          'Professional': '#8b5cf6',
          'Expert': '#c9a227',
        };
        const badgeColor = levelColors[data.certificationLevel] || '#11885a';
        
        doc.roundedRect(pageWidth / 2 - 60, 160, 120, 24, 12)
          .fill(badgeColor);
        
        doc.fontSize(11)
          .font('Helvetica-Bold')
          .fillColor('#ffffff')
          .text(data.certificationLevel.toUpperCase(), pageWidth / 2 - 60, 167, {
            align: 'center',
            width: 120,
          });
      }

      // ===== CERTIFICATION TEXT =====
      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#555555')
        .text('This is to certify that', 40, 195, {
          align: 'center',
          width: pageWidth - 80,
        });

      // Student Name (prominent)
      doc.fontSize(32)
        .font('Helvetica-Bold')
        .fillColor('#1a1a1a')
        .text(data.studentName, 40, 215, {
          align: 'center',
          width: pageWidth - 80,
        });

      // Completion text
      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#555555')
        .text('has successfully completed the requirements for', 40, 260, {
          align: 'center',
          width: pageWidth - 80,
        });

      // Course Name
      doc.fontSize(22)
        .font('Helvetica-Bold')
        .fillColor('#11885a')
        .text(data.courseName, 40, 280, {
          align: 'center',
          width: pageWidth - 80,
        });

      // Framework badge
      doc.roundedRect(pageWidth / 2 - 90, 310, 180, 26, 13)
        .fill('#f0f9f4');
      
      doc.roundedRect(pageWidth / 2 - 90, 310, 180, 26, 13)
        .lineWidth(1)
        .stroke('#11885a');

      doc.fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#11885a')
        .text(data.framework, pageWidth / 2 - 90, 317, {
          align: 'center',
          width: 180,
        });

      // Exam Score (if provided)
      if (data.examScore) {
        doc.fontSize(10)
          .font('Helvetica')
          .fillColor('#666666')
          .text(`Examination Score: ${data.examScore}%`, 40, 345, {
            align: 'center',
            width: pageWidth - 80,
          });
      }

      // ===== ACCREDITATION SECTION =====
      const accredY = 365;
      
      doc.fontSize(8)
        .font('Helvetica')
        .fillColor('#888888')
        .text('ACCREDITED BY', 40, accredY, {
          align: 'center',
          width: pageWidth - 80,
        });

      // Accreditation badges row
      const accreditations = [
        'EU AI Act Compliant',
        'NIST AI RMF Aligned',
        'ISO/IEC 42001 Ready',
        'TC260 Framework'
      ];
      
      const badgeWidth = 120;
      const totalBadgesWidth = accreditations.length * badgeWidth + (accreditations.length - 1) * 10;
      let badgeX = (pageWidth - totalBadgesWidth) / 2;
      
      accreditations.forEach((accred, index) => {
        doc.roundedRect(badgeX, accredY + 12, badgeWidth, 18, 9)
          .fill('#f8f9fa');
        
        doc.fontSize(7)
          .font('Helvetica')
          .fillColor('#555555')
          .text(accred, badgeX, accredY + 17, {
            align: 'center',
            width: badgeWidth,
          });
        
        badgeX += badgeWidth + 10;
      });

      // ===== SIGNATURE AND DATE SECTION =====
      const sigY = 420;

      // Left: Issue Date
      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#666666')
        .text('Date of Issue', 80, sigY, {
          align: 'center',
          width: 150,
        });

      const formattedDate = data.completionDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      doc.fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#1a1a1a')
        .text(formattedDate, 80, sigY + 15, {
          align: 'center',
          width: 150,
        });

      // Signature line
      doc.moveTo(80, sigY + 35).lineTo(230, sigY + 35).lineWidth(1).stroke('#cccccc');

      // Center: QR Code
      doc.image(qrCodeBuffer, pageWidth / 2 - 45, sigY - 10, {
        width: 90,
        height: 90,
      });

      doc.fontSize(8)
        .font('Helvetica')
        .fillColor('#888888')
        .text('Scan to Verify', pageWidth / 2 - 45, sigY + 82, {
          align: 'center',
          width: 90,
        });

      // Right: Certificate Authority
      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#666666')
        .text('Authorized By', pageWidth - 230, sigY, {
          align: 'center',
          width: 150,
        });

      doc.fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#1a1a1a')
        .text('CEASAI Board', pageWidth - 230, sigY + 15, {
          align: 'center',
          width: 150,
        });

      // Signature line
      doc.moveTo(pageWidth - 230, sigY + 35).lineTo(pageWidth - 80, sigY + 35).lineWidth(1).stroke('#cccccc');

      doc.fontSize(8)
        .font('Helvetica')
        .fillColor('#888888')
        .text('Training & Certification Authority', pageWidth - 230, sigY + 40, {
          align: 'center',
          width: 150,
        });

      // ===== FOOTER SECTION =====
      // Certificate ID
      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#999999')
        .text(`Certificate ID: ${data.certificateId}`, 40, pageHeight - 55, {
          align: 'center',
          width: pageWidth - 80,
        });

      // Verification URL
      doc.fontSize(8)
        .font('Helvetica')
        .fillColor('#11885a')
        .text(`Verify at: ${data.verificationUrl}`, 40, pageHeight - 42, {
          align: 'center',
          width: pageWidth - 80,
        });

      // Legal text
      doc.fontSize(7)
        .font('Helvetica')
        .fillColor('#aaaaaa')
        .text(
          'This certificate is issued by CEASAI (Certified Enterprise AI Safety Institute) in partnership with CSOAI (Council for Safety Oversight of AI). ' +
          'The holder has demonstrated competency in AI safety frameworks and compliance methodologies. Valid for 1 year from date of issue.',
          50, pageHeight - 30, {
            align: 'center',
            width: pageWidth - 100,
          }
        );

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
