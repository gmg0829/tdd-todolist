import { useState, useCallback, memo } from 'react'
import type { Todo, FilterType } from '../types/todo'

// 生成唯一 ID
const generateId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

// ========== 子组件：单个待办项 ==========
interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

const TodoItem = memo(function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const handleToggle = useCallback(() => onToggle(todo.id), [onToggle, todo.id])
  const handleDelete = useCallback(() => onDelete(todo.id), [onDelete, todo.id])

  return (
    <li data-testid="todo-item">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        aria-label={`Toggle ${todo.content}`}
      />
      <span
        style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
        data-testid="todo-content"
      >
        {todo.content}
      </span>
      <button onClick={handleDelete} aria-label={`Delete ${todo.content}`} data-testid="delete-btn">×</button>
    </li>
  )
})

// ========== 子组件：筛选按钮组 ==========
interface FilterBarProps {
  filter: FilterType
  onFilter: (filter: FilterType) => void
}

const FilterBar = memo(function FilterBar({ filter, onFilter }: FilterBarProps) {
  const filters: FilterType[] = ['all', 'active', 'completed']

  return (
    <div className="filter-bar">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onFilter(f)}
          style={{ fontWeight: filter === f ? 'bold' : 'normal' }}
          aria-pressed={filter === f}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
  )
})

// ========== 主组件 ==========
export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  // 添加待办（Immutable）
  const handleAdd = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) return

    const newTodo: Todo = {
      id: generateId(),
      content: trimmed,
      completed: false,
      createdAt: Date.now(),
    }

    setTodos((prev) => [newTodo, ...prev])
    setInput('')
  }, [input])

  // 按 Enter 添加
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleAdd()
    },
    [handleAdd]
  )

  // 切换完成状态
  const handleToggle = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }, [])

  // 删除待办
  const handleDelete = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }, [])

  // 清除已完成
  const handleClearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((todo) => !todo.completed))
  }, [])

  // 筛选逻辑
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const activeCount = todos.filter((t) => !t.completed).length
  const hasCompleted = todos.some((t) => t.completed)

  return (
    <div className="todolist">
      {/* 输入区域 */}
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
          aria-label="New todo input"
        />
        <button onClick={handleAdd}>Add</button>
      </div>

      {/* 筛选区域 */}
      <FilterBar filter={filter} onFilter={setFilter} />

      {/* 列表 */}
      {filteredTodos.length === 0 ? (
        <p>No todos yet. Add one above!</p>
      ) : (
        <ul>
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      {/* 底部统计 + 清除 */}
      <div className="footer">
        <span>{activeCount} item{activeCount !== 1 ? 's' : ''} left</span>
        {hasCompleted && (
          <button onClick={handleClearCompleted}>Clear completed</button>
        )}
      </div>
    </div>
  )
}
