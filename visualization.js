// Carga la librería para componentes de Looker Studio
const dscc = require('@google/dscc');

// Función principal que dibuja la visualización
const draw = (data) => {
  // Limpia el contenedor
  document.body.innerHTML = '';

  // Estilos CSS
  const css = `
    body, html { display: flex; align-items: center; justify-content: center; height: 100%; }
    .info-button { padding: 10px 20px; font-size: 16px; cursor: pointer; background-color: #1a73e8; color: white; border: none; border-radius: 4px; }
    .info-popup-modal { display: block; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.5); }
    .info-popup-content { background-color: #fefefe; margin: 10% auto; padding: 20px; border: 1px solid #888; width: 80%; max-width: 800px; border-radius: 8px; position: relative; }
    .info-popup-close { color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer; }
    .info-popup-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .info-popup-table th, .info-popup-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .info-popup-table th { background-color: #f2f2f2; }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // Crea el botón
  const button = document.createElement('button');
  button.className = 'info-button';
  button.textContent = 'Mostrar Información';
  document.body.appendChild(button);

  // Lógica del popup
  button.onclick = () => {
    const existingPopup = document.getElementById('info-popup-modal');
    if (existingPopup) existingPopup.remove();

    const modal = document.createElement('div');
    modal.id = 'info-popup-modal';
    modal.className = 'info-popup-modal';
    
    const content = document.createElement('div');
    content.className = 'info-popup-content';

    const closeButton = document.createElement('span');
    closeButton.className = 'info-popup-close';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => modal.remove();

    const table = document.createElement('table');
    table.className = 'info-popup-table';
    
    // Cabecera de la tabla
    const thead = table.createTHead().insertRow();
    data.fields.forEach(field => {
        const th = document.createElement('th');
        th.textContent = field.name;
        thead.appendChild(th);
    });

    // Filas de la tabla
    const tbody = table.createTBody();
    data.tables.DEFAULT.forEach(row => {
        const tableRow = tbody.insertRow();
        row.forEach(cell => {
            const td = tableRow.insertCell();
            td.textContent = cell;
        });
    });
    
    content.appendChild(closeButton);
    content.appendChild(table);
    modal.appendChild(content);
    document.body.appendChild(modal);
  };
};

// Suscripción a los cambios de datos de Looker Studio
dscc.subscribeToData(draw, {transform: dscc.objectTransform});
