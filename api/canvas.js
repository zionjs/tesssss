import { createCanvas, loadImage } from "@napi-rs/canvas";
import path from "path";

export default async function handler(req, res) {
  try {
    const { text = "NO NAME", avatar } = req.query;
    if (!avatar) return res.status(400).send("Missing avatar parameter");

    const W = 1080;
    const H = 1080;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    const bg = await loadImage(path.resolve("./public/background.jpg"));
    const crown = await loadImage(path.resolve("./public/crown.png"));
    const userImg = await loadImage(avatar);

    /** Draw fixed background */
    ctx.drawImage(bg, 0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2 + 40;
    const r = 260;

    /** Avatar circle ring */
    ctx.beginPath();
    ctx.arc(cx, cy, r + 18, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    /** Avatar circle */
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(userImg, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();

    /** Crown fixed */
    ctx.drawImage(crown, cx - 220, cy - r - 260, 440, 240);

    /** Curved text */
    drawArcText(ctx, text.toUpperCase(), cx, cy + r + 30, r + 50);

    res.setHeader("Content-Type", "image/png");
    res.status(200).send(canvas.toBuffer("image/png"));

  } catch (e) {
    console.error(e);
    res.status(500).send("Canvas Rendering Error");
  }
}

function drawArcText(ctx, text, cx, cy, radius) {
  ctx.font = "bold 70px Arial";
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";

  const totalWidth = ctx.measureText(text).width;
  let angle = Math.PI / 2 - totalWidth / radius / 2;

  for (const ch of text) {
    const w = ctx.measureText(ch).width;
    const a = angle + w / radius / 2;
    ctx.save();
    ctx.translate(cx + radius * Math.cos(a),
                  cy + radius * Math.sin(a));
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    angle += w / radius;
  }
}
