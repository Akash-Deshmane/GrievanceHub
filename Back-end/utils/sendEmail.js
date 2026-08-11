const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT, 10),
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Email send error: ${error.message}`);
    // Don't throw — email failure shouldn't block API response
  }
};

// ─── Email Templates ──────────────────────────────────────

const emailTemplates = {
  complaintSubmitted: (student, complaint) => ({
    subject: `✅ Complaint Submitted — #${complaint._id.toString().slice(-6).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background: #1e40af; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">GrievanceHub</h1>
          <p style="color: #93c5fd; margin: 4px 0 0;">Campus Complaint Management</p>
        </div>
        <div style="padding: 24px;">
          <p>Hi <strong>${student.name}</strong>,</p>
          <p>Your complaint has been successfully submitted. Our team will review it shortly.</p>
          <div style="background: #f1f5f9; border-radius: 6px; padding: 16px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Complaint ID:</strong> #${complaint._id.toString().slice(-6).toUpperCase()}</p>
            <p style="margin: 4px 0;"><strong>Title:</strong> ${complaint.title}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #f59e0b;">Pending</span></p>
          </div>
          <p>You can track your complaint status by logging into your account.</p>
          <p style="color: #64748b; font-size: 13px;">This is an automated message. Please do not reply.</p>
        </div>
      </div>
    `,
  }),

  statusUpdated: (student, complaint, oldStatus) => ({
    subject: `🔔 Complaint Status Updated — #${complaint._id.toString().slice(-6).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background: #1e40af; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">GrievanceHub</h1>
        </div>
        <div style="padding: 24px;">
          <p>Hi <strong>${student.name}</strong>,</p>
          <p>The status of your complaint has been updated.</p>
          <div style="background: #f1f5f9; border-radius: 6px; padding: 16px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Complaint ID:</strong> #${complaint._id.toString().slice(-6).toUpperCase()}</p>
            <p style="margin: 4px 0;"><strong>Title:</strong> ${complaint.title}</p>
            <p style="margin: 4px 0;"><strong>Previous Status:</strong> ${oldStatus}</p>
            <p style="margin: 4px 0;"><strong>New Status:</strong> <span style="color: #16a34a; font-weight: bold;">${complaint.status.replace('_', ' ').toUpperCase()}</span></p>
          </div>
          <p>Log in to your account to view the latest remarks and details.</p>
          <p style="color: #64748b; font-size: 13px;">This is an automated message. Please do not reply.</p>
        </div>
      </div>
    `,
  }),

  newComplaintForAdmin: (admin, complaint) => ({
    subject: `📥 New Complaint in Your Department — #${complaint._id.toString().slice(-6).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background: #1e40af; padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">GrievanceHub — Admin Alert</h1>
        </div>
        <div style="padding: 24px;">
          <p>Hi <strong>${admin.name}</strong>,</p>
          <p>A new complaint has been submitted to your department and requires your attention.</p>
          <div style="background: #fff7ed; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>ID:</strong> #${complaint._id.toString().slice(-6).toUpperCase()}</p>
            <p style="margin: 4px 0;"><strong>Title:</strong> ${complaint.title}</p>
            <p style="margin: 4px 0;"><strong>Priority:</strong> ${complaint.priority.toUpperCase()}</p>
          </div>
          <p>Please log in to manage this complaint.</p>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
