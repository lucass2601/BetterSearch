document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const filtersList = document.getElementById("filters-list");
  const filterCount = document.getElementById("filter-count");
  const queryDisplay = document.getElementById("query-display");
  const queryPreview = document.getElementById("query-preview");
  const copyButton = document.getElementById("copy-button");
  const searchButton = document.getElementById("search-button");
  const addFilterBtn = document.getElementById("add-filter-btn");
  const dropdownMenu = document.getElementById("dropdown-menu");
  const filterBlock = document.getElementById("filter-block");
  const filterBlockTitle = document.getElementById("filter-block-title");
  const filterInputs = document.getElementById("filter-inputs");
  const cancelFilter = document.getElementById("cancel-filter");

  let filters = [];
  let currentFilterType = null;

  const filterLabels = {
    site: "Site",
    filetype: "Type",
    exclude: "Exclude",
    exact: "Exact",
    or: "OR",
    and: "AND",
    intitle: "Title",
    inurl: "URL",
    intext: "Text",
    related: "Related",
    cache: "Cache",
  };

  const filterTemplates = {
    site: {
      title: "Search within site",
      inputs: [{ placeholder: "e.g., wikipedia.org", id: "value" }],
      help: "Find results only from this website",
    },
    filetype: {
      title: "File type",
      inputs: [{ placeholder: "e.g., pdf, docx, xlsx", id: "value" }],
      help: "Search for specific file types",
    },
    exclude: {
      title: "Exclude terms",
      inputs: [{ placeholder: "Terms to exclude", id: "value" }],
      help: "Exclude results containing these terms",
    },
    exact: {
      title: "Exact match",
      inputs: [{ placeholder: "Exact phrase", id: "value" }],
      help: "Search for the exact phrase",
    },
    or: {
      title: "OR terms",
      inputs: [
        { placeholder: "First term", id: "term1" },
        { placeholder: "Second term", id: "term2" },
      ],
      help: "Find pages with either term",
    },
    and: {
      title: "AND terms",
      inputs: [
        { placeholder: "First term", id: "term1" },
        { placeholder: "Second term", id: "term2" },
      ],
      help: "Find pages with both terms",
    },
    intitle: {
      title: "In title",
      inputs: [{ placeholder: "Words in title", id: "value" }],
      help: "Search for words in page title",
    },
    inurl: {
      title: "In URL",
      inputs: [{ placeholder: "Words in URL", id: "value" }],
      help: "Search for words in the URL",
    },
    intext: {
      title: "In text",
      inputs: [{ placeholder: "Words in page text", id: "value" }],
      help: "Search for words in page content",
    },
    related: {
      title: "Related sites",
      inputs: [{ placeholder: "e.g., example.com", id: "value" }],
      help: "Find sites similar to this one",
    },
    cache: {
      title: "Cached version",
      inputs: [{ placeholder: "URL to view cached", id: "value" }],
      help: "View Google's cached version of a page",
    },
  };

  addFilterBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = dropdownMenu.classList.contains("show");
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  function openDropdown() {
    dropdownMenu.classList.add("show");
  }

  function closeDropdown() {
    dropdownMenu.classList.remove("show");
  }

  document.querySelectorAll(".dropdown-item").forEach((item) => {
    item.addEventListener("click", () => {
      const filterType = item.dataset.filter;
      showFilterBlock(filterType);
      closeDropdown();
    });
  });

  function showFilterBlock(type) {
    currentFilterType = type;
    const template = filterTemplates[type];

    filterBlockTitle.textContent = template.title;
    filterInputs.innerHTML = "";

    const inputsWrapper = document.createElement("div");
    inputsWrapper.className = "filter-inputs-wrapper";
    filterInputs.appendChild(inputsWrapper);

    template.inputs.forEach((input) => {
      const inputEl = document.createElement("input");
      inputEl.type = "text";
      inputEl.className = "input-small";
      inputEl.placeholder = input.placeholder;
      inputEl.id = `filter-${input.id}`;
      inputsWrapper.appendChild(inputEl);
    });

    // Add help text
    const helpText = document.createElement("div");
    helpText.className = "help-text";
    helpText.textContent = template.help;
    filterInputs.appendChild(helpText);

    // Add button
    const addBtn = document.createElement("button");
    addBtn.className = "add-btn";
    addBtn.textContent = "Add Filter";
    addBtn.addEventListener("click", addCurrentFilter);
    filterInputs.appendChild(addBtn);

    filterBlock.classList.remove("hidden");
    queryPreview.classList.add("hidden");

    // Focus first input
    setTimeout(() => {
      document.querySelector(".input-small")?.focus();
    }, 100);
  }

  function addCurrentFilter() {
    if (!currentFilterType) return;

    const template = filterTemplates[currentFilterType];
    const values = {};
    let hasValue = false;

    template.inputs.forEach((input) => {
      const el = document.getElementById(`filter-${input.id}`);
      if (el && el.value.trim()) {
        values[input.id] = el.value.trim();
        hasValue = true;
      }
    });

    if (hasValue) {
      filters.push({
        type: currentFilterType,
        values: values,
      });
      renderFilters();
      updateQuery();
      hideFilterBlock();
    }
  }

  function hideFilterBlock() {
    filterBlock.classList.add("hidden");
    queryPreview.classList.remove("hidden");
    currentFilterType = null;
  }

  cancelFilter.addEventListener("click", hideFilterBlock);

  function updateQuery() {
    const baseQuery = searchInput.value.trim();
    let query = baseQuery;

    filters.forEach((filter) => {
      const { type, values } = filter;

      switch (type) {
        case "site":
        case "filetype":
        case "intitle":
        case "inurl":
        case "intext":
        case "related":
        case "cache":
          if (values.value) query += ` ${type}:${values.value}`;
          break;
        case "exclude":
          if (values.value) query += ` -${values.value}`;
          break;
        case "exact":
          if (values.value) query += ` "${values.value}"`;
          break;
        case "or":
          if (values.term1 && values.term2) {
            query += ` (${values.term1} OR ${values.term2})`;
          }
          break;
        case "and":
          if (values.term1 && values.term2) {
            query += ` (${values.term1} AND ${values.term2})`;
          }
          break;
      }
    });

    if (query.trim()) {
      queryDisplay.innerHTML = highlightQuery(query);
      queryDisplay.classList.remove("empty");
    } else {
      queryDisplay.textContent = "Your search will appear here...";
      queryDisplay.classList.add("empty");
    }
  }

  function highlightQuery(query) {
    return query
      .replace(
        /(site:|filetype:|intitle:|inurl:|intext:|related:|cache:)/g,
        "<span class='operator'>$1</span>"
      )
      .replace(/("([^"]+)")/g, '<span class="value">$1</span>');
  }

  function renderFilters() {
    filtersList.innerHTML = "";
    filterCount.textContent = filters.length;

    filters.forEach((filter, index) => {
      const badge = document.createElement("div");
      badge.className = "filter-badge";

      let displayValue = "";
      if (filter.values.value) {
        displayValue = filter.values.value;
      } else if (filter.values.term1 && filter.values.term2) {
        if (filter.type === "or") {
          displayValue = `${filter.values.term1} OR ${filter.values.term2}`;
        } else if (filter.type === "and") {
          displayValue = `${filter.values.term1} AND ${filter.values.term2}`;
        }
      }

      badge.innerHTML = `
            <span class="filter-type">${filterLabels[filter.type]}:</span>
            <span>${displayValue}</span>
            <button class="remove-filter" data-index="${index}">×</button>
          `;
      filtersList.appendChild(badge);
    });

    document.querySelectorAll(".remove-filter").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index);
        filters.splice(index, 1);
        renderFilters();
        updateQuery();
      });
    });
  }

  searchInput.addEventListener("input", updateQuery);

  copyButton.addEventListener("click", async () => {
    const query = queryDisplay.textContent;
    if (query && !queryDisplay.classList.contains("empty")) {
      try {
        await navigator.clipboard.writeText(query);
        copyButton.textContent = "✓ Copied!";
        setTimeout(() => {
          copyButton.textContent = "📋 Copy";
        }, 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  });

  searchButton.addEventListener("click", () => {
    const query = queryDisplay.textContent;
    if (query && !queryDisplay.classList.contains("empty")) {
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
        query
      )}`;
      window.open(googleUrl, "_blank");
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
      closeDropdown();
    }
  });

  // Support Enter key in filter inputs
  document.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && e.target.classList.contains("input-small")) {
      const addBtn = filterInputs.querySelector(".add-btn");
      if (addBtn) addBtn.click();
    }
  });
});
