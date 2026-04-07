import { test, expect } from '@playwright/test'

test.describe('TodoList E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('完整用户流程：添加→完成→删除', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?')

    // 添加两个待办
    await input.fill('Buy groceries')
    await page.getByRole('button', { name: 'Add' }).click()
    await expect(page.getByText('Buy groceries')).toBeVisible()
    await expect(page.getByText('1 item left')).toBeVisible()

    await input.fill('Walk the dog')
    await page.keyboard.press('Enter')
    await expect(page.getByText('2 items left')).toBeVisible()

    // 完成第一个（last=最早加入=Buy groceries）
    await page.getByRole('checkbox').last().click()
    await expect(page.getByText('1 item left')).toBeVisible()

    // 删除剩余的 Walk the dog
    await page.getByTestId('delete-btn').first().click()
    await expect(page.getByText('0 items left')).toBeVisible()
  })

  test('筛选功能正常', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?')
    await input.fill('Task 1')
    await page.keyboard.press('Enter')
    await input.fill('Task 2')
    await page.keyboard.press('Enter')

    // 完成 Task 1（last() 因为新待办 unshift 到顶部，Task 1 在底部）
    await page.getByRole('checkbox').last().click()

    // Active 筛选
    await page.getByRole('button', { name: 'Active' }).click()
    await expect(page.getByText('Task 2')).toBeVisible()
    await expect(page.getByText('Task 1')).not.toBeVisible()

    // Completed 筛选
    await page.getByRole('button', { name: 'Completed', exact: true }).click()
    await expect(page.getByText('Task 1')).toBeVisible()
    await expect(page.getByText('Task 2')).not.toBeVisible()

    // All 筛选
    await page.getByRole('button', { name: 'All' }).click()
    await expect(page.getByText('Task 1')).toBeVisible()
    await expect(page.getByText('Task 2')).toBeVisible()
  })

  test('清除已完成功能', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?')
    await input.fill('Task 1')
    await page.keyboard.press('Enter')
    await input.fill('Task 2')
    await page.keyboard.press('Enter')

    // 完成 Task 1（last() 因为新待办 unshift 到顶部，Task 1 在底部）
    await page.getByRole('checkbox').last().click()

    // Clear completed 按钮出现
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible()

    // 清除
    await page.getByRole('button', { name: 'Clear completed' }).click()
    await expect(page.getByText('Task 1')).not.toBeAttached()
    await expect(page.getByText('Task 2')).toBeVisible()
  })

  test('空内容不可添加', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?')
    await input.fill('   ')
    await page.keyboard.press('Enter')
    await expect(page.locator('ul li')).toHaveCount(0)
  })

  test('空列表显示提示', async ({ page }) => {
    await expect(page.getByText('No todos yet. Add one above!')).toBeVisible()
  })
})
