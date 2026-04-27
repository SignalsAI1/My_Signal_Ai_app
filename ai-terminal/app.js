async function getSignal() {
  const res = await fetch("/api/signal");
  const data = await res.json();

  document.getElementById("result").innerText =
    data.signal + " (" + data.confidence + "%)";
}
