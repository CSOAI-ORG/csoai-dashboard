/**
 * Component-Level Visual Regression Tests
 * 
 * Tests individual UI components in isolation using the existing ComponentShowcase page.
 * This ensures visual consistency for core UI elements like buttons, cards, forms, etc.
 * 
 * Run with: npx playwright test 11-component-visual-regression.spec.ts
 * Update baselines: npx playwright test 11-component-visual-regression.spec.ts --update-snapshots
 */

import { test, expect } from '@playwright/test';

const SCREENSHOT_OPTIONS = {
  animations: 'disabled' as const,
};

const COMPARISON_THRESHOLD = 0.1;

test.describe('Component Visual Regression - Button Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('Button variants visual consistency', async ({ page }) => {
    // Find the buttons section
    const buttonsSection = page.locator('section').filter({ hasText: 'Buttons' }).first();
    
    if (await buttonsSection.isVisible()) {
      await expect(buttonsSection).toHaveScreenshot('buttons-section.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Individual button variant - Default', async ({ page }) => {
    const defaultButton = page.locator('button').filter({ hasText: /^Default$/ }).first();
    if (await defaultButton.isVisible()) {
      await expect(defaultButton).toHaveScreenshot('button-default.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Individual button variant - Secondary', async ({ page }) => {
    const secondaryButton = page.locator('button').filter({ hasText: /^Secondary$/ }).first();
    if (await secondaryButton.isVisible()) {
      await expect(secondaryButton).toHaveScreenshot('button-secondary.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Individual button variant - Destructive', async ({ page }) => {
    const destructiveButton = page.locator('button').filter({ hasText: /^Destructive$/ }).first();
    if (await destructiveButton.isVisible()) {
      await expect(destructiveButton).toHaveScreenshot('button-destructive.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Individual button variant - Outline', async ({ page }) => {
    const outlineButton = page.locator('button').filter({ hasText: /^Outline$/ }).first();
    if (await outlineButton.isVisible()) {
      await expect(outlineButton).toHaveScreenshot('button-outline.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Individual button variant - Ghost', async ({ page }) => {
    const ghostButton = page.locator('button').filter({ hasText: /^Ghost$/ }).first();
    if (await ghostButton.isVisible()) {
      await expect(ghostButton).toHaveScreenshot('button-ghost.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Button hover state', async ({ page }) => {
    const defaultButton = page.locator('button').filter({ hasText: /^Default$/ }).first();
    if (await defaultButton.isVisible()) {
      await defaultButton.hover();
      await page.waitForTimeout(200);
      await expect(defaultButton).toHaveScreenshot('button-default-hover.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Button focus state', async ({ page }) => {
    const defaultButton = page.locator('button').filter({ hasText: /^Default$/ }).first();
    if (await defaultButton.isVisible()) {
      await defaultButton.focus();
      await page.waitForTimeout(200);
      await expect(defaultButton).toHaveScreenshot('button-default-focus.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });
});

test.describe('Component Visual Regression - Card Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('Card components visual consistency', async ({ page }) => {
    // Look for cards in the showcase
    const cardsSection = page.locator('section').filter({ hasText: /Card/i }).first();
    
    if (await cardsSection.isVisible()) {
      await expect(cardsSection).toHaveScreenshot('cards-section.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Individual card component', async ({ page }) => {
    const card = page.locator('[class*="card"]').first();
    if (await card.isVisible()) {
      await expect(card).toHaveScreenshot('card-individual.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });
});

test.describe('Component Visual Regression - Form Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('Form inputs section visual consistency', async ({ page }) => {
    const formSection = page.locator('section').filter({ hasText: /Form Inputs|Input/i }).first();
    
    if (await formSection.isVisible()) {
      await expect(formSection).toHaveScreenshot('form-inputs-section.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Input field visual consistency', async ({ page }) => {
    const input = page.locator('input[type="text"], input[type="email"]').first();
    if (await input.isVisible()) {
      await expect(input).toHaveScreenshot('input-field.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Input field with focus', async ({ page }) => {
    const input = page.locator('input[type="text"], input[type="email"]').first();
    if (await input.isVisible()) {
      await input.focus();
      await page.waitForTimeout(200);
      await expect(input).toHaveScreenshot('input-field-focus.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Checkbox visual consistency', async ({ page }) => {
    const checkbox = page.locator('button[role="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await expect(checkbox).toHaveScreenshot('checkbox-unchecked.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Switch visual consistency', async ({ page }) => {
    const switchElement = page.locator('button[role="switch"]').first();
    if (await switchElement.isVisible()) {
      await expect(switchElement).toHaveScreenshot('switch-off.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Select component visual consistency', async ({ page }) => {
    const select = page.locator('button[role="combobox"]').first();
    if (await select.isVisible()) {
      await expect(select).toHaveScreenshot('select-closed.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Select component open state', async ({ page }) => {
    const select = page.locator('button[role="combobox"]').first();
    if (await select.isVisible()) {
      await select.click();
      await page.waitForTimeout(300);
      
      // Screenshot the dropdown content
      const dropdown = page.locator('[role="listbox"]');
      if (await dropdown.isVisible()) {
        await expect(dropdown).toHaveScreenshot('select-dropdown.png', {
          ...SCREENSHOT_OPTIONS,
          threshold: COMPARISON_THRESHOLD,
        });
      }
    }
  });

  test('Textarea visual consistency', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      await expect(textarea).toHaveScreenshot('textarea.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });
});

test.describe('Component Visual Regression - Badge Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('Badge variants visual consistency', async ({ page }) => {
    const badgeSection = page.locator('section').filter({ hasText: /Badge/i }).first();
    
    if (await badgeSection.isVisible()) {
      await expect(badgeSection).toHaveScreenshot('badges-section.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });
});

test.describe('Component Visual Regression - Alert Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('Alert variants visual consistency', async ({ page }) => {
    const alertSection = page.locator('section').filter({ hasText: /Alert/i }).first();
    
    if (await alertSection.isVisible()) {
      await expect(alertSection).toHaveScreenshot('alerts-section.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Individual alert component', async ({ page }) => {
    const alert = page.locator('[role="alert"]').first();
    if (await alert.isVisible()) {
      await expect(alert).toHaveScreenshot('alert-individual.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });
});

test.describe('Component Visual Regression - Dialog/Modal Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('Dialog trigger button', async ({ page }) => {
    // Find a dialog trigger button
    const dialogTrigger = page.locator('button').filter({ hasText: /Open Dialog|Dialog/i }).first();
    
    if (await dialogTrigger.isVisible()) {
      await expect(dialogTrigger).toHaveScreenshot('dialog-trigger.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Dialog open state', async ({ page }) => {
    // Find and click a dialog trigger
    const dialogTrigger = page.locator('button').filter({ hasText: /Open Dialog|Dialog/i }).first();
    
    if (await dialogTrigger.isVisible()) {
      await dialogTrigger.click();
      await page.waitForTimeout(300);
      
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        await expect(dialog).toHaveScreenshot('dialog-open.png', {
          ...SCREENSHOT_OPTIONS,
          threshold: COMPARISON_THRESHOLD,
        });
      }
    }
  });
});

test.describe('Component Visual Regression - Table Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('Table visual consistency', async ({ page }) => {
    const tableSection = page.locator('section').filter({ hasText: /Table/i }).first();
    
    if (await tableSection.isVisible()) {
      await expect(tableSection).toHaveScreenshot('table-section.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Individual table component', async ({ page }) => {
    const table = page.locator('table').first();
    if (await table.isVisible()) {
      await expect(table).toHaveScreenshot('table-individual.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });
});

test.describe('Component Visual Regression - Navigation Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('Tabs visual consistency', async ({ page }) => {
    const tabsSection = page.locator('section').filter({ hasText: /Tabs/i }).first();
    
    if (await tabsSection.isVisible()) {
      await expect(tabsSection).toHaveScreenshot('tabs-section.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Tab list component', async ({ page }) => {
    const tabList = page.locator('[role="tablist"]').first();
    if (await tabList.isVisible()) {
      await expect(tabList).toHaveScreenshot('tab-list.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Accordion visual consistency', async ({ page }) => {
    const accordionSection = page.locator('section').filter({ hasText: /Accordion/i }).first();
    
    if (await accordionSection.isVisible()) {
      await expect(accordionSection).toHaveScreenshot('accordion-section.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Breadcrumb visual consistency', async ({ page }) => {
    const breadcrumb = page.locator('nav[aria-label*="breadcrumb"], [class*="breadcrumb"]').first();
    if (await breadcrumb.isVisible()) {
      await expect(breadcrumb).toHaveScreenshot('breadcrumb.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Pagination visual consistency', async ({ page }) => {
    const pagination = page.locator('nav[aria-label*="pagination"], [class*="pagination"]').first();
    if (await pagination.isVisible()) {
      await expect(pagination).toHaveScreenshot('pagination.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });
});

test.describe('Component Visual Regression - Avatar Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('Avatar visual consistency', async ({ page }) => {
    const avatarSection = page.locator('section').filter({ hasText: /Avatar/i }).first();
    
    if (await avatarSection.isVisible()) {
      await expect(avatarSection).toHaveScreenshot('avatar-section.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Individual avatar component', async ({ page }) => {
    const avatar = page.locator('[class*="avatar"]').first();
    if (await avatar.isVisible()) {
      await expect(avatar).toHaveScreenshot('avatar-individual.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });
});

test.describe('Component Visual Regression - Progress Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('Progress bar visual consistency', async ({ page }) => {
    const progressSection = page.locator('section').filter({ hasText: /Progress/i }).first();
    
    if (await progressSection.isVisible()) {
      await expect(progressSection).toHaveScreenshot('progress-section.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Individual progress bar', async ({ page }) => {
    const progress = page.locator('[role="progressbar"]').first();
    if (await progress.isVisible()) {
      await expect(progress).toHaveScreenshot('progress-individual.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });
});

test.describe('Component Visual Regression - Tooltip Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/component-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('Tooltip trigger visual consistency', async ({ page }) => {
    const tooltipSection = page.locator('section').filter({ hasText: /Tooltip/i }).first();
    
    if (await tooltipSection.isVisible()) {
      await expect(tooltipSection).toHaveScreenshot('tooltip-section.png', {
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    }
  });

  test('Tooltip visible state', async ({ page }) => {
    // Find a tooltip trigger and hover
    const tooltipTrigger = page.locator('[data-state="closed"]').first();
    
    if (await tooltipTrigger.isVisible()) {
      await tooltipTrigger.hover();
      await page.waitForTimeout(500);
      
      const tooltip = page.locator('[role="tooltip"]');
      if (await tooltip.isVisible()) {
        await expect(tooltip).toHaveScreenshot('tooltip-visible.png', {
          ...SCREENSHOT_OPTIONS,
          threshold: COMPARISON_THRESHOLD,
        });
      }
    }
  });
});

test.describe('Component Visual Regression - Theme Variants', () => {
  test('Component showcase in light mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/component-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('component-showcase-light.png', {
      fullPage: true,
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });

  test('Component showcase in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/component-showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('component-showcase-dark.png', {
      fullPage: true,
      ...SCREENSHOT_OPTIONS,
      threshold: COMPARISON_THRESHOLD,
    });
  });
});

test.describe('Component Visual Regression - Responsive Variants', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 },
  ];

  for (const viewport of viewports) {
    test(`Component showcase at ${viewport.name} viewport`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/component-showcase');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot(`component-showcase-${viewport.name}.png`, {
        fullPage: true,
        ...SCREENSHOT_OPTIONS,
        threshold: COMPARISON_THRESHOLD,
      });
    });
  }
});
