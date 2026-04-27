export default function handler(req, res) {
  const signal = Math.random() > 0.5 ? "BUY" : "SELL";

  res.status(200).json({
    signal,
    confidence: Math.floor(Math.random() * 30 + 70)
  });
}
