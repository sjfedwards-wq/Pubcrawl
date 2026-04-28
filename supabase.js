const SUPABASE_URL = "YOUR_REAL_PROJECT_URL";
const SUPABASE_KEY = "YOUR_REAL_PUBLISHABLE_KEY";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function loadPubs() {
  const { data, error } = await supabaseClient
    .from("pubs")
    .select("*")
    .order("sort_order");

  if (error) {
    console.error("Supabase error:", error);
    return;
  }

  pubs = data.map(p => ({
    num: p.sort_order,
    name: p.name,
    start: p.arrival_time,
    end: p.departure_time,
    address: p.address,
    img: p.image_url,
    map: p.maps_link
  }));

  renderCards();
  liveTracker();
}

document.addEventListener("DOMContentLoaded", loadPubs);
