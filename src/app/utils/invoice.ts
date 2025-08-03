/* eslint-disable @typescript-eslint/no-explicit-any */
import PDFDocument from "pdfkit";
import AppError from "../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";

export interface IInvoiceData {
  transactionId: string;
  bookingDate: Date;
  username: string;
  tourTitle: string;
  guestCount: number;
  totalAmount: number;
}
export const generatePdf = async (
  invoiceData: IInvoiceData
): Promise<Buffer<ArrayBufferLike>> => {
  try {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffer: Uint8Array[] = [];
      doc.on("data", (chunk) => {
        buffer.push(chunk);
      });
      doc.on("end", () => resolve(Buffer.concat(buffer)));
      doc.on("error", (error) => reject(error));
      // PDF content;
      doc.fontSize(20).text("Invoice", { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text(`Transaction ID: ${invoiceData.transactionId}`);
      doc
        .fontSize(14)
        .text(`Booking Date ${invoiceData.bookingDate.toISOString()}`);
      doc.fontSize(14).text(`Customer: ${invoiceData.username}`);

      doc.moveDown();

      doc.text(`Tour: ${invoiceData.tourTitle}`);
      doc.text(`Guests: ${invoiceData.guestCount}`);
      doc.text(`Total Amount: $${invoiceData.totalAmount.toFixed(2)}`);
      doc.moveDown();

      doc.text("Thank you for booking with us!", { align: "center" });
      doc.end();
    });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.log(error);
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      `PDF creation error ${error.message}`
    );
  }
};
