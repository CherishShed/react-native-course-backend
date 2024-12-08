import { env } from "bun";
import { MailtrapTransport } from "mailtrap";
import nodemailer from "nodemailer";
import { GenerateOtpEmail } from "./emailFormatter";

const transport = nodemailer.createTransport(
    MailtrapTransport({
        token: env.MAILTRAP_TOKEN!,
    })
);

const sender = {
    address: "hello@demomailtrap.com",
    name: "Udemy couse otp",
};
const recipients = ["c.shed2000@gmail.com"];

export async function SendEmail(name: string, otp: string) {
    const emailResponse = await transport.sendMail({
        from: sender,
        to: recipients,
        subject: "verification",
        text: "thanks alot",
        category: "Integration Test",
        html: GenerateOtpEmail(name, otp),
    });
    return emailResponse;
}
