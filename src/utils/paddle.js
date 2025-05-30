import { initializePaddle } from "@paddle/paddle-js";

let paddleInstance = null;

export const initPaddle = async (onEvent = () => {}) => {
  if (paddleInstance) return paddleInstance;

  try {
    const paddle = await initializePaddle({
      environment: "sandbox",
      token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
      eventCallback: onEvent,
    });
    paddleInstance = paddle;
    return paddle;
  } catch (error) {
    console.error("Failed to initialize Paddle:", error);
    throw error;
  }
};

export const getPaddleInstance = () => paddleInstance;
