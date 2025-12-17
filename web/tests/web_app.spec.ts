import { test, expect } from '@playwright/test';

test.describe('Super-Learning Web App', () => {
    test('should load the landing page', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Super-Learning/);
        await expect(page.locator('h1')).toContainText('Super-Learning');
    });

    test('should navigate to login page', async ({ page }) => {
        await page.goto('/');
        await page.click('text=Sign In');
        await expect(page).toHaveURL(/\/login/);
        await expect(page.locator('text=Welcome back!')).toBeVisible();
    });

    test('should navigate to signup page via Get Started', async ({ page }) => {
        await page.goto('/');
        await page.click('text=Get Started');
        await expect(page).toHaveURL(/\/signup/);
        await expect(page.locator('text=Create an account')).toBeVisible();
    });

    test('should show dashboard content', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page.locator('text=Welcome back')).toBeVisible();
        await expect(page.locator('text=Total Notes')).toBeVisible();
    });

    test('should show notes generator on home page and allow input', async ({ page }) => {
        await page.goto('/');
        const urlInput = page.locator('#url');
        await expect(urlInput).toBeVisible();
        await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        await expect(page.locator('button:has-text("Generate Notes")')).toBeVisible();
    });

    test('should generate notes successfully', async ({ page }) => {
        await page.goto('/');
        await page.fill('#url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        await page.click('button:has-text("Generate Notes")');

        // Wait for notes to appear (this might take a while, wait up to 120s)
        await expect(page.locator('text=Notes generated successfully!')).toBeVisible({ timeout: 120000 });
        await expect(page.locator('.prose')).toBeVisible();
    });

    test('should allow chatting with study assistant', async ({ page }) => {
        await page.goto('/study');
        await expect(page.locator('text=AI Study Assistant')).toBeVisible();

        const input = page.locator('input[placeholder*="Ask a question"]');
        await input.fill('What is a transformer?');
        await page.keyboard.press('Enter');

        // Check for user message
        await expect(page.locator('text=What is a transformer?')).toBeVisible();

        // Check for assistant response (might be "Thinking..." first)
        await expect(page.locator('text=Thinking...')).toBeVisible();
        // Eventually we should get a response or error (if backend lacks API keys)
        // For now, checking that the UI updates is sufficient for E2E flow
    });

    test('should show insights/coach panel', async ({ page }) => {
        await page.goto('/dashboard/insights');
        await expect(page.locator('h1')).toContainText('Insights');
        // Add more specific assertions if content is known
    });
});
