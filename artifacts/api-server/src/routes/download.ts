import { Router } from "express";
import path from "path";

const downloadRouter = Router();

downloadRouter.get("/download/dashboard", (_req, res) => {
  const filePath = path.resolve(
    process.cwd(),
    "../../attached_assets/dashboard_(8)_1775185836846.html"
  );
  res.download(filePath, "dashboard_FCV_corrigido.html");
});

export default downloadRouter;
