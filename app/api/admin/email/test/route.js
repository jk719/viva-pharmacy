import { authOptions } from "@/lib/auth";
import { emailService } from "@/lib/email/emailService";

export async function POST(req) {
  try {
    const token = req.nextauth?.token;
    // Middleware ensures token exists and user is ADMIN or MANAGER.
    // This route specifically requires ADMIN.
    if (!token || token.role !== 'ADMIN') {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { template, email, data } = await req.json();

    // Validate template exists
    if (!emailService.hasTemplate(template)) {
      return Response.json({ error: "Invalid template" }, { status: 400 });
    }

    // Send test email
    await emailService.sendEmail(email, template, data);

    return Response.json({ message: "Test email sent successfully" });
  } catch (error) {
    console.error('Error sending test email:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 