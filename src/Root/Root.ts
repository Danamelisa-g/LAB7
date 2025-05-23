class Root extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupRouting();

        // Escuchar eventos de cambio de ruta
        this.addEventListener("route-change", ((e: CustomEvent) => {
            if (e.detail && e.detail.path) {
                window.history.pushState({}, "", e.detail.path);
                this.handleRouteChange();
            }
        }) as EventListener);
    }

    setupRouting() {
        // Manejar la ruta inicial
        this.handleRouteChange();
        
        // Escuchar cambios en el historial del navegador
        window.addEventListener("popstate", () => this.handleRouteChange());

        // Manejar clicks en enlaces (si los tienes)
        this.shadowRoot?.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "A" && target.hasAttribute("href")) {
                e.preventDefault();
                const href = target.getAttribute("href");
                if (href) {
                    window.history.pushState({}, "", href);
                    this.handleRouteChange();
                }
            }
        });
    }

    handleRouteChange() {
        if (!this.shadowRoot) return;
        
        const path = window.location.pathname;
        console.log("Ruta actual:", path);
        
        const content = this.shadowRoot.querySelector("#content");
        if (!content) return;

        // Limpiar contenido anterior
        content.innerHTML = "";

        // Renderizar componente según la ruta
        switch (path) {
            case "/":
                content.innerHTML = `<main-page></main-page>`;
                break;
            case "/login":
                content.innerHTML = `<login-form></login-form>`;
                break;
            case "/register":
                content.innerHTML = `<register-form></register-form>`;
                break;
            case "/tasks":
                content.innerHTML = `<task-page></task-page>`;
                break;
            default:
                content.innerHTML = `
                    <div class="not-found">
                        <h2>404 - Página no encontrada</h2>
                        <p>La página que buscas no existe.</p>
                        <a href="/">Volver al inicio</a>
                    </div>
                `;
                break;
        }
    }

    render() {
        if (!this.shadowRoot) return;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 100%);
                }
                
                .app-container {
                    min-height: 100vh;
                    width: 100%;
                }
                
                #content {
                    width: 100%;
                    min-height: 100vh;
                }
                
                .not-found {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    text-align: center;
                    color: #333;
                }
                
                .not-found h2 {
                    color: #E91E63;
                    margin-bottom: 10px;
                }
                
                .not-found a {
                    color: #9C27B0;
                    text-decoration: none;
                    font-weight: 600;
                    margin-top: 20px;
                    padding: 10px 20px;
                    border: 2px solid #9C27B0;
                    border-radius: 10px;
                    transition: all 0.3s;
                }
                
                .not-found a:hover {
                    background: #9C27B0;
                    color: white;
                }
            </style>
            
            <div class="app-container">
                <div id="content">
                    <!-- El contenido de las rutas se cargará aquí -->
                </div>
            </div>
        `;
    }
}

export default Root;