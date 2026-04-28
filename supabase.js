// v2.1 - force redeploy

const SUPABASE_URL = "https://gydfaowdhubrjweulnrv.supabase.co";
const SUPABASE_KEY = "sb_publishable_TVuKKjTyZvpz40ROHPIi3g_LcNav48N";

const client = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function loadPubs() {
  const response = await client
    .from("pubs")
    .select("*")
    .order("sort_order");

  if (response.error) {
    console.error(response.error);
    return;
  }

  pubs = response.data.map(p => ({
    num: p.sort_order,
    name: p.name,
    start: p.arrival_time,
    end: p.departure_time,
    address: p.address,
    img: p.image_url,
    map: p.maps_link,
    status: p.status
  }));

  // ----- HEADER UPDATE WITH ANIMATION -----
  const current = pubs.find(p => p.status === "current");

  const currentPubEl = document.getElementById("currentPub");
  const countdownEl = document.getElementById("countdown");

  currentPubEl.classList.remove("header-animate");
  countdownEl.classList.remove("header-animate");

  void currentPubEl.offsetWidth;
  void countdownEl.offsetWidth;

  if (current) {
    currentPubEl.textContent = current.name;
    countdownEl.textContent = current.start + " – " + current.end;
  } else {
    currentPubEl.textContent = "Awaiting crawl start";
    countdownEl.textContent = "Get ready…";
  }

  currentPubEl.classList.add("header-animate");
  countdownEl.classList.add("header-animate");

  // ----- RENDER CARDS -----
  renderCards();
}

document.addEventListener("DOMContentLoaded", loadPubs);
setInterval(loadPubs, 5000)
