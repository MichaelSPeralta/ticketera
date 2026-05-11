interface TicketSDKOptions {
  apiKey: string;
  baseUrl?: string;
}

class TicketWidget extends HTMLElement {
  private options: TicketSDKOptions = { apiKey: '', baseUrl: 'http://localhost:3001' };
  private conversationHistory: any[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  static get observedAttributes() {
    return ['api-key', 'base-url'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'api-key') this.options.apiKey = newValue;
    if (name === 'base-url') this.options.baseUrl = newValue;
  }

  public setHistory(history: any[]) {
    this.conversationHistory = history;
  }

  private render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --primary-color: #6366f1;
          --bg-color: #ffffff;
          --text-color: #1f2937;
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .widget-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--primary-color);
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }
        .widget-button:hover {
          transform: scale(1.05);
        }
        .widget-panel {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 350px;
          background: var(--bg-color);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          display: none;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .widget-panel.open {
          display: flex;
        }
        .header {
          padding: 16px;
          background: var(--primary-color);
          color: white;
          font-weight: 600;
        }
        .content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        input, textarea {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }
        textarea {
          resize: none;
          height: 100px;
        }
        button.submit {
          padding: 10px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
        .status-msg {
          font-size: 12px;
          text-align: center;
          margin-top: 8px;
        }
        .status-msg.success { color: #10b981; }
        .status-msg.error { color: #ef4444; }
      </style>
      <div class="widget-panel" id="panel">
        <div class="header">Reportar un problema</div>
        <div class="content">
          <input type="text" id="email" placeholder="Tu email" required />
          <input type="text" id="title" placeholder="Título del problema" required />
          <textarea id="description" placeholder="Describe lo que sucede..." required></textarea>
          <button class="submit" id="submitBtn">Enviar Ticket</button>
          <div id="status" class="status-msg"></div>
        </div>
      </div>
      <button class="widget-button" id="toggleBtn">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </button>
    `;

    const toggleBtn = this.shadowRoot.getElementById('toggleBtn');
    const panel = this.shadowRoot.getElementById('panel');
    const submitBtn = this.shadowRoot.getElementById('submitBtn');
    const status = this.shadowRoot.getElementById('status');

    toggleBtn?.addEventListener('click', () => {
      panel?.classList.toggle('open');
    });

    submitBtn?.addEventListener('click', async () => {
      const email = (this.shadowRoot?.getElementById('email') as HTMLInputElement).value;
      const title = (this.shadowRoot?.getElementById('title') as HTMLInputElement).value;
      const description = (this.shadowRoot?.getElementById('description') as HTMLTextAreaElement).value;

      if (!email || !title || !description) {
        if (status) {
          status.textContent = 'Por favor completa todos los campos';
          status.className = 'status-msg error';
        }
        return;
      }

      submitBtn.setAttribute('disabled', 'true');
      if (status) status.textContent = 'Enviando...';

      try {
        const response = await fetch(`${this.options.baseUrl}/tickets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.options.apiKey
          },
          body: JSON.stringify({
            title,
            description,
            contactEmail: email,
            context: {
              messages: this.conversationHistory,
              metadata: { url: window.location.href }
            }
          })
        });

        if (response.ok) {
          if (status) {
            status.textContent = '¡Ticket enviado con éxito!';
            status.className = 'status-msg success';
          }
          setTimeout(() => {
            panel?.classList.remove('open');
            if (status) status.textContent = '';
          }, 2000);
        } else {
          throw new Error('Error al enviar ticket');
        }
      } catch (err) {
        if (status) {
          status.textContent = 'Error al enviar ticket. Reintenta.';
          status.className = 'status-msg error';
        }
      } finally {
        submitBtn.removeAttribute('disabled');
      }
    });
  }
}

customElements.define('ticket-widget', TicketWidget);

export const TicketSDK = {
  init: (options: TicketSDKOptions) => {
    const widget = document.querySelector('ticket-widget') as TicketWidget;
    if (widget) {
      widget.setAttribute('api-key', options.apiKey);
      if (options.baseUrl) widget.setAttribute('base-url', options.baseUrl);
    }
  },
  setHistory: (history: any[]) => {
    const widget = document.querySelector('ticket-widget') as TicketWidget;
    if (widget) {
      widget.setHistory(history);
    }
  }
};
