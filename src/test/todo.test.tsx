import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoList } from '../components/TodoList'
import type { Todo, FilterType } from '../types/todo'

// --- 单元测试：useTodo hook 逻辑 ---

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('TodoList 组件', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  // ========== Story 1: 添加待办 ==========
  describe('添加待办', () => {
    it('输入框可以输入文本', async () => {
      const user = userEvent.setup()
      render(<TodoList />)
      const input = screen.getByPlaceholderText('What needs to be done?')
      await user.type(input, 'Buy milk')
      expect(input).toHaveValue('Buy milk')
    })

    it('按 Enter 可以添加待办', async () => {
      const user = userEvent.setup()
      render(<TodoList />)
      const input = screen.getByPlaceholderText('What needs to be done?')
      await user.type(input, 'Buy milk{enter}')
      expect(screen.getByText('Buy milk')).toBeInTheDocument()
      expect(input).toHaveValue('')
    })

    it('点击按钮可以添加待办', async () => {
      const user = userEvent.setup()
      render(<TodoList />)
      const input = screen.getByPlaceholderText('What needs to be done?')
      await user.type(input, 'Buy milk')
      await user.click(screen.getByText('Add'))
      expect(screen.getByText('Buy milk')).toBeInTheDocument()
      expect(input).toHaveValue('')
    })

    it('空内容不可添加', async () => {
      const user = userEvent.setup()
      render(<TodoList />)
      const input = screen.getByPlaceholderText('What needs to be done?')
      await user.type(input, '   {enter}')
      expect(screen.queryByRole('listitem')).toBeNull()
    })

    it('新待办显示在列表顶部', async () => {
      const user = userEvent.setup()
      render(<TodoList />)
      const input = screen.getByPlaceholderText('What needs to be done?')

      await user.type(input, 'First{enter}')
      await user.type(input, 'Second{enter}')

      const items = screen.getAllByRole('listitem')
      expect(items[0].textContent?.includes('Second')).toBe(true)
    })
  })

  // ========== Story 2: 查看待办列表 ==========
  describe('查看待办列表', () => {
    it('显示所有待办项', async () => {
      const user = userEvent.setup()
      render(<TodoList />)
      const input = screen.getByPlaceholderText('What needs to be done?')

      await user.type(input, 'Task 1{enter}')
      await user.type(input, 'Task 2{enter}')

      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.getByText('Task 2')).toBeInTheDocument()
    })

    it('待办总数实时更新', async () => {
      const user = userEvent.setup()
      render(<TodoList />)
      const input = screen.getByPlaceholderText('What needs to be done?')

      expect(screen.getByText('0 items left')).toBeInTheDocument()

      await user.type(input, 'Task 1{enter}')
      expect(screen.getByText('1 item left')).toBeInTheDocument()

      await user.type(input, 'Task 2{enter}')
      expect(screen.getByText('2 items left')).toBeInTheDocument()
    })

    it('列表为空时显示空状态提示', () => {
      render(<TodoList />)
      expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument()
    })
  })

  // ========== Story 3: 切换完成状态 ==========
  describe('切换完成状态', () => {
    it('点击复选框可以切换完成状态', async () => {
      const user = userEvent.setup()
      render(<TodoList />)
      const input = screen.getByPlaceholderText('What needs to be done?')
      await user.type(input, 'Task 1{enter}')

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(checkbox).toBeChecked()
    })

    it('已完成项显示删除线样式', async () => {
      const user = userEvent.setup()
      render(<TodoList />)
      const input = screen.getByPlaceholderText('What needs to be done?')
      await user.type(input, 'Task 1{enter}')

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      const label = screen.getByText('Task 1')
      expect(label).toHaveStyle({ textDecoration: 'line-through' })
    })

    it('点击文字可以切换状态', async () => {
      const user = userEvent.setup()
      render(<TodoList />)
      const input = screen.getByPlaceholderText('What needs to be done?')
      await user.type(input, 'Task 1{enter}')

      await user.click(screen.getByText('Task 1'))

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })
  })

  // ========== Story 4: 删除待办 ==========
  describe('删除待办', () => {
    it('点击删除按钮可以删除', async () => {
      const user = userEvent.setup()
      render(<TodoList />)
      const input = screen.getByPlaceholderText('What needs to be done?')
      await user.type(input, 'Task 1{enter}')

      expect(screen.getByText('Task 1')).toBeInTheDocument()
      await user.click(screen.getByText('×'))
      expect(screen.queryByText('Task 1')).toBeNull()
    })

    it('删除后列表自动更新', async () => {
      const user = userEvent.setup()
      render(<TodoList />)
      const input = screen.getByPlaceholderText('What needs to be done?')
      await user.type(input, 'Task 1{enter}')
      await user.type(input, 'Task 2{enter}')

      await user.click(screen.getAllByText('×')[0])

      expect(screen.getByText('1 item left')).toBeInTheDocument()
    })
  })

  // ========== Story 5: 筛选待办 ==========
  describe('筛选待办', () => {
    it('三个筛选按钮存在', async () => {
      const user = userEvent.setup()
      render(<TodoList />)
      const input = screen.getByPlaceholderText('What needs to be done?')
      await user.type(input, 'Task 1{enter}')
      await user.type(input, 'Task 2{enter}')
      await user.click(screen.getAllByRole('checkbox')[screen.getAllByRole('checkbox').length - 1])

      expect(screen.getByText('All')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
    })

    it('当前筛选按钮高亮', async () => {
      const user = userEvent.setup()
      render(<TodoList />)
      await user.click(screen.getByText('Active'))
      expect(screen.getByText('Active')).toHaveStyle({ fontWeight: 'bold' })
    })

    it('切换到 Completed 筛选只显示已完成', async () => {
      const user = userEvent.setup()
      render(<TodoList />)
      const input = screen.getByPlaceholderText('What needs to be done?')
      await user.type(input, 'Task 1{enter}')
      await user.type(input, 'Task 2{enter}')
      await user.click(screen.getAllByRole('checkbox')[screen.getAllByRole('checkbox').length - 1])

      await user.click(screen.getByText('Completed'))

      const items = screen.getAllByRole('listitem')
      expect(items).toHaveLength(1)
      expect(screen.getByText('Task 1', { selector: 'li span' })).toBeInTheDocument()
    })

    it('切换到 Active 筛选只显示进行中', async () => {
      const user = userEvent.setup()
      render(<TodoList />)
      const input = screen.getByPlaceholderText('What needs to be done?')
      await user.type(input, 'Task 1{enter}')
      await user.type(input, 'Task 2{enter}')
      await user.click(screen.getAllByRole('checkbox')[screen.getAllByRole('checkbox').length - 1])

      await user.click(screen.getByText('Active'))

      const items = screen.getAllByRole('listitem')
      expect(items).toHaveLength(1)
      expect(screen.getByText('Task 2', { selector: 'li span' })).toBeInTheDocument()
    })
  })

  // ========== Story 6: 清除已完成 ==========
  describe('清除已完成', () => {
    it('存在已完成后才显示清除按钮', async () => {
      const user = userEvent.setup()
      render(<TodoList />)
      const input = screen.getByPlaceholderText('What needs to be done?')
      await user.type(input, 'Task 1{enter}')

      expect(screen.queryByText('Clear completed')).toBeNull()

      await user.click(screen.getByRole('checkbox'))
      expect(screen.getByText('Clear completed')).toBeInTheDocument()
    })

    it('点击清除按钮删除所有已完成', async () => {
      const user = userEvent.setup()
      render(<TodoList />)
      const input = screen.getByPlaceholderText('What needs to be done?')
      await user.type(input, 'Task 1{enter}')
      await user.type(input, 'Task 2{enter}')
      await user.click(screen.getAllByRole('checkbox')[screen.getAllByRole('checkbox').length - 1])

      await user.click(screen.getByText('Clear completed'))

      const items = screen.getAllByRole('listitem')
      expect(items).toHaveLength(1)
      expect(screen.queryByText('Task 1', { selector: 'li span' })).toBeNull()
      expect(screen.getByText('Task 2')).toBeInTheDocument()
    })
  })
})
