console.log("APP LOADED");

async function getSignal() {
  console.log("BUTTON CLICK");

  const res = await fetch("/api/signal");
  const data = await res.json();

  document.body.innerHTML +=
    "<h2>" + data.signal + " " + data.confidence + "%</h2>";
}
