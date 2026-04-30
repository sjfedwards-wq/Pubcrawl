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


// ==============================
// INSERT NEW PUB (DROPDOWN SETUP)
// ==============================

async function populateInsertAfterDropdown() {
  const { data, error } = await client
    .from("pubs")
    .select("*")
    .order("sort_order");

  if (error) {
    console.error("Error loading pubs:", error);
    return;
  }

  const select = document.getElementById("insertAfterSelect");
  if (!select) return;

  select.innerHTML = "";

  data.forEach(pub => {
    const option = document.createElement("option");
    option.value = pub.id;
    option.textContent = `${pub.sort_order}. ${pub.name}`;
    select.appendChild(option);
  });
}


// ==============================
// INSERT NEW PUB (CORE LOGIC)
// ==============================

async function insertNewPub() {
  const name = document.getElementById("newPubName").value.trim();
  const address = document.getElementById("newPubAddress").value.trim();
  const image = document.getElementById("newPubImage").value.trim();
  const map = document.getElementById("newPubMap").value.trim();
  const insertAfterId = document.getElementById("insertAfterSelect").value;

  if (!name || !address || !image || !map) {
    alert("Please fill in all fields.");
    return;
  }

  // fetch the pub we’re inserting after
  const { data: afterPub, error } = await client
    .from("pubs")
    .select("*")
    .eq("id", insertAfterId)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  const newSortOrder = afterPub.sort_order + 1;
  const newStart = afterPub.end_time;
  const newEnd = new Date(new Date(newStart).getTime() + 30 * 60000).toISOString();

  // fetch all pubs after this one that are still upcoming
  const { data: laterPubs } = await client
    .from("pubs")
    .select("*")
    .gt("sort_order", afterPub.sort_order)
    .eq("status", "upcoming")
    .order("sort_order", { ascending: false });

  // shift later pubs (reverse order avoids collisions)
  for (const pub of laterPubs) {
    const shiftedStart = new Date(new Date(pub.start_time).getTime() + 30 * 60000).toISOString();
    const shiftedEnd = new Date(new Date(pub.end_time).getTime() + 30 * 60000).toISOString();

    await client
      .from("pubs")
      .update({
        sort_order: pub.sort_order + 1,
        start_time: shiftedStart,
        end_time: shiftedEnd
      })
      .eq("id", pub.id);
  }

  // insert the new pub
  await client.from("pubs").insert({
    name,
    address,
    img: image,
    map,
    sort_order: newSortOrder,
    start_time: newStart,
    end_time: newEnd,
    status: "upcoming"
  });

  // clear form
  document.getElementById("newPubName").value = "";
  document.getElementById("newPubAddress").value = "";
  document.getElementById("newPubImage").value = "";
  document.getElementById("newPubMap").value = "";

  // reload admin UI
  loadAdminPubs();
  populateInsertAfterDropdown();

  alert("New pub added and schedule shifted by 30 minutes.");
}


document.addEventListener("DOMContentLoaded", () => {
  loadAdminPubs();
  loadParticipantsAdmin();
  loadDrinkMatrix();
});



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

// ==============================
// DRINK LOGGING
// ==============================

async function loadDrinkMatrix() {
  const { data: participants, error: pError } = await client
    .from("participants")
    .select("*")
    .order("id");

  const { data: drinks, error: dError } = await client
    .from("drinks")
    .select("*")
    .order("id");

  if (pError || dError) {
    console.error("Error loading drink matrix", pError || dError);
    return;
  }

  const container = document.getElementById("drinkMatrix");
  if (!container) return;

  container.innerHTML = "";

  participants.forEach(p => {
    let row = `<strong>${p.name}</strong><br />`;


drinks.forEach(d => {
  row += `
    <div style="display:inline-block; margin-right:12px;">
      <button onclick="addDrink(${p.id}, ${d.id}, ${d.points})">
        + ${d.label}
      </button>
      <button onclick="removeDrink(${p.id}, ${d.id}, ${d.points})">
        −
      </button>
    </div>
  `;
});


    container.innerHTML += `<div style="margin-bottom:12px;">${row}</div>`;
  });
}


async function logDrink(participantId, drinkId, points, checkbox) {
  // reset checkbox immediately
  checkbox.checked = false;

  // log the drink
  await client.from("drink_log").insert({
    participant_id: participantId,
    drink_id: drinkId
  });

  // get current total
  const { data } = await client
    .from("participants")
    .select("total_points")
    .eq("id", participantId)
    .single();

  // update total safely
  await client
    .from("participants")
    .update({ total_points: data.total_points + points })
    .eq("id", participantId);

  loadDrinkMatrix();
}

async function addDrink(participantId, drinkId, points) {
  // log the drink
  await client.from("drink_log").insert({
    participant_id: participantId,
    drink_id: drinkId
  });

  // get current total
  const { data } = await client
    .from("participants")
    .select("total_points")
    .eq("id", participantId)
    .single();

  // update total
  await client
    .from("participants")
    .update({ total_points: data.total_points + points })
    .eq("id", participantId);

  loadDrinkMatrix();
}

async function removeDrink(participantId, drinkId, points) {
  // prevent score going below zero
  const { data } = await client
    .from("participants")
    .select("total_points")
    .eq("id", participantId)
    .single();

  const newTotal = Math.max(0, data.total_points - points);

  await client
    .from("participants")
    .update({ total_points: newTotal })
    .eq("id", participantId);

  // optional: log a negative entry (comment out if you don’t want history)
  await client.from("drink_log").insert({
    participant_id: participantId,
    drink_id: drinkId
  });

  loadDrinkMatrix();
}


  
