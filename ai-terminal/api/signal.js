export default function handler(req, res) {
  res.status(200).json({
    signal: "BUY",
    confidence: 85,
    test: "API WORKS"
  });
}
