import { createCanvas, loadImage } from "@napi-rs/canvas";

export default async function handler(req, res) {
  try {
    const { text = "NO TEXT", avatar } = req.query;
    if (!avatar) return res.status(400).send("avatar missing");

    const W = 820, H = 820;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Load avatar
    const img = await loadImage(avatar);

    /** Background */
    ctx.drawImage(img, 0, 0, W, H);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2 - 20;
    const r = 170;

    /** White ring */
    ctx.beginPath();
    ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    /** Circular avatar */
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
    ctx.restore();

    /** Crown */
    drawCrown(ctx, cx, cy - r - 12);

    /** Curved Text */
    drawArcText(ctx, text.toUpperCase(), cx, cy + r + 32, r + 35);

    /** Output */
    res.setHeader("Content-Type", "image/png");
    res.status(200).send(canvas.toBuffer("image/png"));

  } catch (err) {
    console.log(err);
    res.status(500).send("Canvas Error");
  }
}

function drawArcText(ctx, text, cx, cy, radius) {
  ctx.font = "bold 38px Arial";
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  
  const total = ctx.measureText(text).width;
  let angle = Math.PI / 2 - total / radius / 2;

  for (const char of text) {
    const w = ctx.measureText(char).width;
    const ang = angle + w / radius / 2;
    ctx.save();
    ctx.translate(cx + Math.cos(ang) * radius,
                  cy + Math.sin(ang) * radius);
    ctx.rotate(ang + Math.PI / 2);
    ctx.fillText(char, 0, 0);
    ctx.restore();
    angle += w / radius;
  }
}

function drawCrown(ctx, x, y) {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(x - 55, y);
  ctx.lineTo(x - 20, y - 40);
  ctx.lineTo(x, y - 5);
  ctx.lineTo(x + 20, y - 40);
  ctx.lineTo(x + 55, y);
  ctx.closePath();
  ctx.fill();
}