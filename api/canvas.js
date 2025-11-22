import fetch from "node-fetch";
import { createCanvas, loadImage } from "canvas";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function handler(req, res) {
  try {
    const { text = "KASA NOT DEV", avatar } = req.query;

    const canvas = createCanvas(800, 800);
    const ctx = canvas.getContext("2d");

    // Load background from assets folder
    const backgroundPath = path.join(__dirname, "../assets/background.jpg");
    const bg = await loadImage(backgroundPath);

    ctx.drawImage(bg, 0, 0, 800, 800);

    // Dark overlay
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, 800, 800);

    // Load avatar (from URL or fallback)
    let avatarImg;
    if (avatar) {
      avatarImg = await loadImage(avatar);
    } else {
      avatarImg = await loadImage(
        "https://i.ibb.co/Y2bgbkg/default-avatar.png"
      );
    }

    const cx = 400;
    const cy = 360;
    const radius = 180;

    // White circle frame
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 10, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    // Avatar clipped circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(
      avatarImg,
      cx - radius,
      cy - radius,
      radius * 2,
      radius * 2
    );
    ctx.restore();

    // Load crown icon
    const crownPath = path.join(__dirname, "../assets/crown.png");
    const crown = await loadImage(crownPath);
    ctx.drawImage(crown, cx + 70, cy - radius - 100, 200, 140);

    // Draw name text
    ctx.font = "bold 48px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 8;
    ctx.strokeText(text.toUpperCase(), cx, cy + radius + 55);
    ctx.fillText(text.toUpperCase(), cx, cy + radius + 55);

    res.setHeader("Content-Type", "image/png");
    return canvas.pngStream().pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).send("Canvas Rendering Error");
  }
}