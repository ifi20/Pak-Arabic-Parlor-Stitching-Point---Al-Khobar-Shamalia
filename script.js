document.addEventListener("DOMContentLoaded", () => {

  /* =====================
     🔧 GLOBAL SETTINGS
  ====================== */
  const settings = {
    discountPercentage: 25,
    whatsappNumber: "966582617487",
    currency: "SAR"
  };

  /* =====================
     🎉 OFFER BANNER
  ====================== */
  const banner = document.querySelector(".banner");
  const currentMonth = new Date().toLocaleString("en-US", { month: "long" });
  if (banner) {
    banner.textContent = `✨ ${currentMonth} Glow Offer – ${settings.discountPercentage}% OFF All Services! ✨`;
  }

  /* =====================
     ⏰ LIVE CLOCK (12-Hour)
  ====================== */
  setInterval(() => {
    const clock = document.getElementById("currentDateTime");
    if (clock) {
      clock.textContent = new Date().toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
    }
  }, 1000);

  /* =====================
     📦 FETCH SERVICES
  ====================== */
  fetch("./prices.json")
    .then(res => {
      if (!res.ok) throw new Error("Failed to load prices.json");
      return res.json();
    })
    .then(data => renderServices(data))
    .catch(err => {
      console.error(err);
      const list = document.getElementById("serviceList");
      const hint = document.getElementById("jsonHint");
      if (list) {
        list.innerHTML = `
          <div class="box" style="color:red;text-align:center">
            <h3>Error Loading Services</h3>
            <p>prices.json could not be loaded.</p>
          </div>`;
      }
      if (hint) hint.style.display = "block";
    });

  /* =====================
     🧾 RENDER SERVICES
  ====================== */
  function renderServices(services) {
    const container = document.getElementById("serviceList");
    const categoryFilter = document.getElementById("categoryFilter");
    if (!container || !categoryFilter) return;

    container.innerHTML = "";
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

    const categories = {};

    services.forEach(item => {
      const cat = item.category.trim();
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(item);
    });

    Object.entries(categories).forEach(([category, items]) => {
      const section = document.createElement("section");
      section.className = "box";
      section.dataset.category = category;

      const title = document.createElement("h3");
      title.textContent = category;
      section.appendChild(title);

      items.forEach(service => {
        const discounted = Math.round(
          service.old * (1 - settings.discountPercentage / 100)
        );

        const label = document.createElement("label");
        label.className = "service";
        label.style.cursor = "pointer";

        label.innerHTML = `
          ${service.service}
          <span class="price">
            <span class="old">${service.old} ${settings.currency}</span>
            <span class="new">${discounted} ${settings.currency}</span>
            <input type="checkbox"
              value="${discounted}"
              data-name="${service.service}"
              data-category="${category}">
          </span>
        `;
        section.appendChild(label);
      });

      container.appendChild(section);

      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });

    attachInteractions();
  }

  /* =====================
     🧠 INTERACTIONS
  ====================== */
  function attachInteractions() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const totalSpan = document.getElementById("total");
    const searchInput = document.getElementById("searchInput");
    const clearSearch = document.getElementById("clearSearch");
    const categoryFilter = document.getElementById("categoryFilter");

    // Total calculation
    checkboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        const total = [...checkboxes]
          .filter(c => c.checked)
          .reduce((sum, c) => sum + Number(c.value), 0);
        if (totalSpan) totalSpan.textContent = total;
      });
    });

    // Search
    if (searchInput) {
      searchInput.addEventListener("input", e => {
        const term = e.target.value.toLowerCase();
        clearSearch.style.display = term ? "block" : "none";

        document.querySelectorAll(".service").forEach(row => {
          row.style.display = row.textContent.toLowerCase().includes(term)
            ? "flex"
            : "none";
        });
      });
    }

    if (clearSearch) {
      clearSearch.addEventListener("click", () => {
        searchInput.value = "";
        clearSearch.style.display = "none";
        document.querySelectorAll(".service").forEach(row => {
          row.style.display = "flex";
        });
      });
    }

    // Category filter
    if (categoryFilter) {
      categoryFilter.addEventListener("change", e => {
        const selected = e.target.value.toLowerCase();
        document.querySelectorAll(".box[data-category]").forEach(box => {
          const cat = box.dataset.category.toLowerCase();
          box.style.display =
            selected === "all" || cat === selected ? "block" : "none";
        });
      });
    }
  }

  /* =====================
     🔄 CLEAR BUTTON
  ====================== */
  document.getElementById("clear")?.addEventListener("click", () => {
    document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
    document.getElementById("customerName").value = "";
    document.getElementById("customerTime").value = "";
    document.getElementById("total").textContent = "0";
    document.getElementById("summaryArea").hidden = true;
    document.getElementById("summaryText").innerHTML = "No summary yet.";
  });

  /* =====================
     📍 LOCATION
  ====================== */
  document.getElementById("locationBtn")?.addEventListener("click", () => {
    window.open("https://goo.gl/maps/ttfrKNCARaquVyWb9", "_blank");
  });

  /* =====================
     🧾 SUMMARY
  ====================== */
  document.getElementById("summary")?.addEventListener("click", () => {
    const selected = [...document.querySelectorAll('input[type="checkbox"]:checked')];
    if (!selected.length) return alert("Please select at least one service.");

    const name = document.getElementById("customerName").value || "Valued Customer";
    const timeValue = document.getElementById("customerTime").value;
    const time = timeValue
      ? new Date(timeValue).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
      : "Not selected";
    const total = document.getElementById("total").textContent;

    document.getElementById("summaryText").innerHTML = `
      <p><b>Name:</b> ${name}</p>
      <p><b>Time:</b> ${time}</p>
      <ul>${selected.map(c => `<li>${c.dataset.name} - ${c.value} ${settings.currency}</li>`).join("")}</ul>
      <p><b>Total:</b> ${total} ${settings.currency}</p>
    `;
    document.getElementById("summaryArea").hidden = false;
  });

  /* =====================
     💬 WHATSAPP
  ====================== */
  document.getElementById("send")?.addEventListener("click", () => {
    const selected = [...document.querySelectorAll('input[type="checkbox"]:checked')];
    if (!selected.length) return alert("Please select services.");

    const name = document.getElementById("customerName").value || "Guest";
    const timeValue = document.getElementById("customerTime").value;
    const time = timeValue
      ? new Date(timeValue).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
      : "Not specified";
    const total = document.getElementById("total").textContent;

    let msg = `*Booking Request – Pak Arabic Parlor*\n\n`;
    msg += `👤 Name: ${name}\n🕒 Time: ${time}\n\n*Services:*\n`;
    selected.forEach(c => msg += `• ${c.dataset.name} (${c.value} ${settings.currency})\n`);
    msg += `\n💰 Total: ${total} ${settings.currency}`;

    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  });

  /* =====================
     ⬆ BACK TO TOP
  ====================== */
  const backTop = document.getElementById("backToTop");
  if (backTop) {
    window.addEventListener("scroll", () => {
      backTop.style.display = window.scrollY > 300 ? "block" : "none";
    });
    backTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

});
