import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { randomBytes } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal that the user doesn't exist
      // Still return success to prevent user enumeration
      return NextResponse.json(
        {
          message:
            "If an account with that email exists, we've sent a password reset link.",
        },
        { status: 200 },
      );
    }

    // Check if user has a password (OAuth users can't reset password)
    if (!user.password) {
      return NextResponse.json(
        {
          message:
            "If an account with that email exists, we've sent a password reset link.",
        },
        { status: 200 },
      );
    }

    // Delete any existing tokens for this user to prevent reuse
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Generate reset token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: expiresAt,
      },
    });

    // Send password reset email
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    try {
      await resend.emails.send({
        from: "DevStash <onboarding@resend.dev>",
        to: email,
        subject: "Reset your password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; margin-bottom: 20px;">Password Reset</h1>
            <p style="color: #666; margin-bottom: 20px;">We received a request to reset your password. Click the button below to set a new password:</p>
            <div style="margin-bottom: 30px;">
              <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #999; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #999; font-size: 14px; word-break: break-all;">${resetUrl}</p>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Clean up: delete token if email fails
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: "Failed to send password reset email. Please try again." },
        { status: 500 },
      );
    }

    // Return success (without revealing if user exists or not)
    return NextResponse.json(
      {
        message:
          "If an account with that email exists, we've sent a password reset link.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
