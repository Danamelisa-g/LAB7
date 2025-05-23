class TaskContainer extends HTMLElement {
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

      const titleInput = this.shadowRoot?.querySelector(
        "#task-title"
      ) as HTMLInputElement;
      const descriptionInput = this.shadowRoot?.querySelector(
        "#task-description"
      ) as HTMLTextAreaElement;

      if (titleInput && descriptionInput) {
        const taskData = {
          title: titleInput.value.trim(),
          description: descriptionInput.value.trim(),
        };

        // Validar que al menos el título no esté vacío
        if (taskData.title) {
          const event = new CustomEvent("task-submitted", {
            bubbles: true,
            composed: true,
            detail: taskData,
          });

          this.dispatchEvent(event);

          // Limpiar el formulario
          form.reset();
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
          font-family: montserrat;
          --primary-color: #4361ee;
          --primary-hover: #3a56d4;
          --text-color: #333;
          --border-color: #e0e0e0;
          --background-color: #f9f9f9;
          --shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          --border-radius: 8px;
        }
        
        form {
          padding: 25px;
          background-color: white;
          border-radius: var(--border-radius);
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 14px;
          color: var(--text-color);
          letter-spacing: 0.3px;
        }
        
        input, textarea {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid var(--border-color);
          border-radius: var(--border-radius);
          font-family: montserrat;
          font-size: 14px;
          transition: all 0.3s ease;
          box-sizing: border-box;
          background-color: #fff;
          color: var(--text-color);
        }
        
        input:focus, textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
        }
        
        textarea {
          min-height: 120px;
          resize: vertical;
          line-height: 1.5;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 25px;
        }
        
        .primary-btn {
          width: 100%;
          padding: 14px 32px;
          background: linear-gradient(45deg, var(--primary-color), #4895ef);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          z-index: 1;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .primary-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 7px 20px rgba(67, 97, 238, 0.3);
        }
        
        .primary-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 3px rgba(67, 97, 238, 0.3);
        }
        
        /* Animación para el botón */
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(67, 97, 238, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(67, 97, 238, 0); }
          100% { box-shadow: 0 0 0 0 rgba(67, 97, 238, 0); }
        }
        
        /* Estilo para el placeholder */
        ::placeholder {
          color: #aaa;
          opacity: 1;
        }
    
      </style>
      
      <form>
        <div class="form-group">
          <label for="task-title">Título de la tarea</label>
          <input type="text" id="task-title" required placeholder="Escribe un título descriptivo">
        </div>
        
        <div class="form-group">
          <label for="task-description">Descripción</label>
          <textarea id="task-description" placeholder="Describe los detalles de la tarea..."></textarea>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="primary-btn">
            Añadir tarea
          </button>
        </div>
      </form>
    `;
  }
}

export default TaskContainer;