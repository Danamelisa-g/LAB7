import { Userid } from "../utils/Type";
import { getTasksByUserId, addTask, updateTask, deleteTask } from "../services/Firebase/Userservice";
import { logoutUser, getCurrentUserId, getCurrentUserEmail } from "../services/Firebase/Auth";

class PageTask extends HTMLElement {
  private tasks: Userid[] = [];

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

    // Escuchar eventos de las tarjetas de tareas
    this.addEventListener("task-status-changed", ((e: CustomEvent) => {
      this.handleTaskStatusChange(e.detail.id, e.detail.status);
    }) as EventListener);

    this.addEventListener("task-deleted", ((e: CustomEvent) => {
      this.handleTaskDelete(e.detail.id);
    }) as EventListener);
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
      userid: userId, // Corregido: era userId, debe ser userid según tu tipo
      title: taskData.title,
      description: taskData.description,
      status: "todo" as const,
    };

    // Llamar a la función addTask de Firebase
    const taskId = await addTask(newTask);
    if (taskId) {
      this.showMessage("Tarea añadida ✨");
      this.loadTasks(); // Recargar las tareas
    } else {
      this.showMessage("Error al añadir tarea ❌");
    }
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

    // Separar tareas por estado
    const todoTasks = this.tasks.filter(task => task.status === "todo");
    const inProgressTasks = this.tasks.filter(task => task.status === "in-progress");
    const completedTasks = this.tasks.filter(task => task.status === "completed");

    container.innerHTML = `
      <div class="tasks-section">
        <h3>📝 Por Hacer (${todoTasks.length})</h3>
        <div class="task-list" id="todo-tasks"></div>
      </div>
      
      <div class="tasks-section">
        <h3>⏳ En Progreso (${inProgressTasks.length})</h3>
        <div class="task-list" id="progress-tasks"></div>
      </div>
      
      <div class="tasks-section">
        <h3>✅ Completadas (${completedTasks.length})</h3>
        <div class="task-list" id="completed-tasks"></div>
      </div>
    `;

    this.renderTaskList(todoTasks, "#todo-tasks");
    this.renderTaskList(inProgressTasks, "#progress-tasks");
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
      // Crear el elemento task-card usando el Web Component
      const taskCard = document.createElement("task-card");
      taskCard.setAttribute("id", task.id);
      taskCard.setAttribute("title", task.title);
      taskCard.setAttribute("description", task.description);
      taskCard.setAttribute("status", task.status);
      
      container.appendChild(taskCard);
    });
  }

  async handleTaskStatusChange(taskId: string, newStatus: string) {
    const success = await updateTask(taskId, { status: newStatus });
    if (success) {
      this.loadTasks(); // Recargar las tareas
      const statusText = newStatus === "todo" ? "Por hacer 📝" : 
                        newStatus === "in-progress" ? "En progreso ⏳" : "Completada ✅";
      this.showMessage(`Tarea actualizada: ${statusText}`);
    } else {
      this.showMessage("Error al actualizar tarea ❌");
    }
  }

  async handleTaskDelete(taskId: string) {
    if (confirm("¿Eliminar esta tarea?")) {
      const success = await deleteTask(taskId);
      if (success) {
        this.loadTasks(); // Recargar las tareas
        this.showMessage("Tarea eliminada 🗑️");
      } else {
        this.showMessage("Error al eliminar tarea ❌");
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
      box-shadow: 0 4px 12px rgba(233, 30, 99, 0.3);
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
          max-width: 1200px;
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
          max-width: 1200px;
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
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .tasks-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
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
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px;
          color: var(--text-color);
          grid-column: 1 / -1;
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
          
          .tasks-container {
            grid-template-columns: 1fr;
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

export default PageTask;