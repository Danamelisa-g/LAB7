class TaskForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
  }

  setupListeners() {
    const form = this.shadowRoot?.querySelector("form");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();

      const titleInput = this.shadowRoot?.querySelector("#task-title") as HTMLInputElement;
      const descriptionInput = this.shadowRoot?.querySelector("#task-description") as HTMLTextAreaElement;
      const errorMsg = this.shadowRoot?.querySelector(".error-message");

      if (titleInput && descriptionInput && errorMsg) {
        const taskData = {
          title: titleInput.value.trim(),
          description: descriptionInput.value.trim(),
        };

        if (taskData.title) {
          const event = new CustomEvent("task-submitted", {
            bubbles: true,
            composed: true,
            detail: taskData,
          });

          this.dispatchEvent(event);
          form.reset();
          errorMsg.textContent = "";
        } else {
          errorMsg.textContent = "El título es obligatorio";
        }
      }
    });
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
          --text-color: #333;
          --border-color: #F8BBD9;
          --error-color: #E91E63;
        }
        
        form {
          padding: 20px;
          background: white;
          border-radius: 15px;
          border: 2px solid var(--border-color);
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: var(--secondary-color);
        }
        
        input, textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid var(--border-color);
          border-radius: 10px;
          font-family: inherit;
          font-size: 14px;
          transition: all 0.3s;
          box-sizing: border-box;
        }
        
        input:focus, textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1);
        }
        
        textarea {
          min-height: 80px;
          resize: vertical;
        }
        
        .primary-btn {
          padding: 12px 24px;
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          width: 100%;
        }
        
        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(233, 30, 99, 0.4);
        }

        .error-message {
          color: var(--error-color);
          font-size: 14px;
          margin-top: 10px;
          min-height: 20px;
        }
      </style>
      
      <form>
        <div class="form-group">
          <label for="task-title">🌸 Título de la tarea</label>
          <input type="text" id="task-title" required placeholder="¿Qué necesitas hacer?">
        </div>
        
        <div class="form-group">
          <label for="task-description">💭 Descripción (opcional)</label>
          <textarea id="task-description" placeholder="Añade detalles..."></textarea>
        </div>
        
        <div class="error-message"></div>
        
        <button type="submit" class="primary-btn">
          ✨ Añadir Tarea
        </button>
      </form>
    `;
  }
}

export default TaskForm;