let circles = [];
let shortestDistance = Infinity;
let longestDistance = 0;

let textBox;
let textBoxWidth = 115; // Anchura del cuadro de texto
let textBoxHeight = 20; // Altura del cuadro de texto
let dragging = false;
let offsetX, offsetY;

function setup() {
  let canvasWidth = 600; // Nueva anchura del lienzo
  let canvasHeight = 450; // Nueva altura del lienzo
  createCanvas(canvasWidth, canvasHeight);

  // Crear tres círculos y establecer su centro como origen
  circles.push(new Element(width * 0.2, height / 2));
  circles.push(new Element(width * 0.5, height / 2));
  circles.push(new Element(width * 0.8, height / 2));

  // Crear el cuadro de texto
  textBox = createInput();
  textBox.position(width / 2 - textBoxWidth / 2, height / 2 - textBoxHeight / 2); // Centro del canvas
  textBox.size(textBoxWidth, textBoxHeight);
  textBox.value("EFECTO TENSOR"); // Establecer el texto fijo dentro del cuadro
  textBox.attribute("readonly", true); // Hacer el cuadro de texto de solo lectura
  textBox.style("background-color", "#969696"); // Color de fondo similar a los círculos
  textBox.style("color", "#FFFFFF"); // Color de texto
  textBox.style("border", "none");
  textBox.style("border-radius", "5px");
  textBox.mousePressed(startDragging);
  textBox.mouseReleased(stopDragging);
  
  // Crear el texto negro en la esquina inferior derecha
  let customText = createDiv("Selecciona una órbita...");
  customText.position(width - 120, height - 30);
  customText.style("color", "#000000"); // Color de texto negro
  customText.style("font-size", "12px"); // Tamaño de fuente pequeño
}

function draw() {
  background(220);

  // Mover los elementos y dibujar la línea entre los centros de los círculos
  for (let circle of circles) {
    if (!circle.popped) {
      circle.move();
    } else {
      // Si el círculo está estallado, verificar si ha pasado suficiente tiempo para reaparecer
      let elapsedTime = millis() - circle.popStartTime;
      if (elapsedTime >= circle.appearDuration) {
        circle.reappear(); // Llamar al método reappear en el círculo
      }
    }
  }

  // Verificar colisiones entre el cuadro de texto y los círculos
  for (let circle of circles) {
    if (!circle.popped && dragging) {
      let d = dist(
        textBox.position().x + textBoxWidth / 2,
        textBox.position().y + textBoxHeight / 2,
        circle.x,
        circle.y
      );
      if (d < circle.radius + 0.5 * min(textBoxWidth, textBoxHeight)) {
        circle.speedX *= -1;
        circle.speedY *= -1;
      }
    }
  }

  // Calcular y dibujar la línea entre los centros de los círculos
  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      let d = dist(circles[i].x, circles[i].y, circles[j].x, circles[j].y);
      if (d < shortestDistance) {
        shortestDistance = d;
      }
      if (d > longestDistance) {
        longestDistance = d;
      }
      stroke(
        lerpColor(color(0), color(255), map(d, shortestDistance, longestDistance, 0, 1))
      );
      line(circles[i].x, circles[i].y, circles[j].x, circles[j].y);
    }
  }

  // Dibujar el cuadro de texto
  if (dragging) {
    fill(150);
    rect(textBox.position().x, textBox.position().y, textBoxWidth, textBoxHeight);
  }

  // Dibujar círculos después de las líneas para que estén en primer plano
  for (let circle of circles) {
    circle.display();
  }

  // Actualizar la posición del cuadro de texto si se está arrastrando
  if (dragging) {
    textBox.position(mouseX - offsetX, mouseY - offsetY);
  }
}

class Element {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 50;
    this.originalRadius = this.radius;
    this.speedX = random(1, 3);
    this.speedY = random(1, 3);
    this.popped = false;
    this.popStartTime = 0;
    this.popDuration = 300; // Duración de la explosión
    this.appearDuration = 5000; // Duración de la reaparición
  }

  move() {
    if (!this.popped) {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x > width - this.radius || this.x < this.radius) {
        this.speedX *= -1;
      }
      if (this.y > height - this.radius || this.y < this.radius) {
        this.speedY *= -1;
      }
    }
  }

  pop() {
    this.popped = true;
    this.radius += 10; // Agrandar el círculo al explotar
    this.popStartTime = millis();
  }

  reappear() {
    this.popped = false;
    this.radius = this.originalRadius; // Restaurar el tamaño original
  }

  display() {
    if (this.popped) {
      let elapsedTime = millis() - this.popStartTime;

      if (elapsedTime < this.popDuration) {
        let popFactor = map(elapsedTime, 0, this.popDuration, 1, 1.2);
        let currentRadius = this.radius * popFactor;
        fill(150);
        ellipse(this.x, this.y, currentRadius * 2);
      }
    } else {
      fill(150);
      ellipse(this.x, this.y, this.radius * 2);
    }
  }
}

function mousePressed() {
  for (let circle of circles) {
    let d = dist(mouseX, mouseY, circle.x, circle.y);
    if (d < circle.radius) {
      circle.pop(); // Llamar al método pop en el círculo
    }
  }
}

function startDragging() {
  dragging = true;
  offsetX = mouseX - textBox.position().x;
  offsetY = mouseY - textBox.position().y;
}

function stopDragging() {
  dragging = false;
}
