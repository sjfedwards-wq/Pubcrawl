const SUPABASE_URL = "https://gydfaowdhubrjweulnrv.supabase.co/rest/v1/";
const SUPABASE_KEY = "sb_publishable_TVuKKjTyZvpz40ROHPIi3g_LcNav48N";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function loadPubs() {
  const { data, error } = await supabase
    .from("pubs")
    .select("*")
    .order("sort_order");

  if (error) {
    console.error(error);
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
}

document.addEventListener("DOMContentLoaded", loadPubs);
