looker.plugins.visualizations.add({
  // Un ID único para tu visualización
  id: "info_popup_button",
  // El nombre que aparecerá en la lista de visualizaciones de Looker
  label: "Botón con Popup de Información",
  options: {
    title: {
      type: "string",
      label: "Texto del Botón",
      default: "Mostrar Información"
    }
  },

  // Función que se ejecuta una sola vez para configurar la visualización
  create: function(element, config) {
    // Inyectamos los estilos CSS directamente en la página
    const css = `
      .info-popup-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
      .info-button {
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        background-color: #1a73e8; /* Color azul de Google */
        color: white;
        border: none;
        border-radius: 4px;
        font-family: 'Google Sans', 'Roboto', sans-serif;
      }
      .info-button:hover {
        background-color: #125abc;
      }
      .info-popup-modal {
        display: block;
        position: fixed;
        z-index: 9999; /* Asegura que esté por encima de todo */
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.5); /* Fondo oscuro semitransparente */
      }
      .info-popup-content {
        background-color: #fefefe;
        margin: 10% auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        max-width: 800px;
        border-radius: 8px;
        position: relative;
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
      }
      .info-popup-close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
      }
      .info-popup-close:hover,
      .info-popup-close:focus {
        color: black;
        text-decoration: none;
        cursor: pointer;
      }
      .info-popup-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      .info-popup-table th, .info-popup-table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      .info-popup-table th {
        background-color: #f2f2f2;
        font-weight: bold;
      }
    `;
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);

    // Creamos el contenedor principal para el botón
    this.container = element.appendChild(document.createElement("div"));
    this.container.className = "info-popup-container";
  },

  // Función que se ejecuta cada vez que los datos o la configuración cambian
  updateAsync: function(data, element, config, queryResponse, details, done) {
    this.clearErrors();
    this.container.innerHTML = "";
    
    // Si no hay datos, mostramos un error
    if (data.length == 0) {
        this.addError({ title: "Sin Datos", message: "Esta visualización requiere al menos una fila de datos." });
        return;
    }

    const fields = queryResponse.fields.dimensions.concat(queryResponse.fields.measures);

    // Creamos el botón
    const button = this.container.appendChild(document.createElement("button"));
    button.className = "info-button";
    button.innerHTML = config.title || "Mostrar Información";

    // Definimos qué pasa al hacer clic en el botón
    button.onclick = () => {
      // Si ya existe un popup, lo eliminamos antes de crear uno nuevo
      const existingPopup = document.getElementById("info-popup-modal");
      if (existingPopup) existingPopup.remove();

      // Creamos el fondo del modal
      const modal = document.createElement("div");
      modal.id = "info-popup-modal";
      modal.className = "info-popup-modal";
      modal.onclick = (event) => {
        if (event.target == modal) modal.remove(); // Cierra el popup si se hace clic fuera
      };

      // Creamos el contenedor del contenido
      const content = document.createElement("div");
      content.className = "info-popup-content";

      // Creamos el botón de cierre (X)
      const closeButton = document.createElement("span");
      closeButton.className = "info-popup-close";
      closeButton.innerHTML = "&times;";
      closeButton.onclick = () => modal.remove();

      // Creamos la tabla
      const table = document.createElement("table");
      table.className = "info-popup-table";

      // Creamos la cabecera de la tabla
      const thead = table.createTHead();
      const headerRow = thead.insertRow();
      fields.forEach(field => {
        const th = document.createElement("th");
        th.innerHTML = field.label_short || field.label;
        headerRow.appendChild(th);
      });

      // Creamos el cuerpo de la tabla y lo llenamos con datos
      const tbody = table.createTBody();
      data.forEach(rowData => {
        const tableRow = tbody.insertRow();
        fields.forEach(field => {
          const cell = tableRow.insertCell();
          // Usamos una utilidad de Looker para formatear el valor correctamente
          cell.innerHTML = LookerCharts.Utils.htmlForCell(rowData[field.name]);
        });
      });

      // Montamos el popup
      content.appendChild(closeButton);
      content.appendChild(table);
      modal.appendChild(content);
      document.body.appendChild(modal);
    };

    done();
  }
});
