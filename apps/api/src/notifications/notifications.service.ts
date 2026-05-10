import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { ItemReport } from '../items/entities/item-report.entity';
import { Sighting } from '../sightings/entities/sighting.entity';
import { Claim } from '../claims/entities/claim.entity';
import { NotifChannel } from '@lostfound/shared';
import sgMail from '@sendgrid/mail';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly sendgridEnabled: boolean;

  constructor(
    @InjectRepository(Notification)
    private notificationsRepo: Repository<Notification>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    this.sendgridEnabled = !!apiKey;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendVerificationEmail(user: User): Promise<void> {
    const token = this.jwtService.sign(
      { sub: user.id, type: 'email_verification' },
      { expiresIn: '24h' },
    );

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const verifyUrl = `${appUrl}/verify-email?token=${token}`;

    await this.createAndSend(user, 'EMAIL_VERIFICATION', {
      subject: 'Verify your UniLorin Lost & Found account',
      body: `Hi ${user.name}, please verify your email by clicking: ${verifyUrl}`,
      verifyUrl,
    });
  }

  async notifyPotentialMatches(
    newItem: ItemReport,
    matches: ItemReport[],
  ): Promise<void> {
    const reporterIds = new Set<string>();
    matches.forEach((match) => reporterIds.add(match.reporter_id));

    // Also notify the person who created the new item
    reporterIds.add(newItem.reporter_id);

    const userIds = Array.from(reporterIds);
    const users = await this.usersRepo.findByIds(userIds);

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

    if (this.sendgridEnabled) {
      try {
        const fromEmail = this.configService.get<string>(
          'SENDGRID_FROM_EMAIL',
          'noreply@lostfound.unilorin.edu.ng',
        );

        await sgMail.send({
          to: user.email,
          from: fromEmail,
          subject: (payload.subject as string) ?? 'Lost & Found Notification',
          text: (payload.body as string) ?? '',
        });

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
