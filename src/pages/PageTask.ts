import { Userid } from "../utils/Type";
import { getTasksByUserId, addTask,updateTask,deleteTask,} from "../services/Firebase/Userservice";
import { logoutUser, getCurrentUserId, getCurrentUserEmail } from "../services/Firebase/Auth";

class pageTask extends HTMLElement {
  private tasks:Userid[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
    this.loadTasks();
  }

  setupListeners() {
    const addTaskBtn = this.shadowRoot?.querySelector("#add-task-btn");
    addTaskBtn?.addEventListener("click", () => {
      this.openAddTaskModal();
    });

    const logoutBtn = this.shadowRoot?.querySelector("#logout-btn");
    logoutBtn?.addEventListener("click", async () => {
      if (confirm("¿Cerrar sesión?")) {
        await logoutUser();
        window.history.pushState({}, "", "/");
        const event = new CustomEvent("route-change", {
          bubbles: true,
          composed: true,
          detail: { path: "/" },
        });
        this.dispatchEvent(event);
      }
    });
  }

  openAddTaskModal() {
    const modal = document.createElement("div");
    modal.innerHTML = `
      <div class="modal-content">
        <h3>✨ Nueva Tarea</h3>
        <task-form id="task-form"></task-form>
        <button class="close-btn">Cerrar</button>
      </div>
    `;

    // Estilos simples del modal
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(156, 39, 176, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;

    const modalContent = modal.querySelector('.modal-content') as HTMLElement;
    modalContent.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 15px;
      width: 90%;
      max-width: 500px;
      border: 2px solid #F8BBD9;
    `;

    const closeBtn = modal.querySelector('.close-btn') as HTMLElement;
    closeBtn.style.cssText = `
      background: #E91E63;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 10px;
    `;

    document.body.appendChild(modal);

    closeBtn?.addEventListener("click", () => {
      modal.remove();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    const taskForm = modal.querySelector("#task-form");
    taskForm?.addEventListener("task-submitted", (e: Event) => {
      const customEvent = e as CustomEvent;
      const taskData = customEvent.detail;
      this.addTask(taskData);
      modal.remove();
    });
  }

  async addTask(taskData: { title: string; description: string }) {
    const userId = getCurrentUserId();
    if (!userId) return;

    const newTask = {
      userId,
      title: taskData.title,
      description: taskData.description,
      status: "todo" as const,
    };

    
  }

  async loadTasks() {
    const userId = getCurrentUserId();
    if (!userId) return;

    this.tasks = await getTasksByUserId(userId);
    this.renderTasks();
  }

  renderTasks() {
    const container = this.shadowRoot?.querySelector(".tasks-container");
    if (!container) return;

    if (this.tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>🌸 ¡Comienza a organizarte!</h3>
          <p>No tienes tareas todavía</p>
        </div>
      `;
      return;
    }

    // Separar tareas
    const pendingTasks = this.tasks.filter(task => task.status !== "completed");
    const completedTasks = this.tasks.filter(task => task.status === "completed");

    container.innerHTML = `
      <div class="tasks-section">
        <h3>📝 Tareas Pendientes (${pendingTasks.length})</h3>
        <div class="task-list" id="pending-tasks"></div>
      </div>
      
      <div class="tasks-section">
        <h3>✅ Tareas Completadas (${completedTasks.length})</h3>
        <div class="task-list" id="completed-tasks"></div>
      </div>
    `;

    this.renderTaskList(pendingTasks, "#pending-tasks");
    this.renderTaskList(completedTasks, "#completed-tasks");
  }

  renderTaskList(tasks: Userid[], containerId: string) {
    const container = this.shadowRoot?.querySelector(containerId);
    if (!container) return;

    if (tasks.length === 0) {
      container.innerHTML = `<p class="no-tasks">No hay tareas</p>`;
      return;
    }

    container.innerHTML = "";
    tasks.forEach(task => {
      const taskElement = document.createElement("div");
      taskElement.className = `task-item ${task.status === "completed" ? "completed" : ""}`;
      taskElement.innerHTML = `
        <div class="task-content">
          <h4>${task.title}</h4>
          <p>${task.description}</p>
        </div>
        <div class="task-actions">
          <button class="complete-btn" onclick="this.closest('tasks-page').toggleTask('${task.id}', ${task.status !== "completed"})">
            ${task.status === "completed" ? "❌" : "✅"}
          </button>
          <button class="delete-btn" onclick="this.closest('tasks-page').deleteTask('${task.id}')">
            🗑️
          </button>
        </div>
      `;
      container.appendChild(taskElement);
    });
  }

