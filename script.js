const { ipcRenderer } = require('electron');
const TodoInput = require('./todoInput.js');
const TodoList = require('./todoList.js');

class Calendar {
    constructor() {
        this.date = new Date();
        this.selectedDate = new Date();
        this.todos = JSON.parse(localStorage.getItem('todos')) || {};
        this.worktimes = JSON.parse(localStorage.getItem('worktimes')) || {};

        this.initElements();
        this.initEventListeners();
        this.initTodoModules();
        this.render();

        document.getElementById('closeWindow').addEventListener('click', () => {
            ipcRenderer.send('close-window');
        });

        document.getElementById('exportMonth').addEventListener('click', () => {
            this.exportMonthData();
        });

        this.initSearchFeature();
    }

    initElements() {
        this.monthDisplay = document.getElementById('monthDisplay');
        this.calendarDays = document.getElementById('calendar-days');
    }

    initEventListeners() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.date.setMonth(this.date.getMonth() - 1);
            this.render();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.date.setMonth(this.date.getMonth() + 1);
            this.render();
        });
    }

    initTodoModules() {
        this.todoInput = new TodoInput(
            (todo) => this.addTodo(todo),
            (worktime) => this.updateWorktime(worktime)
        );

        this.todoList = new TodoList(
            (index) => this.toggleTodo(index),
            (index) => this.deleteTodo(index),
            (index, direction) => direction === 'prev' ? this.moveTodoPrevDay(index) : this.moveTodoToNextDay(index),
            (fromIndex, toIndex) => this.moveTodoPosition(fromIndex, toIndex)
        );
    }

    render() {
        this.renderCalendar();
        this.renderTodos();
        this.renderWorktime();
    }

    renderCalendar() {
        const year = this.date.getFullYear();
        const month = this.date.getMonth();

        this.monthDisplay.textContent = `${year}年${month + 1}月`;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        this.calendarDays.innerHTML = '';

        // 填充月初空白天数
        for (let i = 0; i < firstDay.getDay(); i++) {
            this.calendarDays.appendChild(this.createDayElement(''));
        }

        // 填充日期
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = this.createDayElement(day);
            const currentDate = new Date(year, month, day);
            const dateString = this.getDateString(currentDate);

            // 添加工时标记
            const worktime = this.worktimes[dateString];
            if (worktime && worktime > 0) {
                dayElement.setAttribute('title', `工时: ${worktime}h`);
            }

            // 检查当天是否有待办事项
            if (this.todos[dateString] && this.todos[dateString].length > 0) {
                dayElement.classList.add('has-todos');
                // 检查是否有未完成的待办事项
                const hasUncompletedTodos = this.todos[dateString].some(todo => !todo.completed);
                if (hasUncompletedTodos) {
                    dayElement.classList.add('has-uncompleted-todos');
                }
            }

            if (this.isToday(currentDate)) {
                dayElement.classList.add('today');
            }

            if (this.isSameDate(currentDate, this.selectedDate)) {
                dayElement.classList.add('selected');
            }

            dayElement.addEventListener('click', () => {
                this.selectedDate = new Date(year, month, day);
                this.render();
            });

            this.calendarDays.appendChild(dayElement);
        }
    }

    createDayElement(content) {
        const div = document.createElement('div');
        div.className = 'day';
        div.textContent = content;
        return div;
    }

    renderTodos() {
        const dateString = this.getDateString(this.selectedDate);
        this.todoList.render(this.todos[dateString] || []);
    }

    addTodo(todo) {
        const dateString = this.getDateString(this.selectedDate);
        if (!this.todos[dateString]) {
            this.todos[dateString] = [];
        }

        this.todos[dateString].push(todo);

        localStorage.setItem('todos', JSON.stringify(this.todos));
        this.renderTodos();
    }

    toggleTodo(index) {
        const dateString = this.getDateString(this.selectedDate);
        if (typeof this.todos[dateString][index] === 'string') {
            this.todos[dateString][index] = {
                text: this.todos[dateString][index],
                completed: false
            };
        }
        this.todos[dateString][index].completed = !this.todos[dateString][index].completed;
        localStorage.setItem('todos', JSON.stringify(this.todos));
        this.renderTodos();
    }

    deleteTodo(index) {
        const dateString = this.getDateString(this.selectedDate);
        this.todos[dateString].splice(index, 1);
        localStorage.setItem('todos', JSON.stringify(this.todos));
        this.renderTodos();
    }

    getDateString(date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    isToday(date) {
        const today = new Date();
        return this.isSameDate(date, today);
    }

    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    moveTodoToNextDay(index) {
        const currentDateString = this.getDateString(this.selectedDate);
        const nextDate = new Date(this.selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        const nextDateString = this.getDateString(nextDate);

        // 获取要移动的待办事项
        const todoToMove = this.todos[currentDateString][index];
        const todoObject = typeof todoToMove === 'string'
            ? { text: todoToMove, completed: false }
            : todoToMove;

        // 确保目标日期的数组存在
        if (!this.todos[nextDateString]) {
            this.todos[nextDateString] = [];
        }

        // 添加到下一天
        this.todos[nextDateString].push(todoObject);

        // 从当前日期删除
        this.todos[currentDateString].splice(index, 1);

        // 保存更改
        localStorage.setItem('todos', JSON.stringify(this.todos));

        // 重新渲染
        this.render();
    }

    moveTodoPrevDay(index) {
        const currentDateString = this.getDateString(this.selectedDate);
        const prevDate = new Date(this.selectedDate);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateString = this.getDateString(prevDate);

        // 获取要移动的待办事项
        const todoToMove = this.todos[currentDateString][index];
        const todoObject = typeof todoToMove === 'string'
            ? { text: todoToMove, completed: false }
            : todoToMove;

        // 确保目标日期的数组存在
        if (!this.todos[prevDateString]) {
            this.todos[prevDateString] = [];
        }

        // 添加到前一天
        this.todos[prevDateString].push(todoObject);

        // 从当前日期删除
        this.todos[currentDateString].splice(index, 1);

        // 保存更改
        localStorage.setItem('todos', JSON.stringify(this.todos));

        // 重新渲染
        this.render();
    }

    moveTodoPosition(fromIndex, toIndex) {
        const dateString = this.getDateString(this.selectedDate);
        const todos = this.todos[dateString];
        const [movedItem] = todos.splice(fromIndex, 1);
        todos.splice(toIndex, 0, movedItem);
        localStorage.setItem('todos', JSON.stringify(this.todos));
        this.renderTodos();
    }

    updateWorktime(worktime) {
        const dateString = this.getDateString(this.selectedDate);
        this.worktimes[dateString] = worktime;
        localStorage.setItem('worktimes', JSON.stringify(this.worktimes));
        this.renderWorktime();
    }

    renderWorktime() {
        const dateString = this.getDateString(this.selectedDate);
        const worktime = this.worktimes[dateString] || 0;
        this.todoInput.updateWorktime(worktime);
    }

    exportMonthData() {
        const year = this.date.getFullYear();
        const month = this.date.getMonth() + 1;
        let content = `# ${year}-${month.toString().padStart(2, '0')}\n\n`;

        // 获取当月的天数
        const lastDay = new Date(year, month, 0).getDate();

        // 遍历当月每一天
        for (let day = 1; day <= lastDay; day++) {
            const date = new Date(year, month - 1, day);
            const dateString = this.getDateString(date);
            const todos = this.todos[dateString] || [];
            const worktime = this.worktimes[dateString] || 0;

            // 如果这一天有工时或待办事项，则添加到内容中
            if (worktime > 0 || todos.length > 0) {
                content += `## ${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}\n\n`;

                if (worktime > 0) {
                    content += `- 工时：${worktime}\n`;
                }

                if (todos.length > 0) {
                    content += '- TODO\n';
                    todos.forEach((todo, index) => {
                        content += `${index + 1}. ${todo.text}${todo.completed ? ' ✓' : ''}\n`;
                    });
                }

                content += '\n';
            }
        }

        // 使用 Electron 的对话框保存文件
        ipcRenderer.send('save-file', {
            content,
            defaultPath: `calendar-${year}-${month.toString().padStart(2, '0')}.md`
        });
    }

    initSearchFeature() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const searchResults = document.getElementById('searchResults');
        const closeSearch = document.getElementById('closeSearch');
        const searchList = document.querySelector('.search-list');

        const performSearch = () => {
            const keyword = searchInput.value.trim().toLowerCase();
            if (!keyword) return;

            const results = [];
            // 遍历所有日期的待办事项
            Object.entries(this.todos).forEach(([dateString, todos]) => {
                todos.forEach(todo => {
                    if (todo.text.toLowerCase().includes(keyword)) {
                        results.push({
                            date: dateString,
                            todo: todo
                        });
                    }
                });
            });

            // 显示搜索结果
            searchList.innerHTML = '';
            results.forEach(result => {
                const item = document.createElement('div');
                item.className = `search-item${result.todo.completed ? ' completed' : ''}`;
                item.innerHTML = `
                    <div class="search-item-date">${this.formatDate(result.date)}</div>
                    <div class="search-item-text">${result.todo.text}</div>
                `;

                // 点击跳转到对应日期
                item.addEventListener('click', () => {
                    const [year, month, day] = result.date.split('-');
                    this.date = new Date(year, month - 1, 1);
                    this.selectedDate = new Date(year, month - 1, day);
                    this.render();
                    searchResults.style.display = 'none';
                    searchInput.value = '';
                });

                searchList.appendChild(item);
            });

            searchResults.style.display = 'block';
        };

        // 搜索按钮点击事件
        searchBtn.addEventListener('click', performSearch);

        // 输入框回车事件
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // 关闭搜索结果
        closeSearch.addEventListener('click', () => {
            searchResults.style.display = 'none';
            searchInput.value = '';
        });
    }

    formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${year}年${month}月${day}日`;
    }
}

new Calendar();