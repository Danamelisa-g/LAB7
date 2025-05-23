
import { loginUser } from "../services/Firebase/Auth";

class LoginForm extends HTMLElement {
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
        form?.addEventListener("submit", async (e) => {
            e.preventDefault();

            const emailInput = this.shadowRoot?.querySelector("#email") as HTMLInputElement;
            const passwordInput = this.shadowRoot?.querySelector("#password") as HTMLInputElement;
            const errorMsg = this.shadowRoot?.querySelector(".error-message");

            if (emailInput && passwordInput && errorMsg) {
                const email = emailInput.value.trim();
                const password = passwordInput.value.trim();

                if (!email || !password) {
                    errorMsg.textContent = "Por favor, completa todos los campos";
                    return;
                }

                const submitBtn = this.shadowRoot?.querySelector("button[type='submit']") as HTMLButtonElement;
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = "Iniciando sesión...";
                }

                const result = await loginUser(email, password);

                if (result.success) {
                    window.history.pushState({}, "", "/tasks");
                    const event = new CustomEvent("route-change", {
                        bubbles: true,
                        composed: true,
                        detail: { path: "/tasks" },
                    });
                    this.dispatchEvent(event);
                } else {
                    errorMsg.textContent = result.error || "Error al iniciar sesión";
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = "Iniciar sesión";
                    }
                }
            }
        });

        const registerLink = this.shadowRoot?.querySelector(".register-link");
        registerLink?.addEventListener("click", (e) => {
            e.preventDefault();
            window.history.pushState({}, "", "/register");
            const event = new CustomEvent("route-change", {
                bubbles: true,
                composed: true,
                detail: { path: "/register" },
            });
            this.dispatchEvent(event);
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
                    --primary-hover: #C2185B;
                    --secondary-color: #9C27B0;
                    --text-color: #333;
                    --border-color: #F8BBD9;
                    --error-color: #E91E63;
                    --background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 100%);
                }

                body {
                    background: var(--background);
                    min-height: 100vh;
                }

                .login-container {
                    max-width: 400px;
                    margin: 60px auto;
                    padding: 30px;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 8px 25px rgba(233, 30, 99, 0.2);
                    border: 2px solid var(--border-color);
                }

                h2 {
                    text-align: center;
                    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin: 0 0 25px 0;
                    font-size: 28px;
                    font-weight: 700;
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

                input {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid var(--border-color);
                    border-radius: 10px;
                    font-size: 14px;
                    transition: all 0.3s;
                    box-sizing: border-box;
                }

                input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1);
                }

                button {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(233, 30, 99, 0.4);
                }

                button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .error-message {
                    color: var(--error-color);
                    font-size: 14px;
                    margin-top: 10px;
                    text-align: center;
                    min-height: 20px;
                }

                .form-footer {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 14px;
                    color: var(--text-color);
                }

                .register-link {
                    color: var(--primary-color);
                    text-decoration: none;
                    font-weight: 600;
                    cursor: pointer;
                }

                .register-link:hover {
                    color: var(--secondary-color);
                }
            </style>
            <div class="login-container">
                <h2>🌸 Iniciar Sesión</h2>
                <form>
                    <div class="form-group">
                        <label for="email">Correo Electrónico</label>
                        <input type="email" id="email" required placeholder="tu@correo.com">
                    </div>
                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input type="password" id="password" required placeholder="Tu contraseña">
                    </div>
                    <button type="submit">Iniciar Sesión</button>
                    <div class="error-message"></div>
                </form>
                <div class="form-footer">
                    ¿No tienes cuenta? <a class="register-link">Regístrate</a>
                </div>
            </div>
        `;
    }
}

export default LoginForm;