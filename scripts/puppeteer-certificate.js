import puppeteer from 'puppeteer';

/**
 * Generates a PDF certificate buffer for a student
 * 
 * @param {Object} cert - The certificate data
 * @param {string} cert.studentName - Name of the student
 * @param {string} cert.courseName - Name of the course
 * @param {string} cert.instructor - Instructor name
 * @param {string} cert.issuedAt - Formatted date string
 * @param {string} cert.certId - Certificate UUID
 * @param {string} cert.qrDataUrl - Pre-generated base64 image string for QR code
 * @returns {Promise<Buffer>} The PDF file buffer
 */
export async function generateCertificatePDF(cert) {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <title>Certificate</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@700;900&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Cairo', sans-serif;
          background: #0F0F0F;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .cert-container {
          width: 900px;
          height: 636px;
          position: relative;
          overflow: hidden;
          background: #0F0F0F;
        }

        .glow-top-right {
          position: absolute; top: -80px; right: -80px; width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(185,28,28,0.35) 0%, transparent 65%);
          pointer-events: none;
        }
        .glow-bottom-left {
          position: absolute; bottom: -60px; left: -60px; width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(185,28,28,0.15) 0%, transparent 65%);
          pointer-events: none;
        }
        
        .diamond-pattern {
          position: absolute; inset: 0; opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg width='50' height='50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0L50 25L25 50L0 25Z' fill='none' stroke='white' stroke-width='0.8'/%3E%3C/svg%3E");
          background-size: 50px 50px;
        }

        .border-outer { position: absolute; inset: 18px; border: 1px solid rgba(180,83,9,0.4); border-radius: 4px; }
        .border-inner { position: absolute; inset: 24px; border: 0.5px solid rgba(180,83,9,0.2); border-radius: 2px; }
        
        .flag-container { 
          position: absolute; left: 0; right: 0; height: 5px; display: flex; 
        }
        .flag-red { flex: 1; background: #CE1126; }
        .flag-white { flex: 1; background: #FFFFFF; }
        .flag-black { flex: 1; background: #000000; }

        .diamond {
            position: absolute; width: 24px; height: 24px;
            border: 1.5px solid rgba(180,83,9,0.45); transform: rotate(45deg);
        }

        .cert-inner {
            position: absolute; inset: 0; display: flex; flex-direction: column;
            align-items: center; justify-content: center; padding: 48px 80px;
            direction: rtl;
        }
      </style>
    </head>
    <body>
      <div class="cert-container">
          <div class="glow-top-right"></div>
          <div class="glow-bottom-left"></div>
          <div class="diamond-pattern"></div>
          
          <div class="border-outer"></div>
          <div class="border-inner"></div>
          
          <div class="flag-container" style="top: 0;">
             <div class="flag-red"></div><div class="flag-white"></div><div class="flag-black"></div>
          </div>
          <div class="flag-container" style="bottom: 0;">
             <div class="flag-red"></div><div class="flag-white"></div><div class="flag-black"></div>
          </div>
          
          <div class="diamond" style="top: 36px; right: 36px;"></div>
          <div class="diamond" style="top: 36px; left: 36px;"></div>
          <div class="diamond" style="bottom: 36px; right: 36px;"></div>
          <div class="diamond" style="bottom: 36px; left: 36px;"></div>

          <div class="cert-inner">
              <p style="font-size: 11px; font-weight: 600; letter-spacing: 2.5px; color: rgba(180,83,9,0.85); margin-bottom: 14px; margin-top: 0;">
                  اتحاد الطلاب اليمني — الأكاديمية
              </p>
              
              <h1 style="font-size: 36px; font-weight: 900; color: #FFFFFF; margin: 0 0 6px 0; line-height: 1.2; text-align: center;">
                  شهادة إتمام
              </h1>
              <div style="width: 80px; height: 2px; background: linear-gradient(to left, transparent, #B91C1C, transparent); margin-bottom: 20px;"></div>
              
              <p style="font-size: 13px; color: rgba(255,255,255,0.4); margin: 0 0 8px 0;">
                  تُمنح هذه الشهادة إلى
              </p>
              
              <h2 style="font-size: 32px; font-weight: 900; color: #FFFFFF; margin: 0 0 4px 0; text-align: center; text-shadow: 0 0 40px rgba(185,28,28,0.4);">
                  ${cert.studentName}
              </h2>
              <div style="width: 200px; height: 1px; background: rgba(255,255,255,0.12); margin-bottom: 18px;"></div>
              
              <p style="font-size: 13px; color: rgba(255,255,255,0.45); margin: 0 0 8px 0;">
                  لإتمامه بنجاح كورس
              </p>
              
              <p style="font-size: 19px; font-weight: 800; color: #FCA5A5; text-align: center; margin: 0 0 24px 0; max-width: 580px; line-height: 1.4;">
                  ${cert.courseName}
              </p>
              
              <div style="display: flex; align-items: flex-end; justify-content: space-between; width: 100%; gap: 16px;">
                  
                  <div style="text-align: right; min-width: 120px;">
                      <div style="width: 90px; height: 1px; background: rgba(255,255,255,0.18); margin-bottom: 6px;"></div>
                      <p style="font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.7); margin: 0;">${cert.instructor}</p>
                      <p style="font-size: 10px; color: rgba(255,255,255,0.3); margin: 2px 0 0 0;">المدرب</p>
                  </div>
                  
                  <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                      ${cert.qrDataUrl ? `<img src="${cert.qrDataUrl}" alt="QR" style="width: 64px; height: 64px;" />` : ''}
                  </div>
                  
                  <div style="text-align: left; min-width: 120px;">
                      <div style="width: 90px; height: 1px; background: rgba(255,255,255,0.18); margin-bottom: 6px; margin-right: auto;"></div>
                      <p style="font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.7); margin: 0;">${cert.issuedAt}</p>
                      <p style="font-size: 9px; color: rgba(255,255,255,0.2); margin: 2px 0 0 0; direction: ltr;">
                          #${cert.certId.slice(0, 8).toUpperCase()}
                      </p>
                  </div>
              </div>
          </div>
      </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();

  await page.setContent(htmlContent, {
    waitUntil: 'networkidle0'
  });

  await page.setViewport({ width: 900, height: 636, deviceScaleFactor: 2 });

  const pdfBuffer = await page.pdf({
    width: '900px',
    height: '636px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
  return pdfBuffer;
}
