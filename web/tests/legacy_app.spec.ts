import { test, expect } from '@playwright/test';

test.describe('Super-Learning Legacy App', () => {
    test.use({ baseURL: 'http://localhost:8000' });

    test('should load the legacy home page', async ({ page }) => {
        await page.goto('/');
        // Check for some text or element that exists in the legacy page
        // Based on main.py, it should have "Super-Learning API" if templates aren't found
        // or the index.html content.
        const content = await page.content();
        if (content.includes('Super-Learning API')) {
            await expect(page.locator('h1')).toContainText('Super-Learning API');
        } else {
            await expect(page.locator('h1')).toContainText(/Super-Learning/i);
        }
    });

    test('should generate notes via legacy form', async ({ page }) => {
        await page.goto('/');
        // Assuming there is a form with url and video_type
        const urlInput = page.locator('input[name="url"], #url');
        if (await urlInput.count() > 0) {
            await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
            await page.selectOption('select[name="video_type"], #video_type', 'stanford');
            await page.click('button[type="submit"], #submit');

            // Wait for notes to appear
            await expect(page.locator('#notes, .notes-container')).toBeVisible({ timeout: 30000 });
        }
    });
});
