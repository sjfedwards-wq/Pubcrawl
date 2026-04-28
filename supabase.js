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
    map: p.maps_link
  }));

  renderCards();
}

document.addEventListener("DOMContentLoaded", loadPubs);
``
