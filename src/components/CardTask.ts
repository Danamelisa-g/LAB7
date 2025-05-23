// Definimos una clase que extiende HTMLElement para crear un Web Component personalizado
class TaskCard extends HTMLElement {
    // Constructor: se ejecuta cuando se crea una nueva instancia del componente
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  // Método estático que define qué atributos queremos observar para cambios
  // Cuando estos atributos cambien, se ejecutará attributeChangedCallback()
  static get observedAttributes() {
    return ["id", "title", "description","status"];
  }
  // Se ejecuta automáticamente cuando algún atributo observado cambia
  attributeChangedCallback(){
    this.render();
  }
  // Se ejecuta cuando el elemento se conecta al DOM
  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }
  /// Método que configura todos los event listeners del componente
   setupEventListeners() {
    const statusButtons = this.shadowRoot?.querySelectorAll(".status-btn");
     // Iteramos sobre cada botón de estado para agregar event listeners
    statusButtons?.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        const status = target.getAttribute("data-status");
           // Obtenemos la tarjeta de tarea principal
        const taskCard = this.shadowRoot?.querySelector(".task-card");
        const statusElement = taskCard?.querySelector(".task-status");
// Verificamos que todos los elementos necesarios existan
        if (taskCard && statusElement && status) {
          
          taskCard.className = "task-card " + status;

          if (status === "completed") {
            taskCard.classList.add("completed");
          } else {
            taskCard.classList.remove("completed");
          }

         
          statusElement.textContent =
            status === "todo"
              ? "Por hacer"
              : status === "in-progress"
              ? "En progreso"
              : "Completada";

          //aqui se le pide cambiar la clase de estado
          statusElement.className = "task-status " + status;

         //veamos el botos
        
          const allStatusBtns =
            this.shadowRoot?.querySelectorAll(".status-btn");
          allStatusBtns?.forEach((statusBtn) => {
            if (statusBtn.getAttribute("data-status") === status) {
              statusBtn.classList.add("active-status");
            } else {
              statusBtn.classList.remove("active-status");
            }
          });

          //aqui emitimos el 
          this.dispatchEvent(
            new CustomEvent("task-status-changed", {
              bubbles: true,
              composed: true,
              detail: {
                id: this.getAttribute("id"),
                status: status,
              },
            })
          );
        }
      });
    });

    //Aqui estamos agregando un evento para el boton de eliminar 
    const deleteBtn = this.shadowRoot?.querySelector(".delete-btn");
    deleteBtn?.addEventListener("click", () => {
      // Emitir un evento para notificar que la tarea debe ser eliminada
      this.dispatchEvent(
        new CustomEvent("task-deleted", {
          bubbles: true,
          composed: true,
          detail: {
            id: this.getAttribute("id"),
          },
        })
      );
    });
  }

  render() {
    if(!this.shadowRoot) return;
    const id=this.getAttribute("id") || "";
    const title = this.getAttribute("title") || "no title";
    const description =this.getAttribute("description") || "no description";
    const status = this.getAttribute("status") || "todo";

     const statusText =
      status === "todo"
        ? "Por hacer"
        : status === "in-progress"
        ? "En progreso"
        : "Completada";
   
    
    this.shadowRoot.innerHTML = `
      <style>
      :host{
      display:block;
      font-family: Arial, sans-serif;
      --primary color: #007bff;
      --secondary-color: #6c757d;
      --background-color: #f8f9fa;
      --card-background-color: #ffffff;
        --border-color: #dee2e6;
        --text-color: #212529;
        --text-secondary-color: #6c757d;
        --sucess-color: #28a745;
        --warning-color: #ffc107;
        --danger-color: #dc3545;
        --border-radius:8px;
        --shadow: o 2px 4px rgba(0, 0, 0, 0.1);
        --todocolor: #007bff;
        --in-progress-color: #ffc107;
        --completed-color: #28a745;

      }
        .task-card {
       background-color: var(--card-background);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          padding: 15px;
          margin-bottom: 15px;
          border-left: 4px solid var(--todo-color);
          transition: all 0.2s;
        }
         
        }
        .task-card.todo {
           border-left-color: var(--todo-color);
        }
        .task-card.in-progress {
          border-left-color: var(--in-progress-color);
        }
        .task-card.completed {
          border-left-color: var(--completed-color);
        }
         .task-card.completed .task-title {
          text-decoration: line-through;
        }
         .task-card.completed .task-title {
          text-decoration: line-through;
        }
          .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        .task-title {
          font-weight: 600;
          font-size: 16px;
          margin: 0;
        }
        
        .task-status {
          font-size: 12px;
          padding: 3px 8px;
          border-radius: 12px;
          background-color: var(--in-progress-color);
          color: white;
          display: inline-block;
        }
        
        .task-status.todo {
          background-color: var(--todo-color);
        }
        
        .task-status.in-progress {
          background-color: var(--in-progress-color);
        }
        
        .task-status.completed {
          background-color: var(--completed-color);
        }
        
        .task-description {
          color: var(--text-secondary);
          font-size: 14px;
          margin: 10px 0;
        }
        
        .task-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
          font-size: 12px;
        }
        
        .task-actions {
          display: flex;
          gap: 5px;
        }
        
        .status-btn {
          background: none;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 3px 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .active-status {
          background-color: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        
        .delete-btn {
          background-color: var(--danger-color);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 3px 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .delete-btn:hover {
          background-color: #d32f2f;
        }
      </style>
      <div class="task-card" ${status}" data-id="${id}">
       <div class="task-header">
          <h3 class="task-title">${title}</h3>
          <span class="task-status ${status}">${statusText}</span>
        </div>
        <p class="task-description">${description}</p>
        <div class="task-footer">
          <div class="task-actions">
            <button class="status-btn ${
              status === "todo" ? "active-status" : ""
            }" data-status="todo">Por hacer</button>
            <button class="status-btn ${
              status === "in-progress" ? "active-status" : ""
            }" data-status="in-progress">En progreso</button>
            <button class="status-btn ${
              status === "completed" ? "active-status" : ""
            }" data-status="completed">Completada</button>
            <button class="delete-btn">Eliminar</button>
          </div>
        </div>
      </div>
    
    `;
  }
}
export default TaskCard;