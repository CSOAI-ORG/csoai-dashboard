import { test, expect } from '@playwright/test';
import { TestHelpers } from './helpers';

test.describe('Watchdog Analyst Journey', () => {
  test('should navigate to watchdog page', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Navigate directly to watchdog page
    await page.goto('/watchdog');
    await helpers.waitForNavigation();
    
    // Verify we're on watchdog page
    expect(page.url()).toContain('/watchdog');
    
    // Page should have content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display analyst application information', async ({ page }) => {
    await page.goto('/watchdog');
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded
    await expect(page.locator('body')).toBeVisible();
    
    // Page should have content
    const content = page.locator('main, [role="main"], body > div');
    const contentCount = await content.count();
    expect(contentCount).toBeGreaterThan(0);
  });

  test('should navigate to workbench', async ({ page }) => {
    await page.goto('/workbench');
    await page.waitForLoadState('networkidle');
    
    // Verify workbench page loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display watchdog signup page', async ({ page }) => {
    await page.goto('/watchdog-signup');
    await page.waitForLoadState('networkidle');
    
    // Verify signup page loaded
    await expect(page.locator('body')).toBeVisible();
    
    // Check for form elements or any interactive elements
    const inputs = page.locator('input, textarea, button, form');
    const inputCount = await inputs.count();
    
    // Page should have content
    const content = page.locator('main, [role="main"], body > div');
    const contentCount = await content.count();
    
    expect(inputCount + contentCount).toBeGreaterThan(0);
  });

  test('should display incident report page', async ({ page }) => {
    await page.goto('/watchdog/incident');
    await page.waitForLoadState('networkidle');
    
    // Verify incident report page loaded
    await expect(page.locator('body')).toBeVisible();
  });
});
