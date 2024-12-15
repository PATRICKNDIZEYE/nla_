import PDFDocument from 'pdfkit';

interface LetterContent {
  title: string;
  date: string;
  recipient?: string;
  caseId: string;
  meetingDate: string;
  venue: string;
  additionalNotes?: string;
}

export const generatePDF = async (content: LetterContent): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      // Collect the PDF data chunks
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Add the NLA logo (you'll need to add the actual logo path)
      // doc.image('path/to/nla-logo.png', 50, 45, { width: 100 });

      // Add header
      doc
        .font('Helvetica-Bold')
        .fontSize(18)
        .text('NATIONAL LAND AUTHORITY', { align: 'center' })
        .moveDown(0.5);

      // Add title
      doc
        .fontSize(16)
        .text(content.title, { align: 'center' })
        .moveDown();

      // Add date
      doc
        .font('Helvetica')
        .fontSize(12)
        .text(`Date: ${content.date}`, { align: 'right' })
        .moveDown();

      // Add recipient if available
      if (content.recipient) {
        doc
          .text(`Dear ${content.recipient},`, { align: 'left' })
          .moveDown();
      }

      // Add case reference
      doc
        .text(`Re: Case ID ${content.caseId}`, { align: 'left' })
        .moveDown();

      // Add main content
      doc
        .text('This letter serves as an official invitation for the dispute resolution meeting.', {
          align: 'left',
        })
        .moveDown()
        .text('Meeting Details:', { align: 'left' })
        .moveDown(0.5)
        .text(`Date and Time: ${content.meetingDate}`)
        .text(`Venue: ${content.venue}`)
        .moveDown();

      // Add additional notes if available
      if (content.additionalNotes) {
        doc
          .text('Additional Notes:', { align: 'left' })
          .moveDown(0.5)
          .text(content.additionalNotes)
          .moveDown();
      }

      // Add standard closing text
      doc
        .moveDown()
        .text(
          'Please ensure to arrive on time and bring any relevant documentation. If you are unable to attend, please notify us at least 24 hours in advance.',
          { align: 'left' }
        )
        .moveDown()
        .text(
          'Failure to attend this meeting without prior notice may affect the resolution process of your case.',
          { align: 'left' }
        )
        .moveDown(2);

      // Add signature section
      doc
        .text('Sincerely,', { align: 'left' })
        .moveDown(2)
        .text('_____________________', { align: 'left' })
        .text('National Land Authority', { align: 'left' })
        .text('Dispute Resolution Department', { align: 'left' });

      // Add footer
      doc
        .fontSize(10)
        .text(
          'This is an official document of the National Land Authority. If you have any questions, please contact our office.',
          {
            align: 'center',
            bottom: 50,
          }
        );

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}; 