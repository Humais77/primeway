import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT || 465);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure:
    process.env.SMTP_SECURE === "true" ||
    smtpPort === 465,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function getFrom() {
  return (
    process.env.SMTP_FROM ||
    process.env.SMTP_USER
  );
}

export async function sendVerificationEmail({
  email,
  fullName,
  code,
}: {
  email: string;
  fullName: string;
  code: string;
}) {
  await transporter.sendMail({
    from: getFrom(),
    to: email,
    subject: "Verify your Prime Way email",

    text: `Hello ${fullName},

Your Prime Way email verification code is:

${code}

This code expires in 15 minutes.

If you did not create a Prime Way account, you can safely ignore this email.`,

    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px">
        <h2 style="color:#06141f;">Verify your Prime Way email</h2>

        <p>Hello ${escapeHtml(fullName)},</p>

        <p>
          Thank you for registering with Prime Way.
          Use the verification code below to verify your email address.
        </p>

        <div style="
          margin:30px 0;
          padding:20px;
          background:#f4f7f9;
          border-radius:12px;
          text-align:center;
          font-size:32px;
          font-weight:bold;
          letter-spacing:8px;
          color:#16c784;
        ">
          ${code}
        </div>

        <p>
          This code expires in <strong>15 minutes</strong>.
        </p>

        <p style="color:#777;font-size:13px;">
          If you did not create a Prime Way account,
          you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail({
  email,
  fullName,
  token,
}: {
  email: string;
  fullName: string;
  token: string;
}) {
  const resetUrl =
    `${getAppUrl()}/reset-password?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: getFrom(),
    to: email,
    subject: "Reset your Prime Way password",

    text: `Hello ${fullName},

We received a request to reset your Prime Way password.

Use the following link:

${resetUrl}

This link expires in 15 minutes.

If you did not request a password reset, you can safely ignore this email.`,

    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px">
        <h2 style="color:#06141f;">Reset your Prime Way password</h2>

        <p>Hello ${escapeHtml(fullName)},</p>

        <p>
          We received a request to reset your Prime Way password.
        </p>

        <div style="margin:30px 0;text-align:center;">
          <a
            href="${resetUrl}"
            style="
              display:inline-block;
              padding:14px 24px;
              background:#16c784;
              color:white;
              text-decoration:none;
              border-radius:8px;
              font-weight:bold;
            "
          >
            Reset Password
          </a>
        </div>

        <p>
          This link expires in <strong>15 minutes</strong>.
        </p>

        <p style="color:#777;font-size:13px;">
          If you did not request a password reset,
          you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function verifyEmailConnection() {
  await transporter.verify();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}