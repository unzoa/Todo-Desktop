class TodoInput {
    constructor(onAddTodo, onUpdateWorktime) {
        this.onAddTodo = onAddTodo;
        this.onUpdateWorktime = onUpdateWorktime;
        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        this.todoInput = document.getElementById('todoInput');
        this.worktimeInput = document.getElementById('worktimeInput');
        this.totalWorktimeDisplay = document.getElementById('totalWorktime');
    }

    initEventListeners() {
        document.getElementById('addTodo').addEventListener('click', () => {
            this.handleAddTodo();
        });

        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddTodo();
            }
        });

        this.worktimeInput.addEventListener('change', () => {
            this.handleWorktimeChange();
        });
    }

    handleAddTodo() {
        const todoText = this.todoInput.value.trim();
        if (!todoText) return;

        this.onAddTodo({
            text: todoText,
            completed: false
        });

        this.todoInput.value = '';
    }

    handleWorktimeChange() {
        const worktime = parseFloat(this.worktimeInput.value) || 0;
        if (worktime >= 0 && worktime <= 24) {
            this.onUpdateWorktime(worktime);
        }
    }

    updateWorktime(worktime) {
        this.worktimeInput.value = worktime || '';
        this.totalWorktimeDisplay.textContent = worktime;
    }
}

module.exports = TodoInput;