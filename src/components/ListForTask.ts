class TaskList extends HTMLElement {
  private tasks: TaskItem[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["status"];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();

    this.loadTasks();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) {
      this.render();
    }
  }

  get status() {
    return this.getAttribute("status") || "pending";
  }

  setupEventListeners() {
    document.addEventListener("task-added", ((e: CustomEvent) => {
      if (this.status === "pending") {
        this.addTask(e.detail.task);
      }
    }) as EventListener);

    this.shadowRoot?.addEventListener("task-toggle-complete", ((
      e: CustomEvent
    ) => {
      this.toggleTaskComplete(e.detail.taskId);
    }) as EventListener);

    this.shadowRoot?.addEventListener("task-delete", ((e: CustomEvent) => {
      this.deleteTask(e.detail.taskId);
    }) as EventListener);

    const taskContainer = this.shadowRoot?.querySelector(".task-container");
    if (taskContainer) {
      taskContainer.addEventListener("dragover", (e) => {
        e.preventDefault();
        taskContainer.classList.add("drag-over");
      });

      taskContainer.addEventListener("dragleave", () => {
        taskContainer.classList.remove("drag-over");
      });

      taskContainer.addEventListener("drop", ((e: DragEvent) => {
        e.preventDefault();
        taskContainer.classList.remove("drag-over");

        const taskId = e.dataTransfer?.getData("text/plain");
        if (taskId) {
          this.moveTaskToStatus(taskId, this.status);
        }
      }) as EventListener);
    }
  }

  loadTasks() {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const allTasks = JSON.parse(savedTasks);

      this.tasks = this.filterTasksByStatus(allTasks);
      this.render();
    }
  }

  filterTasksByStatus(allTasks: TaskItem[]) {
    switch (this.status) {
      case "pending":
        return allTasks.filter(
          (task: TaskItem) =>
            !task.completed && !task.inProgress && !task.inReview
        );
      case "in-progress":
        return allTasks.filter(
          (task: TaskItem) =>
            task.inProgress && !task.completed && !task.inReview
        );
      case "review":
        return allTasks.filter(
          (task: TaskItem) => task.inReview && !task.completed
        );
      case "completed":
        return allTasks.filter((task: TaskItem) => task.completed);
      default:
        return [];
    }
  }

  saveTasks() {
    const savedTasks = localStorage.getItem("tasks");
    let allTasks: TaskItem[] = savedTasks ? JSON.parse(savedTasks) : [];

    allTasks = allTasks.filter((task: TaskItem) => {
      switch (this.status) {
        case "pending":
          return task.inProgress || task.inReview || task.completed;
        case "in-progress":
          return !task.inProgress || task.inReview || task.completed;
        case "review":
          return !task.inReview || task.completed;
        case "completed":
          return !task.completed;
        default:
          return true;
      }
    });

    allTasks = [...allTasks, ...this.tasks];

    localStorage.setItem("tasks", JSON.stringify(allTasks));
  }

  addTask(task: TaskItem) {
    switch (this.status) {
      case "pending":
        task.inProgress = false;
        task.inReview = false;
        task.completed = false;
        break;
      case "in-progress":
        task.inProgress = true;
        task.inReview = false;
        task.completed = false;
        break;
      case "review":
        task.inProgress = false;
        task.inReview = true;
        task.completed = false;
        break;
      case "completed":
        task.inProgress = false;
        task.inReview = false;
        task.completed = true;
        break;
    }

    this.tasks.push(task);
    this.saveTasks();
    this.render();
  }

  toggleTaskComplete(taskId: string) {
    this.tasks = this.tasks.map((task: TaskItem) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    this.saveTasks();
    this.render();
  }

  deleteTask(taskId: string) {
    this.tasks = this.tasks.filter((task: TaskItem) => task.id !== taskId);
    this.saveTasks();
    this.render();
  }

  moveTaskToStatus(taskId: string, newStatus: string) {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const allTasks: TaskItem[] = JSON.parse(savedTasks);

      const taskToMove = allTasks.find((t: TaskItem) => t.id === taskId);

      if (taskToMove) {
        switch (newStatus) {
          case "pending":
            taskToMove.inProgress = false;
            taskToMove.inReview = false;
            taskToMove.completed = false;
            break;
          case "in-progress":
            taskToMove.inProgress = true;
            taskToMove.inReview = false;
            taskToMove.completed = false;
            break;
          case "review":
            taskToMove.inProgress = false;
            taskToMove.inReview = true;
            taskToMove.completed = false;
            break;
          case "completed":
            taskToMove.inProgress = false;
            taskToMove.inReview = false;
            taskToMove.completed = true;
            break;
        }

        localStorage.setItem("tasks", JSON.stringify(allTasks));

        document.dispatchEvent(new CustomEvent("tasks-updated"));

        this.loadTasks();
      }
    }
  }

  render() {
    if (!this.shadowRoot) return;

    const pendingTasks = this.tasks.filter((task: TaskItem) => !task.completed);
    const completedTasks = this.tasks.filter(
      (task: TaskItem) => task.completed
    );

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: montserrat;
        }
        
        .tasks-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .task-section {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        h3 {
          margin-top: 0;
          color: #333;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }
        
        .task-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .task-item {
          background-color: white;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .task-item.completed {
          opacity: 0.7;
        }
        
        .task-item.completed .task-title {
          text-decoration: line-through;
        }
        
        .task-content {
          flex: 1;
        }
        
        .task-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .task-description {
          font-size: 14px;
          color: #666;
        }
        
        .task-actions {
          display: flex;
          gap: 5px;
        }
        
        button {
          padding: 5px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .complete-btn {
          background-color: #4CAF50;
          color: white;
        }
        
        .delete-btn {
          background-color: #f44336;
          color: white;
        }
        
        .empty-message {
          color: #666;
          font-style: italic;
          text-align: center;
          padding: 10px;
        }
      </style>
      
      <div class="tasks-container">
        <div class="task-section">
          <h3>Tareas pendientes (${pendingTasks.length})</h3>
          
          ${
            pendingTasks.length > 0
              ? `
            <ul class="task-list">
              ${pendingTasks
                .map(
                  (task: TaskItem) => `
                <li class="task-item" data-id="${task.id}">
                  <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    ${
                      task.description
                        ? `<div class="task-description">${task.description}</div>`
                        : ""
                    }
                  </div>
                  <div class="task-actions">
                    <button class="complete-btn">Completar</button>
                    <button class="delete-btn">Eliminar</button>
                  </div>
                </li>
              `
                )
                .join("")}
            </ul>
          `
              : `
            <p class="empty-message">No hay tareas pendientes</p>
          `
          }
        </div>
        
        <div class="task-section">
          <h3>Tareas completadas (${completedTasks.length})</h3>
          
          ${
            completedTasks.length > 0
              ? `
            <ul class="task-list">
              ${completedTasks
                .map(
                  (task: TaskItem) => `
                <li class="task-item completed" data-id="${task.id}">
                  <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    ${
                      task.description
                        ? `<div class="task-description">${task.description}</div>`
                        : ""
                    }
                  </div>
                  <div class="task-actions">
                    <button class="complete-btn">Desmarcar</button>
                    <button class="delete-btn">Eliminar</button>
                  </div>
                </li>
              `
                )
                .join("")}
            </ul>
          `
              : `
            <p class="empty-message">No hay tareas completadas</p>
          `
          }
        </div>
      </div>
    `;
  }
}

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
  inProgress?: boolean;
  inReview?: boolean;
}

export default TaskList;