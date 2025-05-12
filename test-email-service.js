const { emailService } = require("./lib/email/emailService");

async function testEmailService() {
  try {
    console.log("Testing emailService...");
    
    // Get all available templates
    const templates = emailService.getTemplateNames();
    console.log(`Available templates: ${templates.join(", ")}`);
    
    // Get email statistics
    const stats = emailService.getEmailStats();
    console.log("Email statistics:", JSON.stringify(stats, null, 2));
    
    console.log("Email service test completed successfully!");
  } catch (error) {
    console.error("Error testing email service:", error);
  }
}

testEmailService(); 