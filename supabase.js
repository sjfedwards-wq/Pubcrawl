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


// Update the LIVE NOW header
const current = pubs.find(p => p.status === "current");

if (current) {
  document.getElementById("currentPub").textContent = current.name;
  document.getElementById("countdown").textContent =
    current.start + " – " + current.end;
} else {
  document.getElementById("currentPub").textContent = "Awaiting crawl start";
  document.getElementById("countdown").textContent = "Get ready…";

}
``

renderCards();
}

document.addEventListener("DOMContentLoaded", loadPubs);

// Refresh public page every 30 seconds
setInterval(loadPubs, 30000);

