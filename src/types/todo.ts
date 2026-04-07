// TDD Step 2: 先定义 Type（测试驱动）
export interface Todo {
  id: string
  content: string
  completed: boolean
  createdAt: number
}

export type FilterType = 'all' | 'active' | 'completed'
