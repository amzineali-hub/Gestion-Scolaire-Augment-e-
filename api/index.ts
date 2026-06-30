import express from "express";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

const app = express();

// Middleware for parsing JSON requests
app.use(express.json({limit: '50mb'}));

// API Routes
app.get("/api/health", async (req, res) => {
  let smtpOk = false;
  let smtpError = "";
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      });
      await transporter.verify();
      smtpOk = true;
    } catch (e: any) {
      smtpError = e.message;
    }
  }

  res.json({ 
    status: "ok", 
    message: "Server is running on Google Cloud Run or Vercel",
    smtpOk,
    smtpError,
    envKeys: Object.keys(process.env).filter(k => k.includes('SMTP') || k.includes('SMT') || k.includes('WHATSAPP'))
  });
});

app.post("/api/hello", (req, res) => {
  const { name } = req.body;
  res.json({ message: `Hello, ${name || 'World'} from the server!` });
});

// Email Route (using Nodemailer with Gmail SMTP)
app.post("/api/email/send", async (req, res) => {
  const { to, subject, text, html, attachment } = req.body;
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });

    const mailOptions: any = {
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
      html
    };

    if (attachment) {
      mailOptions.attachments = [
        {
          filename: attachment.filename || 'document.pdf',
          content: attachment.content.split("base64,")[1] || attachment.content,
          encoding: 'base64'
        }
      ];
    }

    const info = await transporter.sendMail(mailOptions);

    res.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// WhatsApp Route (using Meta WhatsApp Cloud API)
app.post("/api/whatsapp/send", async (req, res) => {
  try {
    const { to, message } = req.body;
    
    console.log(`[WhatsApp] Sending message to ${to}`);
    
    if (!to) {
      throw new Error("Phone number is required");
    }
    
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!accessToken || !phoneNumberId) {
       throw new Error("WhatsApp credentials missing in environment variables.");
    }
    
    const formattedTo = to.replace(/^\+/, ''); // WhatsApp API requires number without +
    
    console.log(`[WhatsApp] Calling Meta API for ${formattedTo}...`);
    
    const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formattedTo,
        type: "text",
        text: { body: message }
      })
    });

    const responseText = await response.text();
    console.log(`[WhatsApp] Meta API response status: ${response.status}`);
    console.log(`[WhatsApp] Meta API response body:`, responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Failed to parse Meta API response: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(data.error?.message || "Error sending WhatsApp message");
    }

    res.json({ success: true, messageId: data.messages?.[0]?.id });
  } catch (error: any) {
    console.error("[WhatsApp] Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// WhatsApp Webhook Verification Route (GET)
app.get("/api/whatsapp/webhook", (req, res) => {
  const verify_token = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "my_secure_verify_token_123";

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// WhatsApp Webhook Event Route (POST)
app.post("/api/whatsapp/webhook", (req, res) => {
  const body = req.body;

  // Check the Incoming webhook message
  console.log(JSON.stringify(req.body, null, 2));

  // Verify this is from WhatsApp
  if (body.object) {
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0] &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
      let msg_body = body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload

      console.log(`[WhatsApp Webhook] Received message from ${from}: ${msg_body}`);
    }
    
    // Returns a '200 OK' response to all requests
    res.sendStatus(200);
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
});

// PDF Generation Route
app.post("/api/pdf/generate", (req, res) => {
  const { title, content } = req.body;
  
  try {
    const doc = new PDFDocument();
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title || 'document'}.pdf"`);
    
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(24).text(title || 'Document Title', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(content || 'No content provided.');
    
    doc.end();
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send Bulletin via Email with PDF Attachment and WhatsApp Notification
app.post("/api/email/send-bulletin", async (req, res) => {
  const { to, phone, studentName, term, academicYear, grades, pdfAttachmentBase64 } = req.body;
  
  try {
    let pdfBuffer;
    if (pdfAttachmentBase64) {
      pdfBuffer = Buffer.from(pdfAttachmentBase64, 'base64');
    } else {
      // Fallback: Generate PDF in memory if base64 not provided
      const doc = new PDFDocument({ margin: 50 });
      const buffers: any[] = [];
      doc.on('data', buffers.push.bind(buffers));
      
      // Build PDF Content
      doc.fontSize(20).text('Bulletin Scolaire', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Élève : ${studentName}`);
      doc.text(`Période : ${term} | Année Académique : ${academicYear}`);
      doc.moveDown();
      
      doc.fontSize(12).text('Relevé de notes :', { underline: true });
      doc.moveDown();
      
      if (grades && grades.length > 0) {
        grades.forEach((g: any) => {
           doc.text(`${g.subject}: ${g.value}/20`);
        });
      } else {
        doc.text('Aucune note enregistrée.');
      }
      
      doc.moveDown(2);
      doc.fontSize(10).fillColor('grey').text('Ce bulletin est généré automatiquement.', { align: 'center' });
      doc.end();
      
      // Wait for PDF to finish
      pdfBuffer = await new Promise<Buffer>((resolve) => {
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });
      });
    }

    // 2. Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `Bulletin Scolaire - ${studentName}`,
      text: `Bonjour,\n\nVeuillez trouver ci-joint le bulletin de notes de ${studentName} pour le ${term} (${academicYear}).\n\nCordialement,\nL'Administration`,
      html: `<p>Bonjour,</p><p>Veuillez trouver ci-joint le bulletin de notes de <strong>${studentName}</strong> pour le ${term} (${academicYear}).</p><p>Cordialement,<br>L'Administration</p>`,
      attachments: [
        {
          filename: `Bulletin_${studentName.replace(/\s+/g, '_')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default app;
