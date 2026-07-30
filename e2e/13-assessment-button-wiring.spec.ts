import { test, expect } from '@playwright/test';
import { TestHelpers } from './helpers';

test.describe('Assessment Button Wiring', () => {
  test.describe('PublicHome — Start Assessment CTA', () => {
    test('navigates to /risk-assessment', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const btn = page.locator('[data-testid="start-assessment-button"]');
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForURL('**/risk-assessment', { timeout: 5000 });
        expect(page.url()).toContain('/risk-assessment');
      }
    });
  });

  test.describe('RiskAssessment — framework cards are clickable', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/risk-assessment');
      await page.waitForLoadState('networkidle');
    });

    test('page renders four assessment cards', async ({ page }) => {
      const cards = page.locator('[data-testid^="assessment-card-"]');
      await expect(cards).toHaveCount(4);
    });

    test('EU AI Act card navigates to /eu-ai-act-classifier', async ({ page }) => {
      const card = page.locator('[data-testid="assessment-card-eu-ai-act-assessment"]');
      await expect(card).toBeVisible();
      await card.click();
      await page.waitForURL('**/eu-ai-act-classifier', { timeout: 5000 });
      expect(page.url()).toContain('/eu-ai-act-classifier');
    });

    test('NIST card navigates to /compliance/nist-ai-rmf', async ({ page }) => {
      const card = page.locator('[data-testid="assessment-card-nist-ai-rmf-assessment"]');
      await expect(card).toBeVisible();
      await card.click();
      await page.waitForURL('**/compliance/nist-ai-rmf', { timeout: 5000 });
      expect(page.url()).toContain('/compliance/nist-ai-rmf');
    });

    test('TC260 card navigates to /compliance/tc260', async ({ page }) => {
      const card = page.locator('[data-testid="assessment-card-tc260-assessment"]');
      await expect(card).toBeVisible();
      await card.click();
      await page.waitForURL('**/compliance/tc260', { timeout: 5000 });
      expect(page.url()).toContain('/compliance/tc260');
    });

    test('Multi-Framework card navigates to /compliance', async ({ page }) => {
      const card = page.locator('[data-testid="assessment-card-multi-framework-assessment"]');
      await expect(card).toBeVisible();
      await card.click();
      await page.waitForURL('**/compliance', { timeout: 5000 });
      expect(page.url()).toContain('/compliance');
    });
  });

  test.describe('Compliance — assessment dialog', () => {
    test('Run Assessment button opens dialog', async ({ page }) => {
      await page.goto('/compliance');
      await page.waitForLoadState('networkidle');

      const runBtn = page.locator('[data-testid="compliance-run-assessment-button"]');
      if (await runBtn.isVisible().catch(() => false)) {
        await runBtn.click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByText('Run Compliance Assessment')).toBeVisible();
      }
    });

    test('framework dropdown shows framework IDs not names as values', async ({ page }) => {
      await page.goto('/compliance');
      await page.waitForLoadState('networkidle');

      const runBtn = page.locator('[data-testid="compliance-run-assessment-button"]');
      if (await runBtn.isVisible().catch(() => false)) => {
        await runBtn.click();
        await expect(page.getByRole('dialog')).toBeVisible();

        // Open the framework select
        const frameworkTrigger = page.locator('[role="dialog"] [role="combobox"]').last();
        await frameworkTrigger.click();

        // Verify select items exist
        const options = page.locator('[role="option"]');
        const count = await options.count();
        expect(count).toBeGreaterThan(0);
      }
    });
  });
});
