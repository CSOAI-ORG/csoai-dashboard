import { test, expect } from '@playwright/test';

test.describe('OpenGridWorks Tools Drawer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/opengridworks');
    // Dismiss cookie banner and wait for the map SVG to render
    await page.evaluate(() => {
      localStorage.setItem('csoai_cookie_consent', 'true');
      localStorage.setItem('csoai_cookie_preferences', JSON.stringify({ necessary: true, analytics: false, marketing: false, functional: false }));
    });
    await page.reload();
    await page.waitForSelector('svg', { timeout: 10000 });
  });

  test('should load the OpenGridWorks page', async ({ page }) => {
    await expect(page.locator('[data-testid="open-tools-drawer"]')).toBeVisible();
    await expect(page.locator('text=OpenGridWorks')).toBeVisible();
  });

  test('should open tools drawer via wrench button', async ({ page }) => {
    await page.click('[data-testid="open-tools-drawer"]');
    await expect(page.locator('[data-testid="tools-drawer"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-workflows"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-integrations"]')).toBeVisible();
  });

  test('should switch to integrations tab', async ({ page }) => {
    await page.click('[data-testid="open-tools-drawer"]');
    await page.click('[data-testid="tab-integrations"]');
    await expect(page.locator('[data-testid="integration-group-mcp"]')).toBeVisible();
  });

  test('should search and filter workflows', async ({ page }) => {
    await page.click('[data-testid="open-tools-drawer"]');
    await page.fill('[data-testid="tools-search"]', 'High-Risk System Readiness');
    await expect(page.locator('[data-testid^="workflow-"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="workflow-eu-ai-act-high-risk-readiness"]')).toBeVisible();
  });

  test('should search and filter integrations', async ({ page }) => {
    await page.click('[data-testid="open-tools-drawer"]');
    await page.click('[data-testid="tab-integrations"]');
    await page.fill('[data-testid="tools-search"]', 'mcp');
    // Should show at least the MCP fleet integration
    await expect(page.locator('[data-testid="integration-mcp-fleet"]')).toBeVisible();
  });

  test('should expand a workflow and show steps', async ({ page }) => {
    await page.click('[data-testid="open-tools-drawer"]');
    await page.click('[data-testid="workflow-eu-ai-act-high-risk-readiness"]');
    await expect(page.locator('[data-testid="workflow-eu-ai-act-high-risk-readiness"] >> text=Classify the system')).toBeVisible();
    await expect(page.locator('[data-testid="workflow-eu-ai-act-high-risk-readiness"] >> text=(Annex III)')).toBeVisible();
  });

  test('should close drawer with Escape key', async ({ page }) => {
    await page.click('[data-testid="open-tools-drawer"]');
    await expect(page.locator('[data-testid="tools-drawer"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="tools-drawer"]')).not.toBeVisible();
  });

  test('should toggle drawer with T key', async ({ page }) => {
    await page.keyboard.press('t');
    await expect(page.locator('[data-testid="tools-drawer"]')).toBeVisible();
    await page.keyboard.press('t');
    await expect(page.locator('[data-testid="tools-drawer"]')).not.toBeVisible();
  });

  test('should copy integration endpoint to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.click('[data-testid="open-tools-drawer"]');
    await page.click('[data-testid="tab-integrations"]');
    await page.click('[data-testid="copy-endpoint-mcp-fleet"]');
    await expect(page.locator('[data-testid="copy-endpoint-mcp-fleet"]:has-text("Copied")')).toBeVisible();
    const clipboardText = await page.evaluate(async () => navigator.clipboard.readText());
    expect(clipboardText).toBe('https://app.csoai.org/mcp');
  });

  test('should close drawer when clicking backdrop', async ({ page }) => {
    await page.click('[data-testid="open-tools-drawer"]');
    await expect(page.locator('[data-testid="tools-drawer"]')).toBeVisible();
    await page.click('[data-testid="tools-backdrop"]');
    await expect(page.locator('[data-testid="tools-drawer"]')).not.toBeVisible();
  });

  test('should show start workflow button', async ({ page }) => {
    await page.click('[data-testid="open-tools-drawer"]');
    await page.click('[data-testid="workflow-eu-ai-act-high-risk-readiness"]');
    const startBtn = page.locator('[data-testid="workflow-start-eu-ai-act-high-risk-readiness"]');
    await expect(startBtn).toBeVisible();
    await expect(startBtn).toHaveAttribute('href', '/eu-ai-act-classifier');
  });
});
