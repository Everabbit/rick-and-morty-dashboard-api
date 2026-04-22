import rateLimit from "express-rate-limit";

export const apiRateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Limite de requisicoes excedido",
    details: "Tente novamente em alguns segundos",
  },
});
