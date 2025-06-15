const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let pos, history = [];
let velocity = [0, 0];
let m = [0, 0], v = [0, 0];
let t = 0;

function f(x, y) {
  return x * x + y * y;
}

function grad(x, y) {
  return [2 * x, 2 * y];
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.moveTo(history[0][0], history[0][1]);
  for (let p of history) {
    ctx.lineTo(p[0], p[1]);
  }
  ctx.strokeStyle = "blue";
  ctx.stroke();


  ctx.beginPath();
  ctx.arc(pos[0], pos[1], 5, 0, 2 * Math.PI);
  ctx.fillStyle = "red";
  ctx.fill();
}

function toCanvas(x, y) {
  return [200 + x * 100, 200 - y * 100];
}

function fromCanvas(x, y) {
  return [(x - 200) / 100, -(y - 200) / 100];
}

function step(optimizer) {
  t++;
  let [gx, gy] = grad(pos[0], pos[1]);

  if (optimizer === "sgd") {
    pos[0] -= 0.1 * gx;
    pos[1] -= 0.1 * gy;
  } else if (optimizer === "momentum") {
    velocity[0] = 0.9 * velocity[0] - 0.1 * gx;
    velocity[1] = 0.9 * velocity[1] - 0.1 * gy;
    pos[0] += velocity[0];
    pos[1] += velocity[1];
  } else if (optimizer === "adam") {
    let beta1 = 0.9, beta2 = 0.999, alpha = 0.1, eps = 1e-8;
    m[0] = beta1 * m[0] + (1 - beta1) * gx;
    m[1] = beta1 * m[1] + (1 - beta1) * gy;
    v[0] = beta2 * v[0] + (1 - beta2) * gx * gx;
    v[1] = beta2 * v[1] + (1 - beta2) * gy * gy;

    let mHat = [m[0] / (1 - Math.pow(beta1, t)), m[1] / (1 - Math.pow(beta1, t))];
    let vHat = [v[0] / (1 - Math.pow(beta2, t)), v[1] / (1 - Math.pow(beta2, t))];

    pos[0] -= alpha * mHat[0] / (Math.sqrt(vHat[0]) + eps);
    pos[1] -= alpha * mHat[1] / (Math.sqrt(vHat[1]) + eps);
  }

  let [cx, cy] = toCanvas(pos[0], pos[1]);
  history.push([cx, cy]);
  draw();
  document.getElementById("loss").textContent = `Loss: ${f(pos[0], pos[1]).toFixed(4)}`;
}

function start() {
  const optimizer = document.getElementById("optimizer").value;
  const steps = parseInt(document.getElementById("steps").value);

  pos = [Math.random() * 2 - 1, Math.random() * 2 - 1];
  velocity = [0, 0];
  m = [0, 0];
  v = [0, 0];
  history = [toCanvas(pos[0], pos[1])];
  t = 0;

  let i = 0;
  const interval = setInterval(() => {
    if (i >= steps) {
      clearInterval(interval);
      return;
    }
    step(optimizer);
    i++;
  }, 50);
}