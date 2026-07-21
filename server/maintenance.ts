import { type Request, type Response, type NextFunction } from "express";

const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Retrocodex — Down for Maintenance</title>
<link rel="icon" type="image/png" href="/maintenance-assets/transparent-logo.png" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Text&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: #fbfbf9;
    color: #2c2c2c;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    justify-content: center;
    padding: 64px 24px;
  }
  .wrap { max-width: 760px; text-align: center; }
  .logo { width: 76px; height: 76px; margin-bottom: 28px; }
  h1 {
    font-family: 'DM Serif Text', serif;
    font-size: 2.75rem;
    line-height: 1.15;
    margin: 0 0 16px;
  }
  .subtitle {
    font-size: 1.15rem;
    color: #5a5a5a;
    margin: 0 0 48px;
  }
  .media-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 40px;
    margin-bottom: 48px;
    flex-wrap: wrap;
  }
  .card-img {
    max-width: 420px;
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 8px 0 #d8d5cc, 0 2px 10px rgba(0,0,0,0.08);
  }
  .mascot-img {
    max-width: 260px;
    width: 60%;
  }
  .donate {
    font-size: 1.15rem;
    margin: 0 0 12px;
  }
  .donate a {
    color: inherit;
    text-decoration: underline;
    font-weight: 600;
  }
  .footnote {
    font-size: 0.95rem;
    color: #8a8a8a;
    margin: 0;
  }
  @media (max-width: 600px) {
    h1 { font-size: 2rem; }
    .media-row { gap: 24px; }
  }
</style>
</head>
<body>
  <div class="wrap">
    <img class="logo" src="/maintenance-assets/transparent-logo.png" alt="Retrocodex" />
    <h1>Retrocodex is currently offline<br/>for maintenance.</h1>
    <p class="subtitle">Scrungy the squirrel is working on getting it back up!</p>
    <div class="media-row">
      <img class="card-img" src="/maintenance-assets/pluto-fact-card.png" alt="Example fact card: Pluto is a planet" />
      <img class="mascot-img" src="/maintenance-assets/scrungy-at-work.png" alt="Scrungy the squirrel working at a laptop" />
    </div>
    <p class="donate">To see more content like this, please <a href="https://buymeacoffee.com/retrocodex" target="_blank" rel="noopener noreferrer">make a donation</a> to help fund the site!</p>
    <p class="footnote">Scrungy is using very expensive tools to give your brain a system update.</p>
  </div>
</body>
</html>
`;

export function maintenanceMiddleware(req: Request, res: Response, next: NextFunction) {
  if (process.env.MAINTENANCE_MODE !== "true") return next();
  if (req.path.startsWith("/maintenance-assets")) return next();

  if (req.path.startsWith("/api")) {
    return res
      .status(503)
      .json({ message: "Retrocodex is currently offline for maintenance." });
  }

  res.status(503).set("Content-Type", "text/html").send(MAINTENANCE_HTML);
}
