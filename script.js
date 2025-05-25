const citasDiv = document.getElementById('citas');
const imagenesDiv = document.getElementById('imagenes');
const chequearBtn = document.getElementById('chequear');
const resultadoDiv = document.getElementById('resultado');
const svg = document.getElementById('flechas');

let citas = [];
let imagenes = [];
let mezcladoCitas = [];
let mezcladoImagenes = [];

let seleccionados = [];
let emparejamientos = [];

function mezclarArray(arr) {
  return arr
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function crearElementos() {
  citasDiv.innerHTML = '';
  imagenesDiv.innerHTML = '';
  svg.innerHTML = '';

  mezcladoCitas.forEach((obj, i) => {
    const div = document.createElement('div');
    div.classList.add('cita');
    div.textContent = obj.quote;
    div.dataset.index = i;
    div.addEventListener('click', () => seleccionar('cita', i));
    citasDiv.appendChild(div);
  });

  mezcladoImagenes.forEach((obj, i) => {
    const div = document.createElement('div');
    div.classList.add('imagen');
    div.dataset.index = i;
    const img = document.createElement('img');
    img.src = obj.image;
    img.alt = obj.character;
    div.appendChild(img);
    div.addEventListener('click', () => seleccionar('imagen', i));
    imagenesDiv.appendChild(div);
  });
}

function seleccionar(tipo, index) {
  if (seleccionados.length === 2) return;
  if (seleccionados.find(sel => sel.tipo === tipo && sel.index === index)) return;
  if (seleccionados.length === 1 && seleccionados[0].tipo === tipo) return;

  seleccionados.push({ tipo, index });
  marcarSeleccionado(tipo, index);

  if (seleccionados.length === 2) {
    const citaIdx = seleccionados.find(s => s.tipo === 'cita').index;
    const imgIdx = seleccionados.find(s => s.tipo === 'imagen').index;

    emparejamientos.push({ citaIndex: citaIdx, imagenIndex: imgIdx });

    bloquearElemento('cita', citaIdx);
    bloquearElemento('imagen', imgIdx);

    dibujarFlecha(citaIdx, imgIdx);

    seleccionados = [];
  }
}

function marcarSeleccionado(tipo, index) {
  const container = tipo === 'cita' ? citasDiv : imagenesDiv;
  const elem = container.children[index];
  elem.classList.add('seleccionado');
}

function bloquearElemento(tipo, index) {
  const container = tipo === 'cita' ? citasDiv : imagenesDiv;
  const elem = container.children[index];
  elem.style.pointerEvents = 'none';
  elem.classList.add('seleccionado');
}

function chequearEmparejamientos() {
  let correctos = 0;
  emparejamientos.forEach(pair => {
    const citaObj = mezcladoCitas[pair.citaIndex];
    const imgObj = mezcladoImagenes[pair.imagenIndex];
    const citaDiv = citasDiv.children[pair.citaIndex];
    const imgDiv = imagenesDiv.children[pair.imagenIndex];

    if (citaObj.character === imgObj.character) {
      correctos++;
      citaDiv.classList.add('correcto');
      imgDiv.classList.add('correcto');
    } else {
      citaDiv.classList.add('incorrecto');
      imgDiv.classList.add('incorrecto');
    }
  });

  resultadoDiv.textContent = `Acertaste ${correctos} de ${emparejamientos.length} pares.`;
}

function dibujarFlecha(citaIndex, imagenIndex) {
  const citaElem = citasDiv.children[citaIndex];
  const imgElem = imagenesDiv.children[imagenIndex];

  const startRect = citaElem.getBoundingClientRect();
  const endRect = imgElem.getBoundingClientRect();

  const containerRect = document.body.getBoundingClientRect();

  const x1 = startRect.right - containerRect.left;
  const y1 = startRect.top + startRect.height / 2 - containerRect.top;

  const x2 = endRect.left - containerRect.left;
  const y2 = endRect.top + endRect.height / 2 - containerRect.top;

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", "black");
  line.setAttribute("stroke-width", "2");
  line.setAttribute("marker-end", "url(#flecha)");

  svg.appendChild(line);
}

function cargarDatos() {
  fetch('https://thesimpsonsquoteapi.glitch.me/quotes?count=5')
    .then(res => res.json())
    .then(data => {
      citas = data.map(obj => ({
        quote: obj.quote,
        character: obj.character,
        image: obj.image
      }));

      mezcladoCitas = mezclarArray(citas);
      mezcladoImagenes = mezclarArray(citas);

      crearDefinicionFlecha();
      crearElementos();
      seleccionados = [];
      emparejamientos = [];
    })
    .catch(() => {
      resultadoDiv.textContent = 'Error al cargar las citas.';
    });
}

function crearDefinicionFlecha() {
  svg.innerHTML = `
    <defs>
      <marker id="flecha" markerWidth="10" markerHeight="7" refX="10" refY="3.5"
        orient="auto" markerUnits="strokeWidth">
        <polygon points="0 0, 10 3.5, 0 7" fill="black" />
      </marker>
    </defs>
  `;
}

chequearBtn.addEventListener('click', () => {
  if (emparejamientos.length === 0) {
    resultadoDiv.textContent = 'No has emparejado nada aún.';
    return;
  }
  chequearEmparejamientos();
});

cargarDatos();