  async toggleTask(taskId: string, completed: boolean) {
    const success = await updateTask(taskId, { status: completed ? "completed" : "todo" });
    if (success) {
      this.loadTasks();
      this.showMessage(completed ? "Tarea completada ✅" : "Tarea pendiente 📝");
    }
  }

  async deleteTask(taskId: string) {
    if (confirm("¿Eliminar esta tarea?")) {
      const success = await deleteTask(taskId);
      if (success) {
        this.loadTasks();
        this.showMessage("Tarea eliminada 🗑️");
      }
    }
  }

  showMessage(text: string) {
    const message = document.createElement("div");
    message.textContent = text;
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #E91E63;
      color: white;
      padding: 12px 20px;
      border-radius: 10px;
      z-index: 1000;
    `;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
  }

  render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          --primary-color: #E91E63;
          --secondary-color: #9C27B0;
          --accent-color: #FF4081;
          --background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 100%);
          --card-bg: #fff;
          --text-color: #333;
          --border-color: #F8BBD9;
        }
        
        .page-container {
          min-height: 100vh;
          background: var(--background);
          padding: 20px;
        }
        
        .header {
          max-width: 800px;
          margin: 0 auto 30px;
          background: var(--card-bg);
          padding: 20px;
          border-radius: 15px;
          border: 2px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        h1 {
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 14px;
          color: var(--text-color);
        }
        
        button {
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        #add-task-btn {
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          color: white;
          font-size: 16px;
          padding: 12px 24px;
          margin: 0 auto 20px;
          display: block;
          max-width: 800px;
        }
        
        #add-task-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(233, 30, 99, 0.4);
        }
        
        #logout-btn {
          background: var(--accent-color);
          color: white;
          font-size: 14px;
        }
        
        .main-content {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .tasks-container {
          display: grid;
          gap: 20px;
        }
        
        .tasks-section {
          background: var(--card-bg);
          padding: 20px;
          border-radius: 15px;
          border: 2px solid var(--border-color);
        }
        
        .tasks-section h3 {
          margin: 0 0 20px 0;
          color: var(--secondary-color);
          font-size: 18px;
        }
        
        .task-list {
          display: grid;
          gap: 10px;
        }
        
        .task-item {
          background: #FAFAFA;
          padding: 15px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .task-item.completed {
          opacity: 0.7;
        }
        
        .task-item.completed h4 {
          text-decoration: line-through;
        }
        
        .task-content h4 {
          margin: 0 0 5px 0;
          color: var(--text-color);
          font-size: 16px;
        }
        
        .task-content p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
        
        .task-actions {
          display: flex;
          gap: 5px;
        }
        
        .complete-btn, .delete-btn {
          background: none;
          border: 1px solid var(--border-color);
          padding: 5px 8px;
          border-radius: 5px;
          font-size: 14px;
        }
        
        .complete-btn:hover {
          background: var(--primary-color);
          color: white;
        }
        
        .delete-btn:hover {
          background: var(--accent-color);
          color: white;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px;
          color: var(--text-color);
        }
        
        .no-tasks {
          text-align: center;
          color: #999;
          font-style: italic;
          padding: 20px;
        }
        
        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
          
          .user-info {
            flex-direction: column;
            gap: 10px;
          }
          
          .task-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .task-actions {
            align-self: stretch;
            justify-content: flex-end;
          }
        }
      </style>
      
      <div class="page-container">
        <div class="header">
          <h1>🌸 Mis Tareas</h1>
          <div class="user-info">
            <span id="user-email">Cargando...</span>
            <button id="logout-btn">Salir</button>
          </div>
        </div>
        
        <button id="add-task-btn">✨ Nueva Tarea</button>
        
        <div class="main-content">
          <div class="tasks-container">
            <div class="empty-state">
              <p>Cargando tareas...</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Mostrar email del usuario
    const userEmailElement = this.shadowRoot.querySelector("#user-email");
    const userEmail = getCurrentUserEmail();
    if (userEmailElement && userEmail) {
      userEmailElement.textContent = userEmail;
    }
  }
}

export default pageTask;
