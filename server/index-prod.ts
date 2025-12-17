import fs from "node:fs";
import path from "node:path";
import { type Server } from "node:http";

import express, { type Express } from "express";
import runApp from "./app";
import { getMetaTagsForUrl, injectMetaTags } from "./metaTags";

export async function serveStatic(app: Express, _server: Server) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  // Inject dynamic meta tags based on URL for SEO and social sharing
  app.use("*", async (req, res) => {
    try {
      const url = req.originalUrl;
      let html = await fs.promises.readFile(path.resolve(distPath, "index.html"), "utf-8");
      
      // Inject dynamic meta tags based on URL
      const metaData = await getMetaTagsForUrl(url);
      html = injectMetaTags(html, metaData);
      
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (error) {
      console.error("Error serving page:", error);
      res.sendFile(path.resolve(distPath, "index.html"));
    }
  });
}

(async () => {
  await runApp(serveStatic);
})();
