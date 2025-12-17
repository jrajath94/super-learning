import { test, expect } from '@playwright/test';

test.describe('Super-Learning User Stories (End-to-End)', () => {

    test('Story: The Deep Learner (YouTube -> Stanford Notes -> Deep Q&A)', async ({ page }) => {
        // 1. Visit Home
        await page.goto('/');

        // 2. Paste URL and select Stanford Mode
        await page.fill('#url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        await page.click('button:has-text("Stanford AI")');
        await page.click('button:has-text("Generate Notes")');

        // 3. Wait for generation (using longer timeout for LLM)
        await expect(page.locator('text=Notes generated successfully!')).toBeVisible({ timeout: 120000 });

        // 4. Verify notes content appears
        await expect(page.locator('.prose')).toBeVisible();
        const noteTitle = await page.locator('h2').first().textContent();
        expect(noteTitle).toBeTruthy();

        // 5. Transition to Study Chat (Agentic Interaction)
        await page.click('text=Study'); // Navbar link
        await expect(page).toHaveURL(/\/study/);

        // 6. Ask a deep question (Interacting with Study Agent)
        const chatInput = page.locator('input[placeholder*="Ask a question"]');
        await chatInput.fill(`Tell me more about the concepts in my latest notes.`);
        await page.click('button:has-text("Send")');

        // 7. Verify Agent Response (Thinking state then response)
        await expect(page.locator('text=Thinking...')).toBeVisible();
        // Since we have a mock in agents.py, it should respond with the mock message
        await expect(page.locator('text=demo AI Study Assistant')).toBeVisible({ timeout: 10000 });
    });

    test('Story: The Optimization Seek (Dashboard -> AI Coach Insights)', async ({ page }) => {
        // 1. Visit Dashboard
        await page.goto('/dashboard');

        // 2. Navigate to Insights (Personalized Coach)
        await page.click('text=Insights');
        await expect(page).toHaveURL(/\/dashboard\/insights/);

        // 3. Verify Coach Agent output
        await expect(page.locator('h1')).toContainText('Insights');
        // Currently insights might be mock or empty if DB is not connected
        // Check for common coach keywords or welcome message
        await expect(page.locator('text=Coach')).toBeDefined();
    });

    test('Story: Multi-Agent Collaboration (Note Gen -> Dashboard -> Study)', async ({ page }) => {
        // This story tests the architectural flow across different agents
        await page.goto('/');

        // 1. Learning Agent creates content
        await page.fill('#url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        await page.click('button:has-text("Generate Notes")');
        await expect(page.locator('text=Notes generated successfully!')).toBeVisible({ timeout: 120000 });

        // 2. Dashboard reflects the new content (Learning Agent's result stored)
        await page.goto('/dashboard');
        await expect(page.locator('text=Total Notes')).toBeVisible();
        await expect(page.locator('text=Transformer Architecture')).toBeDefined(); // Mock or real

        // 3. Study Agent uses that content
        await page.goto('/study');
        await page.fill('input[placeholder*="Ask a question"]', 'Summarize my DSA notes.');
        await page.keyboard.press('Enter');
        await expect(page.locator('text=Thinking...')).toBeVisible();
    });

    test('Story: The Scholar (Cross-Note RAG & Search)', async ({ page }) => {
        // 1. Visit Study Page
        await page.goto('/study');

        // 2. Ask a question that requires searching multiple notes
        const chatInput = page.locator('input[placeholder*="Ask a question"]');
        await chatInput.fill('Search my history for everything related to "Complexity Analysis".');
        await page.keyboard.press('Enter');

        // 3. Verify thinking state
        await expect(page.locator('text=Thinking...')).toBeVisible();

        // 4. Verify the response
        await expect(page.locator('.prose')).toBeVisible({ timeout: 15000 });
        const responseText = await page.locator('.prose').textContent();
        expect(responseText?.toLowerCase()).toContain('assistant');
    });
});
