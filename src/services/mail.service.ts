import { nodemailerConfig } from "@providers/index";
import { env } from "@config/env";
import { EmailOptions } from "@providers/notifications/types/email";
import logger from "./logger.service";


 class MailService {
  public async sendMail(mailOptions: EmailOptions): Promise<void> {
    try {
      const mailBody = {
        from: env.MAIL_USER,
        to: mailOptions.to,
        subject: mailOptions.subject,
        text: mailOptions.text,
        html: mailOptions.html,
      };
      logger.info(`sending email to ${mailOptions.to}`);
      await nodemailerConfig.sendMail(mailBody);
    } catch (error) {
    logger.error(`unable to send email to ${mailOptions.to}:`, error);  
    }
  }
}

export default MailService;
