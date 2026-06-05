import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface ApprovalReminderEmail {
  documentId: string;
  documentType: 'TRANSFER' | 'INVENTORY';
  recipientName: string;
  requestedBy: string;
  to: string;
}

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  async sendApprovalReminder(payload: ApprovalReminderEmail) {
    const transporter = this.createTransporter();
    const from =
      this.configService.get<string>('SMTP_FROM') ??
      this.configService.get<string>('SMTP_USER');
    const documentName =
      payload.documentType === 'TRANSFER'
        ? 'phieu dieu chuyen'
        : 'phieu kiem ke';
    const subject = `[Quan Ly Tai San] Nhac ky duyet ${payload.documentId}`;
    const text = [
      `Xin chao ${payload.recipientName},`,
      '',
      `${payload.requestedBy} vua gui nhac nho ky duyet ${documentName} ${payload.documentId}.`,
      'Vui long dang nhap he thong Quan Ly Tai San de xu ly.',
    ].join('\n');

    return transporter.sendMail({
      from,
      to: payload.to,
      subject,
      text,
      html: `
        <p>Xin chao <strong>${payload.recipientName}</strong>,</p>
        <p>${payload.requestedBy} vua gui nhac nho ky duyet ${documentName}
        <strong>${payload.documentId}</strong>.</p>
        <p>Vui long dang nhap he thong Quan Ly Tai San de xu ly.</p>
      `,
    });
  }

  private createTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const port = Number(this.configService.get<string>('SMTP_PORT') ?? 587);
    const secure =
      this.configService.get<string>('SMTP_SECURE') === 'true' || port === 465;

    if (!host || !user || !pass) {
      throw new ServiceUnavailableException(
        'SMTP is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS.',
      );
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }
}
