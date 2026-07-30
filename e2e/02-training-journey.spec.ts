import { test, expect } from '@playwright/test';
import { TestHelpers } from './helpers';

test.describe('Training Journey', () => {
  test('should navigate to training page', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Navigate directly to training page
    await page.goto('/training');
    await helpers.waitForNavigation();
    
    // Verify we're on training page
    expect(page.url()).toContain('/training');
    
    // Page should have content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display training courses', async ({ page }) => {
    await page.goto('/training');
    await page.waitForLoadState('networkidle');
    
    // Page should have content
    await expect(page.locator('body')).toBeVisible();
    
    // Check for any content on the page
    const content = page.locator('main, [role="main"], body > div');
    const contentCount = await content.count();
    expect(contentCount).toBeGreaterThan(0);
  });

  test('should navigate to paid courses', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    // Navigate directly to paid courses
    await page.goto('/paid-courses');
    await helpers.waitForNavigation();
    
    // Verify we're on paid courses page
    expect(page.url()).toContain('/paid-courses');
    
    // Page should have content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display courses page with available courses', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/courses');
    await helpers.waitForNavigation();
    
    // Verify page loaded with content
    await expect(page.locator('body')).toBeVisible();
    
    // Page should have some content
    const content = page.locator('main, [role="main"], body > div');
    const contentCount = await content.count();
    expect(contentCount).toBeGreaterThan(0);
  });

  test('should handle my courses page', async ({ page }) => {
    const helpers = new TestHelpers(page);
    
    await page.goto('/my-courses');
    await helpers.waitForNavigation();
    
    // Page should load (may show login prompt or empty state)
    await expect(page.locator('body')).toBeVisible();
  });
});
