import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const emailLower = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email: emailLower },
    });
    if (existing) {
      throw new ConflictException('Email address already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: emailLower,
        password: hashedPassword,
      },
    });

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async login(dto: LoginDto) {
    const emailLower = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: emailLower },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const emailLower = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: hashedToken,
          passwordResetExpires: expiry,
        },
      });

      const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'MockForge <onboarding@resend.dev>',
            to: user.email,
            subject: 'Reset your MockForge password',
            html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your MockForge password</title>
    <style>
      body {
        background-color: #000000;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
      .wrapper {
        background-color: #000000;
        padding: 40px 20px;
      }
      .card {
        background-color: #050507;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        max-width: 480px;
        margin: 0 auto;
        padding: 32px;
        text-align: left;
      }
      .logo-container {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 24px;
        text-decoration: none;
      }
      .logo-icon {
        height: 24px;
        width: 24px;
        background-color: #ffffff;
        color: #000000;
        border-radius: 4px;
        display: inline-block;
        font-weight: 900;
        font-size: 14px;
        line-height: 24px;
        text-align: center;
      }
      .logo-text {
        color: #ffffff;
        font-weight: 600;
        font-size: 14px;
        letter-spacing: -0.02em;
      }
      .title {
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 16px 0;
        color: #ffffff;
      }
      .text {
        font-size: 14px;
        line-height: 1.6;
        color: #a3a3a3;
        margin: 0 0 24px 0;
      }
      .btn-container {
        margin-bottom: 24px;
      }
      .btn {
        background-color: #2563eb;
        color: #ffffff !important;
        display: inline-block;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        padding: 12px 28px;
        border-radius: 12px;
        text-align: center;
      }
      .warning {
        font-size: 12px;
        color: #737373;
        margin: 24px 0 0 0;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        padding-top: 16px;
      }
      .footer {
        font-size: 11px;
        color: #737373;
        margin-top: 32px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <div class="logo-container">
          <span class="logo-icon">M</span>
          <span class="logo-text">MockForge</span>
        </div>
        <h1 class="title">Reset your password</h1>
        <p class="text">We received a request to reset your password. Click the button below to choose a new password.</p>
        <div class="btn-container">
          <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
        </div>
        <p class="text" style="font-size: 12px; color: #a3a3a3; margin-top: 16px;">This link expires in 15 minutes.</p>
        <p class="warning">If you didn't request this, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        © 2026 MockForge
      </div>
    </div>
  </body>
</html>`,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error('Failed to send reset password email via Resend API:', errText);
        }
      } catch (err) {
        console.error('Network failure while sending email to Resend API:', err);
      }
    }

    return {
      message: 'If an account exists for this email, a password reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const hashedToken = crypto.createHash('sha256').update(dto.token).digest('hex');
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return {
      message: 'Password has been reset successfully',
    };
  }
}
