require("dotenv").config();
const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
    if (transporter) return transporter;

    const user = process.env.GMAIL_USER?.trim();
    const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");

    if (!user || !pass) {
        return null;
    }

    transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: { user, pass }
    });

    return transporter;
};

const buildResetEmailHtml = (toEmail, code) => {
    const spacedCode = code.split("").join(" ");
    const safeEmail = String(toEmail).replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#2563eb;color:#ffffff;padding:20px 24px;font-size:20px;font-weight:bold;">
              &#128274; Xác thực đặt lại mật khẩu Speedstride
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px;color:#1f2937;font-size:15px;line-height:1.6;">
              <p style="margin:0 0 16px;">Xin chào <strong>${safeEmail}</strong>,</p>
              <p style="margin:0 0 20px;">Bạn vừa yêu cầu đặt lại mật khẩu tài khoản tại <strong>Speedstride Sports</strong>.</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="border:2px dashed #93c5fd;border-radius:8px;padding:24px 16px;background:#eff6ff;">
                    <p style="margin:0 0 12px;color:#374151;font-size:14px;">Mã OTP của bạn là:</p>
                    <p style="margin:0;font-size:36px;font-weight:bold;color:#2563eb;letter-spacing:8px;">${spacedCode}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 8px;color:#374151;">Mã này sẽ hết hạn sau <strong>10 phút</strong>.</p>
              <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">Vui lòng không chia sẻ mã OTP với bất kỳ ai để đảm bảo an toàn tài khoản.</p>
              <p style="margin:0;color:#6b7280;font-size:14px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;background:#f9fafb;color:#9ca3af;font-size:12px;text-align:center;">
              Speedstride Sports &mdash; Email tự động, vui lòng không trả lời.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const sendPasswordResetCode = async (toEmail, code) => {
    const transport = getTransporter();
    if (!transport) {
        throw new Error(
            "Chưa cấu hình Gmail. Thêm GMAIL_USER và GMAIL_APP_PASSWORD vào file BackEnd/.env rồi khởi động lại server."
        );
    }

    const fromName = process.env.MAIL_FROM_NAME || "Speedstride Sports";
    const fromEmail = process.env.GMAIL_USER.trim();

    await transport.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: toEmail,
        subject: "Mã xác thực đặt lại mật khẩu - Speedstride",
        text: [
            `Xin chào ${toEmail},`,
            "",
            `Mã OTP đặt lại mật khẩu của bạn là: ${code}`,
            "",
            "Mã có hiệu lực trong 10 phút.",
            "Vui lòng không chia sẻ mã OTP với bất kỳ ai.",
            "",
            "Speedstride Sports"
        ].join("\n"),
        html: buildResetEmailHtml(toEmail, code)
    });
};

module.exports = {
    sendPasswordResetCode
};
