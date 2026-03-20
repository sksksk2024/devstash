import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { randomBytes } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Name, email, password, and confirmPassword are required" },
        { status: 400 },
      );
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with emailVerified = null (not verified)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: null,
      },
    });

    // Generate verification token
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

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    try {
      await resend.emails.send({
        from: "DevStash <onboarding@resend.dev>",
        to: email,
        subject: "Verify your email address",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; margin-bottom: 20px;">Welcome to DevStash!</h1>
            <p style="color: #666; margin-bottom: 20px;">Thank you for signing up. Please verify your email address by clicking the button below:</p>
            <div style="margin-bottom: 30px;">
              <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p style="color: #999; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #999; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">If you didn't create an account, you can safely ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Clean up: delete user and token if email fails
      await prisma.user.delete({ where: { id: user.id } });
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 },
      );
    }

    // Return success (without sensitive data)
    return NextResponse.json(
      {
        message:
          "User created successfully. Please check your email to verify your account.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
