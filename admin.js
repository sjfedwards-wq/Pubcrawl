
const SUPABASE_URL = "https://gydfaowdhubrjweulnrv.supabase.co";
const SUPABASE_KEY = "sb_publishable_TVuKKjTyZvpz40ROHPIi3g_LcNav48N";

const client = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function loadAdminPubs() {
  const { data, error } = await client
    .from("pubs")
    .select("*")
    .order("sort_order");

  if (error) {
    console.error(error);
    return;
  }

  const container = document.getElementById("adminList");
  container.innerHTML = "";

  data.forEach(pub => {
    const div = document.createElement("div");
    div.className = "pub";

    div.innerHTML = `
      <strong>${pub.sort_order}. ${pub.name}</strong><br>
      Status: ${pub.status || "upcoming"}<br>

      <button class="current" onclick="setCurrent(${pub.id})">
        Set Current
      </button>

      <button class="complete" onclick="markComplete(${pub.id})">
        Mark Completed
      </button>
    `;

    container.appendChild(div);
  });
}

async function setCurrent(id) {
  await client.from("pubs").update({ status: "upcoming" }).eq("status", "current");
  await client.from("pubs").update({ status: "current" }).eq("id", id);
  loadAdminPubs();
}

async function markComplete(id) {
  await client.from("pubs").update({
    status: "completed",
    completed_at: new Date().toISOString()
  }).eq("id", id);

  loadAdminPubs();
}

document.addEventListener("DOMContentLoaded", loadAdminPubs);
``
