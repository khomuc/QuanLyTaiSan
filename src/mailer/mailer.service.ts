import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

@Injectable()
export class MailerService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailerService.name);
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    this.from =
      this.configService.get<string>('MAIL_FROM') || 'noreply@quanlytaisan.local';
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const mailProvider = this.configService.get<string>(
      'MAIL_PROVIDER',
      'smtp'
    );

    if (mailProvider === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.configService.get<string>('GMAIL_USER'),
          pass: this.configService.get<string>('GMAIL_APP_PASSWORD'),
        },
      });
    } else if (mailProvider === 'sendgrid') {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: this.configService.get<string>('SENDGRID_API_KEY'),
        },
      });
    } else {
      // Default SMTP
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('MAIL_HOST', 'localhost'),
        port: this.configService.get<number>('MAIL_PORT', 587),
        secure: this.configService.get<boolean>('MAIL_SECURE', false),
        auth: {
          user: this.configService.get<string>('MAIL_USER'),
          pass: this.configService.get<string>('MAIL_PASSWORD'),
        },
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo || this.from,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${options.to}: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}:`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      return false;
    }
  }

  async sendApprovalReminder(
    recipientEmail: string,
    recipientName: string,
    documentType: 'TRANSFER' | 'INVENTORY',
    documentId: string,
    requesterName: string
  ): Promise<boolean> {
    const documentLabel =
      documentType === 'TRANSFER' ? 'Phiếu Điều Chuyển' : 'Phiếu Kiểm Kê';
    const html = this.generateApprovalReminderHtml({
      recipientName,
      documentLabel,
      documentId,
      requesterName,
    });

    return this.sendEmail({
      to: recipientEmail,
      subject: `${documentLabel} ${documentId} đang chờ ký duyệt`,
      html,
    });
  }

  async sendApprovalNotification(
    recipientEmail: string,
    recipientName: string,
    documentType: 'TRANSFER' | 'INVENTORY',
    documentId: string,
    approverName: string,
    status: 'approved' | 'rejected'
  ): Promise<boolean> {
    const documentLabel =
      documentType === 'TRANSFER' ? 'Phiếu Điều Chuyển' : 'Phiếu Kiểm Kê';
    const statusText = status === 'approved' ? 'đã được ký duyệt' : 'đã bị từ chối';
    const html = this.generateApprovalNotificationHtml({
      recipientName,
      documentLabel,
      documentId,
      approverName,
      statusText,
    });

    return this.sendEmail({
      to: recipientEmail,
      subject: `${documentLabel} ${documentId} ${statusText}`,
      html,
    });
  }

  private generateApprovalReminderHtml(params: {
    recipientName: string;
    documentLabel: string;
    documentId: string;
    requesterName: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { background-color: #f0f0f0; padding: 10px; border-radius: 0 0 5px 5px; font-size: 12px; }
            .button { background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Nhắc nhở: Phiếu chờ ký duyệt</h2>
            </div>
            <div class="content">
              <p>Xin chào ${params.recipientName},</p>
              <p>
                <strong>${params.documentLabel} số ${params.documentId}</strong>
                do <strong>${params.requesterName}</strong> lập đang chờ ký duyệt của bạn.
              </p>
              <p>Vui lòng truy cập hệ thống để xem và ký duyệt/từ chối phiếu này.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Truy cập hệ thống</a>
              <p style="margin-top: 20px; color: #666;">
                Nếu bạn không phải người được giao nhiệm vụ này, vui lòng bỏ qua email.
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Hệ thống Quản lý Tài sản QR. Đây là email tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateApprovalNotificationHtml(params: {
    recipientName: string;
    documentLabel: string;
    documentId: string;
    approverName: string;
    statusText: string;
  }): string {
    const statusColor =
      params.statusText.includes('ký duyệt') ? '#28a745' : '#dc3545';
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${statusColor}; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { background-color: #f0f0f0; padding: 10px; border-radius: 0 0 5px 5px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${params.statusText === 'đã được ký duyệt' ? '✓' : '✗'} Thông báo ký duyệt</h2>
            </div>
            <div class="content">
              <p>Xin chào ${params.recipientName},</p>
              <p>
                <strong>${params.documentLabel} số ${params.documentId}</strong>
                <strong style="color: ${statusColor};">${params.statusText}</strong>
                bởi <strong>${params.approverName}</strong>.
              </p>
              <p>Vui lòng đăng nhập hệ thống để xem chi tiết.</p>
              <p style="margin-top: 20px; color: #666;">
                Đây là email tự động, vui lòng không trả lời.
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Hệ thống Quản lý Tài sản QR</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
