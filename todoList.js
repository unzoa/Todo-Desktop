class TodoList {
    constructor(onToggleTodo, onDeleteTodo, onMoveTodo, onReorderTodo) {
        this.onToggleTodo = onToggleTodo;
        this.onDeleteTodo = onDeleteTodo;
        this.onMoveTodo = onMoveTodo;
        this.onReorderTodo = onReorderTodo;
        this.todoList = document.getElementById('todoList');
    }

    render(todos) {
        this.todoList.innerHTML = '';
        todos.forEach((todo, index) => {
            const li = this.createTodoItem(todo, index);
            this.todoList.appendChild(li);
        });
    }

    createTodoItem(todo, index) {
        const li = document.createElement('li');
        li.draggable = true;
        li.dataset.index = index;

        if (index < 3) {
            li.classList.add(`priority-${index + 1}`);
        }

        li.innerHTML = `
            <div class="todo-item">
                <span class="drag-handle">⠿</span>
                <input type="checkbox" class="todo-checkbox"
                       ${todo.completed ? 'checked' : ''}>
                <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
            </div>
            <div class="todo-actions">
                <span class="move-todo prev-day" title="移到昨天" data-index="${index}">←</span>
                <span class="move-todo next-day" title="移到明天" data-index="${index}">→</span>
                <span class="delete-todo" title="删除" data-index="${index}">×</span>
            </div>
        `;

        this.setupEventListeners(li, index);
        return li;
    }

    setupEventListeners(li, index) {
        // 复选框事件
        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => {
            this.onToggleTodo(index);
        });

        // 移动按钮事件
        const [prevDayBtn, nextDayBtn] = li.querySelectorAll('.move-todo');
        prevDayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onMoveTodo(index, 'prev');
        });
        nextDayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onMoveTodo(index, 'next');
        });

        // 删除按钮事件
        li.querySelector('.delete-todo').addEventListener('click', (e) => {
            e.stopPropagation();
            const confirmDialog = document.getElementById('confirmDialog');
            const confirmMessage = document.getElementById('confirmMessage');
            const text = li.querySelector('.todo-text').textContent;

            confirmMessage.textContent = `确定要删除"${text}"吗？`;
            confirmDialog.style.display = 'flex';
            confirmDialog.offsetHeight;
            confirmDialog.classList.add('show');

            const handleConfirm = (confirmed) => {
                confirmDialog.classList.remove('show');
                setTimeout(() => {
                    confirmDialog.style.display = 'none';
                    if (confirmed) {
                        this.onDeleteTodo(index);
                    }
                }, 200);
            };

            document.getElementById('confirmOk').onclick = () => handleConfirm(true);
            document.getElementById('confirmCancel').onclick = () => handleConfirm(false);
        });

        // 拖拽事件
        this.setupDragEvents(li, index);
    }

    setupDragEvents(li, index) {
        li.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index);
            li.classList.add('dragging');
        });

        li.addEventListener('dragend', () => {
            li.classList.remove('dragging');
        });

        li.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingItem = this.todoList.querySelector('.dragging');
            if (draggingItem !== li) {
                const rect = li.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                if (e.clientY < midY) {
                    li.classList.add('drag-above');
                    li.classList.remove('drag-below');
                } else {
                    li.classList.add('drag-below');
                    li.classList.remove('drag-above');
                }
            }
        });

        li.addEventListener('dragleave', () => {
            li.classList.remove('drag-above', 'drag-below');
        });

        li.addEventListener('drop', (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = parseInt(li.dataset.index);
            if (fromIndex !== toIndex) {
                this.onReorderTodo(fromIndex, toIndex);
            }
            li.classList.remove('drag-above', 'drag-below');
        });
    }
}

module.exports = TodoList;