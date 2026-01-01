document.addEventListener("DOMContentLoaded", () => {
  // --- 🔧 SETTINGS ---
  const settings = {
    discountPercentage: 25,
    whatsappNumber: "966582617487",
    currency: "SAR"
  };

  // --- 1. SETUP PAGE ---
  const banner = document.querySelector(".banner");
  const currentMonth = new Date().toLocaleString("en-US", { month: "long" });
  
  if (banner) {
    banner.textContent = `✨ ${currentMonth} Glow Offer – ${settings.discountPercentage}% OFF All Services! ✨`;
  }

  // --- ⏰ CLOCK FIX: 12-Hour Format ---
  // Added 'hour12: true' to ensure AM/PM display
  setInterval(() => {
    const clock = document.getElementById("currentDateTime");
    if(clock) {
      clock.textContent = new Date().toLocaleString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric", 
        hour: "numeric", minute: "2-digit", second: "2-digit",
        hour12: true  // <--- Forces 12-hour format
      });
    }
  }, 1000);

  // --- 2. FETCH & RENDER SERVICES ---
  fetch("prices.json")
    .then(response => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then(data => renderServices(data))
    .catch(error => {
      console.error("Error fetching services:", error);
      const list = document.getElementById("serviceList");
      if(list) {
        list.innerHTML = 
          `<div class="box" style="text-align:center; color:red;">
             <h3>Error Loading Services</h3>
             <p>Could not load <b>prices.json</b>. Make sure it is in the same folder.</p>
           </div>`;
      }
      const hint = document.getElementById("jsonHint");
      if(hint) hint.style.display = "block";
    });

  function renderServices(services) {
    const container = document.getElementById("serviceList");
    const categoryFilter = document.getElementById("categoryFilter");
    if(!container) return;

    const categories = {};
    services.forEach(item => {
      const cat = item.category.trim(); 
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(item);
    });

    for (const [categoryName, items] of Object.entries(categories)) {
      const section = document.createElement("section");
      section.className = "box"; 
      section.dataset.category = categoryName;

      const title = document.createElement("h3");
      title.textContent = categoryName;
      section.appendChild(title);

      items.forEach(service => {
        const newPrice = Math.round(service.old * (1 - settings.discountPercentage / 100));
        const label = document.createElement("label");
        label.className = "service";
        label.innerHTML = `
          ${service.service}
          <span class="price">
            <span class="old">${service.old} ${settings.currency}</span>
            <span class="new">${newPrice} ${settings.currency}</span>
            <input type="checkbox" 
                   value="${newPrice}" 
                   data-name="${service.service}" 
                   data-category="${categoryName}">
          </span>
        `;
        section.appendChild(label);
      });

      container.appendChild(section);

      if(categoryFilter) {
        const option = document.createElement("option");
        option.value = categoryName;
        option.textContent = categoryName;
        categoryFilter.appendChild(option);
      }
    }
    attachInteractionListeners();
  }

  // --- 3. INTERACTION LOGIC ---
  function attachInteractionListeners() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const totalSpan = document.getElementById("total");
    const searchInput = document.getElementById("searchInput");
    const clearSearchBtn = document.getElementById("clearSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    
    checkboxes.forEach(box => {
      box.addEventListener("change", () => {
        const total = Array.from(checkboxes)
          .filter(c => c.checked)
          .reduce((sum, c) => sum + Number(c.value), 0);
        if(totalSpan) totalSpan.textContent = total;
      });
    });

    if(searchInput) {
      searchInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        if(clearSearchBtn) clearSearchBtn.style.display = term ? "block" : "none";
        document.querySelectorAll(".service").forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(term) ? "flex" : "none";
        });
      });
    }

    if(clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        clearSearchBtn.style.display = "none";
        document.querySelectorAll(".service").forEach(row => row.style.display = "flex");
      });
    }

    if(categoryFilter) {
      categoryFilter.addEventListener("change", (e) => {
        const selected = e.target.value;
        document.querySelectorAll(".box[data-category]").forEach(box => {
          if (selected === "all" || box.dataset.category === selected) {
            box.style.display = "block";
          } else {
            box.style.display = "none";
          }
        });
      });
    }
  }

  // --- 4. BUTTONS ---
  const clearBtn = document.getElementById("clear");
  if(clearBtn) {
    clearBtn.addEventListener("click", () => {
      document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
      const name = document.getElementById("customerName");
      const time = document.getElementById("customerTime");
      const total = document.getElementById("total");
      const summ = document.getElementById("summaryArea");
      
      if(name) name.value = "";
      if(time) time.value = "";
      if(total) total.textContent = "0";
      if(summ) summ.hidden = true;
    });
  }

  const locBtn = document.getElementById("locationBtn");
  if(locBtn) {
    locBtn.addEventListener("click", () => {
      window.open("https://goo.gl/maps/ttfrKNCARaquVyWb9", "_blank"); 
    });
  }

  const summaryBtn = document.getElementById("summary");
  if(summaryBtn) {
    summaryBtn.addEventListener("click", () => {
      const selected = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
      if (selected.length === 0) return alert("Please select at least one service!");

      const name = document.getElementById("customerName").value || "Valued Customer";
      const time = document.getElementById("customerTime").value || "No time selected";
      const total = document.getElementById("total").textContent;
      const listHtml = selected.map(c => `<li>${c.dataset.name} - <b>${c.value} ${settings.currency}</b></li>`).join("");
      const summaryText = document.getElementById("summaryText");
      const summaryArea = document.getElementById("summaryArea");
      
      if(summaryText) {
        summaryText.innerHTML = `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Time:</strong> ${time}</p>
          <ul>${listHtml}</ul>
          <p><strong>Total:</strong> ${total} ${settings.currency}</p>
        `;
      }
      if(summaryArea) {
        summaryArea.hidden = false;
        summaryArea.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  const sendBtn = document.getElementById("send");
  if(sendBtn) {
    sendBtn.addEventListener("click", () => {
      const selected = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
      if (selected.length === 0) return alert("Please select services first.");

      const name = document.getElementById("customerName").value || "Guest";
      const time = document.getElementById("customerTime").value || "Not specified";
      const total = document.getElementById("total").textContent;

      let message = `*Booking Request - Pak Arabic Parlor*\n\n`;
      message += `👤 *Name:* ${name}\n`;
      message += `🕒 *Time:* ${time}\n\n`;
      message += `*Services Selected:* \n`;
      selected.forEach(c => {
        message += `▫️ ${c.dataset.name} (${c.value} ${settings.currency})\n`;
      });
      message += `\n💰 *Total:* ${total} ${settings.currency}`;

      const url = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    });
  }

  const backBtn = document.getElementById("backToTop");
  if(backBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) backBtn.style.display = "block";
      else backBtn.style.display = "none";
    });
    backBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

});
