import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();

try {
  await page.goto('http://localhost:3000/certification/exam', { waitUntil: 'networkidle0', timeout: 30000 });
  
  // Wait for the Start Exam button
  await page.waitForSelector('button:has-text("Start Exam")', { timeout: 10000 }).catch(() => {
    console.log('Button selector not found, trying alternative...');
  });
  
  // Get all buttons
  const buttons = await page.$$eval('button', btns => btns.map(b => b.textContent?.trim()));
  console.log('Buttons found:', buttons);
  
  // Click Start Exam button
  const startButton = await page.$('button:has-text("Start Exam")');
  if (startButton) {
    await startButton.click();
    console.log('Clicked Start Exam button');
    await page.waitForTimeout(3000);
  } else {
    // Try clicking by text content
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const startBtn = btns.find(b => b.textContent?.includes('Start Exam'));
      if (startBtn) {
        startBtn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked via evaluate:', clicked);
    await page.waitForTimeout(3000);
  }
  
  // Check if exam started
  const pageContent = await page.content();
  if (pageContent.includes('Question') || pageContent.includes('question')) {
    console.log('SUCCESS: Exam started, questions are showing');
  } else {
    console.log('Exam may not have started. Page content snippet:', pageContent.substring(0, 500));
  }
  
} catch (error) {
  console.error('Error:', error.message);
} finally {
  await browser.close();
}
