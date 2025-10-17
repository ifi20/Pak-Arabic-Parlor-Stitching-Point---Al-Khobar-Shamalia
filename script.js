/* 🌸 Pak Arabic Parlor – Dynamic App (Discount, Summary, WhatsApp) */

// Wrap everything to ensure DOM is ready (fixes early-binding issues)
document.addEventListener("DOMContentLoaded", () => {
  // 🔧 EDIT THESE MONTHLY
  const salonInfo = {
    phone: "966582617487",
    offerMonth: new Date().toLocaleString("en-US", { month: "long" }),
    offerName: "Glow Offer",
    discount: 10 // % off
  };

  // Banner text
  document.querySelector(".banner").textContent =
    `✨ ${salonInfo.offerMonth} ${salonInfo.offerName} – ${salonInfo.discount}% OFF All Services! ✨`;

  // Elements
  const totalDisplay = document.getElementById("total");
  const sendBtn = document.getElementById("send");
  const clearBtn = document.getElementById("clear");
  const nameInput = document.getElementById("customerName");
  const timeInput = document.getElementById("customerTime");
  const searchInput = document.getElementById("searchInput");
  const clearSearch = document.getElementById("clearSearch");
  const categoryFilter = document.getElementById("categoryFilter");
  const backToTop = document.getElementById("backToTop");
  const serviceContainer = document.getElementById("serviceList");
  const summaryBtn = document.getElementById("summary");
  const summaryArea = document.getElementById("summaryArea");
  const summaryText = document.getElementById("summaryText");
  const jsonHint = document.getElementById("jsonHint");

  // ⏰ Live clock (display only)
  const dateTimeDisplay = document.getElementById("currentDateTime");
  function updateDateTime() {
    const now = new Date();
    dateTimeDisplay.textContent = now.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }
  setInterval(updateDateTime, 1000);
  updateDateTime();

  // 📍 Location button (your exact link)
  const locationBtn = document.getElementById("locationBtn");
  locationBtn.addEventListener("click", () => {
    window.open("https://goo.gl/maps/ttfrKNCARaquVyWb9", "_blank");
  });

  // Load prices from JSON (with helpful hint if CORS blocks file://)
  fetch("prices.json")
    .then(res => res.json())
    .then(data => buildServices(data))
    .catch(err => {
      console.error("Error loading JSON:", err);
      serviceContainer.innerHTML = `
        <section class="box">
          <h3>Services</h3>
          <p>Could not load services from <code>prices.json</code>.</p>
        </section>`;
      jsonHint.style.display = "block"; // show local-server hint
    });

  function buildServices(data) {
    const categories = {};
    const rate = salonInfo.discount / 100;

    data.forEach(item => {
      const cat = item.category.trim();
      if (!categories[cat]) categories[cat] = [];
      const newPrice = Math.round(item.old * (1 - rate));
      categories[cat].push({ ...item, new: newPrice });
    });

    // Build each category section
    Object.keys(categories).forEach(cat => {
      const section = document.createElement("section");
      section.className = "box";
      section.dataset.category = cat.toLowerCase();
      section.innerHTML = `
        <h3>${cat}</h3>
        ${categories[cat].map(s => `
          <label class="service">${s.service}
            <span class="price">
              <span class="old">${s.old} SAR</span>
              <span class="new">${s.new} SAR</span>
              <input type="checkbox" value="${s.new}" data-name="${s.service}">
            </span>
          </label>
        `).join("")}
      `;
      serviceContainer.appendChild(section);

      // Add category to dropdown if not added yet
      if (![...categoryFilter.options].some(o => o.text === cat)) {
        const opt = document.createElement("option");
        opt.value = cat.toLowerCase();
        opt.text = cat;
        categoryFilter.add(opt);
      }
    });

    attachListeners();
  }

  function attachListeners() {
    document.querySelectorAll('input[type="checkbox"]').forEach(cb =>
      cb.addEventListener("change", updateTotal)
    );

    // Search
    searchInput.addEventListener("input", () => {
      const term = searchInput.value.trim().toLowerCase();
      document.querySelectorAll(".service").forEach(s => {
        s.style.display = s.textContent.toLowerCase().includes(term) ? "flex" : "none";
      });
      clearSearch.style.display = term ? "block" : "none";
    });

    clearSearch.addEventListener("click", () => {
      searchInput.value = "";
      clearSearch.style.display = "none";
      document.querySelectorAll(".service").forEach(s => (s.style.display = "flex"));
    });

    // Category filter
    categoryFilter.addEventListener("change", e => {
      const selected = e.target.value; // 'all' or category value
      document.querySelectorAll("section.box[data-category]").forEach(sec => {
        sec.style.display = selected === "all" || sec.dataset.category === selected ? "block" : "none";
      });
      // (Nice UX) reset search when changing category
      searchInput.value = "";
      clearSearch.style.display = "none";
      document.querySelectorAll(".service").forEach(s => (s.style.display = "flex"));
    });

    // Clear all selections
    clearBtn.addEventListener("click", () => {
      document.querySelectorAll('input[type="checkbox"]').forEach(c => (c.checked = false));
      nameInput.value = "";
      timeInput.value = "";
      updateTotal();
      summaryArea.hidden = true;
      summaryText.innerHTML = "No summary yet.";
    });

    // 🧾 On-page Summary
    summaryBtn.addEventListener("click", () => {
      const checked = [...document.querySelectorAll('input[type="checkbox"]:checked')];
      if (!checked.length) { alert("Please select at least one service."); return; }

      const selected = checked.map(c => `${c.dataset.name} (${Number(c.value).toFixed(0)} SAR)`).join("<br>");
      const customer = (nameInput.value || "Customer").trim();
      const apptTime = timeInput.value ? new Date(timeInput.value).toLocaleString() : "Not selected";
      const total = totalDisplay.textContent;

      summaryText.innerHTML = `
        <p><b>Name:</b> ${customer}</p>
        <p><b>Appointment:</b> ${apptTime}</p>
        <p><b>Selected Services:</b><br>${selected}</p>
        <p><b>Total:</b> ${total} SAR</p>
      `;
      summaryArea.hidden = false;
      summaryArea.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    // 💬 WhatsApp send
    sendBtn.addEventListener("click", () => {
      const checked = [...document.querySelectorAll('input[type="checkbox"]:checked')];
      if (!checked.length) { alert("Please select at least one service."); return; }

      const selected = checked.map(c => `- ${c.dataset.name} (${Number(c.value).toFixed(0)} SAR)`).join("\n");
      const customer = (nameInput.value || "Customer").trim();
      const apptTime = timeInput.value ? new Date(timeInput.value).toLocaleString() : "Not selected";
      const total = totalDisplay.textContent;

      const plain =
`*Pak Arabic Parlor Booking*

👩 Name: ${customer}
🕒 Appointment: ${apptTime}

*Selected Services:*
${selected}

💰 *Total:* ${total} SAR
📍 Al Khobar Shamalia
⏰ 12:00 PM – 12:00 AM`;

      const encoded = encodeURIComponent(plain);
      const base = /Android|iPhone|iPad/i.test(navigator.userAgent)
        ? `https://wa.me/${salonInfo.phone}?text=`
        : `https://web.whatsapp.com/send?phone=${salonInfo.phone}&text=`;

      const url = base + encoded;
      if (url.length > 2000) {
        alert("Message is too long for WhatsApp. Please select fewer services.");
        return;
      }
      window.open(url, "_blank", "noopener");
    });

    // Back to top
    window.addEventListener("scroll", () => {
      backToTop.style.display = window.scrollY > 250 ? "block" : "none";
    });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // Total calculation
  function updateTotal() {
    let total = 0;
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      if (cb.checked) total += Number(cb.value);
    });
    totalDisplay.textContent = total.toFixed(0);
  }
});
