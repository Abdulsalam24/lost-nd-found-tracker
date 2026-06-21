import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { BrevoClient } from '@getbrevo/brevo';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { ItemReport } from '../items/entities/item-report.entity';
import { Sighting } from '../sightings/entities/sighting.entity';
import { Claim } from '../claims/entities/claim.entity';
import { NotifChannel } from '@lostfound/shared';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly brevoClient: BrevoClient | null;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(
    @InjectRepository(Notification)
    private notificationsRepo: Repository<Notification>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    this.brevoClient = apiKey ? new BrevoClient({ apiKey }) : null;
    this.fromEmail = this.configService.get<string>('BREVO_FROM_EMAIL', 'noreply@lostfound.unilorin.edu.ng');
    this.fromName = this.configService.get<string>('BREVO_FROM_NAME', 'UniLorin Lost & Found');
  }

  async sendVerificationEmail(user: User): Promise<void> {
    const token = this.jwtService.sign(
      { sub: user.id, type: 'email_verification' },
      { expiresIn: '24h' },
    );

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const verifyUrl = `${appUrl}/verify-email?token=${token}`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0f0a;font-family:'Manrope','Sora',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f0a;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #1f2e1f;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#0a1410 0%,#141414 100%);padding:32px 40px 24px;text-align:center;border-bottom:1px solid #1f2e1f;">
            <div style="display:inline-block;background:#3f837815;border:1px solid #3f837830;border-radius:12px;padding:8px 16px;margin-bottom:16px;">
              <span style="color:#3f8378;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Welcome</span>
            </div>
            <h1 style="margin:0;color:#f0fdf4;font-size:22px;font-weight:700;font-family:'Sora','Manrope',Helvetica,Arial,sans-serif;">Verify your email</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 8px;color:#9ca3af;font-size:14px;line-height:1.6;">Hi <strong style="color:#f0fdf4;">${user.name}</strong>,</p>
            <p style="margin:0 0 28px;color:#9ca3af;font-size:14px;line-height:1.6;">Thanks for signing up. Click the button below to verify your email address.</p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td style="background:#3f8378;border-radius:10px;text-align:center;">
                  <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;color:#f0fdf4;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">Verify Email</a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 24px;color:#6b7280;font-size:12px;text-align:center;line-height:1.5;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
            <div style="height:1px;background:#1f2e1f;margin:0 0 24px;"></div>
            <p style="margin:0;color:#4b5563;font-size:11px;text-align:center;line-height:1.5;">
              This is an automated message from<br>
              <strong style="color:#6b7280;">UniLorin Lost & Found</strong>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await this.createAndSend(user, 'EMAIL_VERIFICATION', {
      subject: 'Verify your UniLorin Lost & Found account',
      body: `Hi ${user.name}, please verify your email by clicking: ${verifyUrl}`,
      html,
      verifyUrl,
    });
  }

  async sendOtpEmail(user: User, otp: string): Promise<void> {
    const digits = otp.split('');
    const otpBoxes = digits.map((d) =>
      `<td style="width:44px;height:52px;text-align:center;font-size:28px;font-weight:700;font-family:'Manrope','Sora',Helvetica,Arial,sans-serif;color:#3f8378;background:#0a1410;border:2px solid #1f2e1f;border-radius:10px;letter-spacing:2px;">${d}</td>`
    ).join('<td style="width:8px;"></td>');

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0f0a;font-family:'Manrope','Sora',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f0a;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #1f2e1f;border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0a1410 0%,#141414 100%);padding:32px 40px 24px;text-align:center;border-bottom:1px solid #1f2e1f;">
            <div style="display:inline-block;background:#3f837815;border:1px solid #3f837830;border-radius:12px;padding:8px 16px;margin-bottom:16px;">
              <span style="color:#3f8378;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Verification Code</span>
            </div>
            <h1 style="margin:0;color:#f0fdf4;font-size:22px;font-weight:700;font-family:'Sora','Manrope',Helvetica,Arial,sans-serif;">Confirm your identity</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 8px;color:#9ca3af;font-size:14px;line-height:1.6;">Hi <strong style="color:#f0fdf4;">${user.name}</strong>,</p>
            <p style="margin:0 0 28px;color:#9ca3af;font-size:14px;line-height:1.6;">Use the code below to verify your account. It expires in <strong style="color:#f0fdf4;">10 minutes</strong>.</p>
            <!-- OTP Code -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>${otpBoxes}</tr>
            </table>
            <p style="margin:0 0 24px;color:#6b7280;font-size:12px;text-align:center;line-height:1.5;">If you didn't request this code, you can safely ignore this email.</p>
            <!-- Divider -->
            <div style="height:1px;background:#1f2e1f;margin:0 0 24px;"></div>
            <p style="margin:0;color:#4b5563;font-size:11px;text-align:center;line-height:1.5;">
              This is an automated message from<br>
              <strong style="color:#6b7280;">UniLorin Lost & Found</strong>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await this.createAndSend(user, 'OTP_VERIFICATION', {
      subject: 'Your verification code - UniLorin Lost & Found',
      body: `Hi ${user.name}, your verification code is: ${otp}. It expires in 10 minutes.`,
      html,
    });
  }

  async notifyPotentialMatches(
    newItem: ItemReport,
    matches: ItemReport[],
  ): Promise<void> {
    const reporterIds = new Set<string>();
    matches.forEach((match) => reporterIds.add(match.reporter_id));
    reporterIds.add(newItem.reporter_id);

    const userIds = Array.from(reporterIds);
    const users = await this.usersRepo.find({ where: { id: In(userIds) } });

    const sendPromises = users.map((user) =>
      this.createAndSend(user, 'POTENTIAL_MATCH', {
        subject: 'Potential match found for your item!',
        body: `A potential match has been found. Check the Lost & Found app for details.`,
        item_id: newItem.id,
        item_title: newItem.title,
      }),
    );

    await Promise.all(sendPromises);
  }

  async notifySighting(item: ItemReport, sighting: Sighting): Promise<void> {
    const reporter = await this.usersRepo.findOne({ where: { id: item.reporter_id } });
    if (!reporter) return;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0f0a;font-family:'Manrope','Sora',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f0a;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #1f2e1f;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#0a1410 0%,#141414 100%);padding:32px 40px 24px;text-align:center;border-bottom:1px solid #1f2e1f;">
            <div style="display:inline-block;background:#3f837815;border:1px solid #3f837830;border-radius:12px;padding:8px 16px;margin-bottom:16px;">
              <span style="color:#3f8378;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">New Sighting</span>
            </div>
            <h1 style="margin:0;color:#f0fdf4;font-size:22px;font-weight:700;font-family:'Sora','Manrope',Helvetica,Arial,sans-serif;">Someone spotted your item</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 8px;color:#9ca3af;font-size:14px;line-height:1.6;">Hi <strong style="color:#f0fdf4;">${reporter.name}</strong>,</p>
            <p style="margin:0 0 20px;color:#9ca3af;font-size:14px;line-height:1.6;">Someone has reported a sighting of your item <strong style="color:#f0fdf4;">${item.title}</strong>.</p>
            <div style="background:#0a1410;border:1px solid #1f2e1f;border-radius:10px;padding:16px 20px;margin:0 0 28px;">
              <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;"><strong style="color:#3f8378;">Sighting details:</strong><br>${sighting.description}</p>
            </div>
            <p style="margin:0 0 24px;color:#6b7280;font-size:12px;text-align:center;line-height:1.5;">Log in to the Lost & Found app to view more details and respond.</p>
            <div style="height:1px;background:#1f2e1f;margin:0 0 24px;"></div>
            <p style="margin:0;color:#4b5563;font-size:11px;text-align:center;line-height:1.5;">
              This is an automated message from<br>
              <strong style="color:#6b7280;">UniLorin Lost & Found</strong>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await this.createAndSend(reporter, 'NEW_SIGHTING', {
      subject: `New sighting for "${item.title}"`,
      body: `Someone spotted your item: ${sighting.description}`,
      html,
      item_id: item.id,
      sighting_id: sighting.id,
    });
  }

  async notifyClaimReviewed(claim: Claim): Promise<void> {
    const claimant = await this.usersRepo.findOne({ where: { id: claim.claimant_id } });
    if (!claimant) return;

    const isApproved = claim.status.toUpperCase() === 'APPROVED';
    const statusLabel = claim.status.toLowerCase();
    const badgeText = isApproved ? 'Approved' : 'Rejected';
    const heading = isApproved
      ? 'Your claim has been approved'
      : 'Your claim has been rejected';
    const messageBody = isApproved
      ? 'Great news! Your claim has been <strong style="color:#3f8378;">approved</strong>. Please contact the admin office to arrange collection of your item.'
      : 'Unfortunately, your claim has been <strong style="color:#ef4444;">rejected</strong>. If you believe this was a mistake, please reach out to the admin office for further assistance.';

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0f0a;font-family:'Manrope','Sora',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f0a;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #1f2e1f;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#0a1410 0%,#141414 100%);padding:32px 40px 24px;text-align:center;border-bottom:1px solid #1f2e1f;">
            <div style="display:inline-block;background:${isApproved ? '#3f837815' : '#ef444415'};border:1px solid ${isApproved ? '#3f837830' : '#ef444430'};border-radius:12px;padding:8px 16px;margin-bottom:16px;">
              <span style="color:${isApproved ? '#3f8378' : '#ef4444'};font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Claim ${badgeText}</span>
            </div>
            <h1 style="margin:0;color:#f0fdf4;font-size:22px;font-weight:700;font-family:'Sora','Manrope',Helvetica,Arial,sans-serif;">${heading}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 8px;color:#9ca3af;font-size:14px;line-height:1.6;">Hi <strong style="color:#f0fdf4;">${claimant.name}</strong>,</p>
            <p style="margin:0 0 28px;color:#9ca3af;font-size:14px;line-height:1.6;">${messageBody}</p>
            <p style="margin:0 0 24px;color:#6b7280;font-size:12px;text-align:center;line-height:1.5;">Log in to the Lost & Found app to view your claim details.</p>
            <div style="height:1px;background:#1f2e1f;margin:0 0 24px;"></div>
            <p style="margin:0;color:#4b5563;font-size:11px;text-align:center;line-height:1.5;">
              This is an automated message from<br>
              <strong style="color:#6b7280;">UniLorin Lost & Found</strong>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await this.createAndSend(claimant, 'CLAIM_REVIEWED', {
      subject: `Your claim has been ${statusLabel}`,
      body: `Your claim has been ${statusLabel}.`,
      html,
      claim_id: claim.id,
      status: claim.status,
    });
  }

  async notifyNewMessage(
    recipient: User,
    senderName: string,
    itemTitle: string,
    conversationId: string,
  ): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0f0a;font-family:'Manrope','Sora',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f0a;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #1f2e1f;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#0a1410 0%,#141414 100%);padding:32px 40px 24px;text-align:center;border-bottom:1px solid #1f2e1f;">
            <div style="display:inline-block;background:#3f837815;border:1px solid #3f837830;border-radius:12px;padding:8px 16px;margin-bottom:16px;">
              <span style="color:#3f8378;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">New Message</span>
            </div>
            <h1 style="margin:0;color:#f0fdf4;font-size:22px;font-weight:700;font-family:'Sora','Manrope',Helvetica,Arial,sans-serif;">You have a new message</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 8px;color:#9ca3af;font-size:14px;line-height:1.6;">Hi <strong style="color:#f0fdf4;">${recipient.name}</strong>,</p>
            <p style="margin:0 0 20px;color:#9ca3af;font-size:14px;line-height:1.6;"><strong style="color:#f0fdf4;">${senderName}</strong> sent you a message about <strong style="color:#f0fdf4;">${itemTitle}</strong>.</p>
            <p style="margin:0 0 24px;color:#9ca3af;font-size:14px;line-height:1.6;">Open the app to reply.</p>
            <div style="height:1px;background:#1f2e1f;margin:0 0 24px;"></div>
            <p style="margin:0;color:#4b5563;font-size:11px;text-align:center;line-height:1.5;">
              This is an automated message from<br>
              <strong style="color:#6b7280;">UniLorin Lost & Found</strong>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await this.createAndSend(recipient, 'NEW_MESSAGE', {
      subject: `New message about ${itemTitle}`,
      body: `${senderName} sent you a message about ${itemTitle}. Open the app to reply.`,
      html,
      conversation_id: conversationId,
    });
  }

  private async createAndSend(
    user: User,
    type: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const notification = this.notificationsRepo.create({
      user_id: user.id,
      type,
      channel: NotifChannel.EMAIL,
      payload_json: payload,
      status: 'PENDING',
    });

    const saved = await this.notificationsRepo.save(notification);

    if (this.brevoClient) {
      try {
        const emailOpts: Record<string, unknown> = {
          sender: { email: this.fromEmail, name: this.fromName },
          to: [{ email: user.email, name: user.name }],
          subject: (payload.subject as string) ?? 'Lost & Found Notification',
        };
        if (payload.html) {
          emailOpts.htmlContent = payload.html as string;
        } else {
          emailOpts.textContent = (payload.body as string) ?? '';
        }
        await this.brevoClient.transactionalEmails.sendTransacEmail(emailOpts);

        await this.notificationsRepo.update(saved.id, {
          sent_at: new Date(),
          status: 'SENT',
        });
      } catch (err) {
        this.logger.error(`Failed to send email to ${user.email}`, err);
        await this.notificationsRepo.update(saved.id, { status: 'FAILED' });
      }
    } else {
      this.logger.log(`[DEV] Email to ${user.email}: ${payload.subject}`);
      await this.notificationsRepo.update(saved.id, {
        sent_at: new Date(),
        status: 'SENT',
      });
    }
  }
}
