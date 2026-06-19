import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
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
  private readonly resend: Resend | null;
  private readonly fromEmail: string;

  constructor(
    @InjectRepository(Notification)
    private notificationsRepo: Repository<Notification>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.fromEmail = this.configService.get<string>(
      'RESEND_FROM_EMAIL',
      'UniLorin Lost & Found <noreply@lostfound.unilorin.edu.ng>',
    );
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
<body style="margin:0;padding:0;background:#0a0f0a;font-family:'Sora',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f0a;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#111611;border:1px solid #1a2a1a;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#0d1f12 0%,#111611 100%);padding:32px 40px 24px;text-align:center;border-bottom:1px solid #1a2a1a;">
            <div style="display:inline-block;background:#34d39915;border:1px solid #34d39930;border-radius:12px;padding:8px 16px;margin-bottom:16px;">
              <span style="color:#34d399;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Welcome</span>
            </div>
            <h1 style="margin:0;color:#f0fdf4;font-size:22px;font-weight:700;">Verify your email</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 8px;color:#9ca3af;font-size:14px;line-height:1.6;">Hi <strong style="color:#f0fdf4;">${user.name}</strong>,</p>
            <p style="margin:0 0 28px;color:#9ca3af;font-size:14px;line-height:1.6;">Thanks for signing up. Click the button below to verify your email address.</p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td style="background:#34d399;border-radius:10px;text-align:center;">
                  <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;color:#0a0f0a;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">Verify Email</a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 24px;color:#6b7280;font-size:12px;text-align:center;line-height:1.5;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
            <div style="height:1px;background:#1a2a1a;margin:0 0 24px;"></div>
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
      `<td style="width:44px;height:52px;text-align:center;font-size:28px;font-weight:700;font-family:'Sora',Helvetica,Arial,sans-serif;color:#34d399;background:#0d1f12;border:2px solid #1a3a1a;border-radius:10px;letter-spacing:2px;">${d}</td>`
    ).join('<td style="width:8px;"></td>');

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0f0a;font-family:'Sora',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f0a;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#111611;border:1px solid #1a2a1a;border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0d1f12 0%,#111611 100%);padding:32px 40px 24px;text-align:center;border-bottom:1px solid #1a2a1a;">
            <div style="display:inline-block;background:#34d39915;border:1px solid #34d39930;border-radius:12px;padding:8px 16px;margin-bottom:16px;">
              <span style="color:#34d399;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Verification Code</span>
            </div>
            <h1 style="margin:0;color:#f0fdf4;font-size:22px;font-weight:700;">Confirm your identity</h1>
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
            <div style="height:1px;background:#1a2a1a;margin:0 0 24px;"></div>
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

    await this.createAndSend(reporter, 'NEW_SIGHTING', {
      subject: `New sighting for "${item.title}"`,
      body: `Someone spotted your item: ${sighting.description}`,
      item_id: item.id,
      sighting_id: sighting.id,
    });
  }

  async notifyClaimReviewed(claim: Claim): Promise<void> {
    const claimant = await this.usersRepo.findOne({ where: { id: claim.claimant_id } });
    if (!claimant) return;

    await this.createAndSend(claimant, 'CLAIM_REVIEWED', {
      subject: `Your claim has been ${claim.status.toLowerCase()}`,
      body: `Your claim for item has been ${claim.status.toLowerCase()}.`,
      claim_id: claim.id,
      status: claim.status,
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

    if (this.resend) {
      try {
        const emailOpts: any = {
          from: this.fromEmail,
          to: user.email,
          subject: (payload.subject as string) ?? 'Lost & Found Notification',
        };
        if (payload.html) {
          emailOpts.html = payload.html as string;
        } else {
          emailOpts.text = (payload.body as string) ?? '';
        }
        await this.resend.emails.send(emailOpts);

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
