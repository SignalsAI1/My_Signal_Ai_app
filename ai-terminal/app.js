async function getSignal() {
  try {
    const res = await fetch("/api/signal");
    const data = await res.json();

    document.getElementById("result").innerText =
      data.signal + " (" + data.confidence + "%)";
  } catch (err) {
    document.getElementById("result").innerText =
      "ERROR: API NOT WORKING";
    console.log(err);
  }
}
