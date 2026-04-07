import { chromium } from 'playwright'

const browser = await chromium.launch({
  executablePath: '/home/gaominggang/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell',
})

const page = await browser.newPage()
await page.goto('http://localhost:5173')
await page.screenshot({ path: 'e2e/screenshots/empty-state.png', fullPage: true })

// 填一个待办
await page.fill('input[placeholder="What needs to be done?"]', 'Buy groceries')
await page.click('button:has-text("Add")')
await page.waitForTimeout(500)
await page.screenshot({ path: 'e2e/screenshots/one-todo.png', fullPage: true })

// 再填一个
await page.fill('input[placeholder="What needs to be done?"]', 'Walk the dog')
await page.keyboard.press('Enter')
await page.waitForTimeout(500)
await page.screenshot({ path: 'e2e/screenshots/two-todos.png', fullPage: true })

// 完成第一个
await page.getByRole('checkbox').last().click()
await page.waitForTimeout(500)
await page.screenshot({ path: 'e2e/screenshots/one-completed.png', fullPage: true })

// 筛选
await page.click('button:has-text("Completed")')
await page.waitForTimeout(500)
await page.screenshot({ path: 'e2e/screenshots/filter-completed.png', fullPage: true })

await browser.close()
console.log('Screenshots saved!')
