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
      Status: ${pub.status || "upcoming"}<br><br>

      <button class="current" onclick="setCurrent(${pub.id})">
        Set Current
      </button>

      <button class="complete" onclick="markComplete(${pub.id})">
        Mark Completed
      </button>

      <button onclick="undoComplete(${pub.id})">
        Undo (set upcoming)
      </button>
    `;

    container.appendChild(div);
  });
}

async function setCurrent(id) {
  await client
    .from("pubs")
    .update({ status: "upcoming" })
    .eq("status", "current");

  await client
    .from("pubs")
    .update({ status: "current" })
    .eq("id", id);

  loadAdminPubs();
}

async function markComplete(id) {
  await client
    .from("pubs")
    .update({
      status: "completed",
      completed_at: new Date().toISOString()
    })
    .eq("id", id);

  loadAdminPubs();
}

async function undoComplete(id) {
  await client
    .from("pubs")
    .update({
      status: "upcoming",
      completed_at: null
    })
    .eq("id", id);

  loadAdminPubs();
}

document.addEventListener("DOMContentLoaded", loadAdminPubs);
``

// ==============================
// PARTICIPANTS ADMIN
// ==============================

async function loadParticipantsAdmin() {
  const { data, error } = await client
    .from("participants")
    .select("*")
    .order("id");

  if (error) {
    console.error("Error loading participants:", error);
    return;
  }

  const container = document.getElementById("participantsAdmin");
  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < 8; i++) {
    const p = data[i];

    container.innerHTML += `
      <div style="margin-bottom:8px;">
        <input
          type="text"
          placeholder="Participant ${i + 1}"
          value="${p ? p.name : ""}"
          onchange="saveParticipant(${p ? p.id : "null"}, this.value)"
        />
      </div>
    `;
  }
}

async function saveParticipant(id, name) {
  if (!name.trim()) return;

  if (id) {
    await client
      .from("participants")
      .update({ name })
      .eq("id", id);
  } else {
    await client
      .from("participants")
      .insert({ name });
  }

  loadParticipantsAdmin();
}
