import { checkAuthState } from "../services/Firebase/Auth";

class PrincipalMain extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.renderInitialStructure();
    this.checkAuthentication();
  }

  renderInitialStructure() {
    if (!this.shadowRoot) return;
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          --primary-color: #E91E63;
          --secondary-color: #9C27B0;
          --accent-color: #FF4081;
          --text-color: #333;
          --text-secondary: #666;
          --background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 100%);
          --card-bg: #fff;
          --shadow: 0 8px 25px rgba(233, 30, 99, 0.2);
          --border-radius: 15px;
        }

        .main-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          min-height: 100vh;
          background: var(--background);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .welcome-container {
          background: var(--card-bg);
          border-radius: var(--border-radius);
          padding: 40px;
          box-shadow: var(--shadow);
          text-align: center;
          border: 2px solid #F8BBD9;
        }

        h1 {
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 2.5rem;
          margin-bottom: 20px;
          font-weight: 700;
        }

        .subtitle {
          color: var(--text-secondary);
          font-size: 1.2rem;
          margin-bottom: 30px;
        }

        .description {
          color: var(--text-secondary);
          font-size: 1rem;
          margin-bottom: 40px;
        }

        .auth-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        button {
          padding: 14px 28px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          min-width: 140px;
        }

        .primary-btn {
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          color: white;
        }

        .secondary-btn {
          background: linear-gradient(45deg, var(--secondary-color), var(--accent-color));
          color: white;
        }

        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(233, 30, 99, 0.4);
        }

        @media (max-width: 600px) {
          .auth-buttons {
            flex-direction: column;
          }
          
          button {
            width: 100%;
          }
        }
      </style>
      
      <div class="main-container">
        <!-- El contenido se cargará dinámicamente -->
      </div>
    `;
  }

  checkAuthentication() {
    checkAuthState((user) => {
      if (user) {
        window.history.pushState({}, "", "/tasks");
        const event = new CustomEvent("route-change", {
          bubbles: true,
          composed: true,
          detail: { path: "/tasks" },
        });
        this.dispatchEvent(event);
      } else {
        this.renderAuthOptions();
      }
    });
  }

  renderAuthOptions() {
    const container = this.shadowRoot?.querySelector(".main-container");
    if (!container) return;

    container.innerHTML = `
      <div class="welcome-container">
        <h1>🌸 Gestor de Tareas</h1>
        <p class="subtitle">Organiza tu vida con estilo</p>
        <p class="description">
          Una forma simple y bonita de gestionar tus tareas diarias.
        </p>
        
        <div class="auth-buttons">
          <button id="login-btn" class="secondary-btn">Iniciar Sesión</button>
          <button id="register-btn" class="primary-btn">Registrarse</button>
        </div>
      </div>
    `;

    const loginBtn = this.shadowRoot?.querySelector("#login-btn");
    loginBtn?.addEventListener("click", () => {
      window.history.pushState({}, "", "/login");
      const event = new CustomEvent("route-change", {
        bubbles: true,
        composed: true,
        detail: { path: "/login" },
      });
      this.dispatchEvent(event);
    });

    const registerBtn = this.shadowRoot?.querySelector("#register-btn");
    registerBtn?.addEventListener("click", () => {
      window.history.pushState({}, "", "/register");
      const event = new CustomEvent("route-change", {
        bubbles: true,
        composed: true,
        detail: { path: "/register" },
      });
      this.dispatchEvent(event);
    });
  }
}

export default PrincipalMain;