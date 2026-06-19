import { chromium } from '@playwright/test';
import path from 'path';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  
  console.log("Navigating to http://localhost:8081/afiliados...");
  await page.goto('http://localhost:8081/afiliados');
  
  // Wait for the container to be visible and scroll it into view if needed
  await page.waitForSelector('text=Mis Tableros', { timeout: 10000 });
  
  // Force all data-fade elements to be visible
  await page.evaluate(() => {
    document.querySelectorAll('[data-fade]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });
  
  const mockup = await page.$('#animated-dashboard-mockup');
  await mockup.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000); // Wait for GSAP fade-in to complete
  
  console.log("Waiting for hover_sidebar phase (t=2.8s from mount)...");
  await page.waitForTimeout(2800);
  await mockup.screenshot({ path: '/Users/miileshorton/.gemini/antigravity/brain/7ed58074-ca58-4d84-abb2-37996066a010/hover_sidebar.png' });
  console.log("Saved hover_sidebar.png");
  
  console.log("Waiting for hover_copy phase (t=5.6s from mount)...");
  await page.waitForTimeout(2800);
  await mockup.screenshot({ path: '/Users/miileshorton/.gemini/antigravity/brain/7ed58074-ca58-4d84-abb2-37996066a010/hover_copy.png' });
  console.log("Saved hover_copy.png");
  
  await browser.close();
}

run().catch(console.error);
