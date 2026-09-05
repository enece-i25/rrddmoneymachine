import { Router } from "express";

const webhooksRouter = Router();

webhooksRouter.post("/mercadopago", (req, res) => {
  const providedSignature = req.headers["x-signature"];
  if (!providedSignature) {
    res.status(401).json({ message: "Missing signature" });
    return;
  }

  res.status(202).json({ accepted: true });
});

export { webhooksRouter };
