// app/server.js
import express from "express";
import client from "prom-client";
import compression from "compression";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(compression());

// --- Configuración de Prometheus ---
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duración de solicitudes HTTP en segundos",
  labelNames: ["route", "method", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2],
});
register.registerMetric(httpRequestDuration);

// --- Endpoint principal de prueba ---
app.get("/api/data", async (req, res) => {
  const end = httpRequestDuration.startTimer({
    route: "/api/data",
    method: req.method,
  });

  // Simula un pequeño retardo para monitoreo
  await new Promise((r) => setTimeout(r, Math.random() * 200));
  end({ status_code: 200 });

  res.json({
    status: "success",
    message: "Datos del proyecto procesados correctamente",
  });
});

// --- Endpoint de salud ---
app.get("/health", (req, res) => res.status(200).send("OK"));

// --- Endpoint de métricas ---
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(port, () =>
  console.log(`🚀 Servidor ejecutándose en http://localhost:${port}`)
);
