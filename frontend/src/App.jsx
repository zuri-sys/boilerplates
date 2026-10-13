import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Truck,
  Settings,
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  SlidersHorizontal,
  MoreHorizontal,
  Bell,
  HelpCircle,
  X,
  Check,
  Boxes,
  Leaf,
  Archive,
  Menu,
  RefreshCw,
} from "lucide-react";
import { seed, status, money, read, persist, unitPrice } from "./data";
import ProductArt from "./components/ProductArt";
import Metric from "./components/Metric";
export default function App() {
  const [products, setProducts] = useState(() =>
      read("stockroom.products", seed),
    ),
    [movements, setMovements] = useState(() => read("stockroom.movements", [])),
    [page, setPage] = useState("Overview"),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All products"),
    [category, setCategory] = useState("All categories"),
    [warehouse, setWarehouse] = useState("All warehouses"),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState(""),
    [menu, setMenu] = useState(false),
    [api, setApi] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notifications, setNotifications] = useState(false),
    [mobile, setMobile] = useState(
      () => window.matchMedia("(max-width: 700px)").matches,
    );
  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const update = () => setMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    fetch("/api/products", { headers: { Accept: "application/json" } })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          setApi(true);
          fetch("/api/stock-movements")
            .then((r) => r.json())
            .then(setMovements)
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    persist("stockroom.products", products);
  }, [products]);
  useEffect(() => {
    persist("stockroom.movements", movements);
  }, [movements]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const opener = useRef(null);
  useEffect(() => {
    if (modal) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
        opener.current?.focus();
      };
    }
  }, [modal]);
  const low = products.filter((p) => p.stock <= p.reorder_level),
    value = products.reduce((a, p) => a + p.stock * p.price, 0),
    units = products.reduce((a, p) => a + p.stock, 0);
  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (p.name + " " + p.sku).toLowerCase().includes(query.toLowerCase()) &&
          (filter === "All products" || status(p) === filter) &&
          (category === "All categories" || p.category === category) &&
          (warehouse === "All warehouses" || p.location === warehouse),
      ),
    [products, query, filter, category, warehouse],
  );
  const notify = (t) => setToast(t);
  async function save(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const form = Object.fromEntries(new FormData(e.currentTarget));
    for (const k of ["stock", "price", "reorder_level"])
      form[k] = Number(form[k]);
    try {
      if (modal.type === "adjust") {
        const quantity = Number(form.quantity),
          p = modal.product;
        if (
          !Number.isInteger(quantity) ||
          quantity === 0 ||
          p.stock + quantity < 0
        )
          throw Error(
            "Enter a nonzero whole number that keeps stock at zero or above.",
          );
        let movement;
        if (api) {
          const r = await fetch("/api/stock-movements", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              product_id: p.id,
              quantity,
              note: form.note,
            }),
          });
          const d = await r.json();
          if (!r.ok) throw Error(d.message || "Could not adjust stock.");
          setProducts((ps) => ps.map((x) => (x.id === p.id ? d.product : x)));
          movement = d.movement;
        } else {
          setProducts((ps) =>
            ps.map((x) =>
              x.id === p.id ? { ...x, stock: x.stock + quantity } : x,
            ),
          );
          movement = {
            id: Date.now(),
            product_name: p.name,
            quantity,
            note: form.note,
            created_at: new Date().toISOString(),
          };
        }
        setMovements((ms) => [movement, ...ms]);
        notify("Stock adjusted");
      } else {
        let p = {
          ...form,
          tone: modal.product?.tone || "sage",
          icon: modal.product?.icon || "basket",
        };
        if (api) {
          const r = await fetch(
            "/api/products" + (modal.product ? "/" + modal.product.id : ""),
            {
              method: modal.product ? "PUT" : "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(p),
            },
          );
          const d = await r.json();
          if (!r.ok) throw Error(d.message || "Could not save product.");
          p = d;
        } else {
          if (
            products.some((x) => x.sku === p.sku && x.id !== modal.product?.id)
          )
            throw Error("This SKU is already in use. Choose a unique SKU.");
          p.id = modal.product?.id || Date.now();
          const delta = p.stock - (modal.product?.stock || 0);
          if (delta !== 0)
            setMovements((ms) => [
              {
                id: Date.now(),
                product_name: p.name,
                quantity: delta,
                note: modal.product
                  ? "Stock updated in product editor"
                  : "Opening stock",
                created_at: new Date().toISOString(),
              },
              ...ms,
            ]);
        }
        if (api) {
          const r = await fetch("/api/stock-movements");
          if (r.ok) setMovements(await r.json());
        }
        setProducts((ps) =>
          modal.product ? ps.map((x) => (x.id === p.id ? p : x)) : [p, ...ps],
        );
        notify(modal.product ? "Product updated" : "Product added");
      }
      setModal(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  function exportCsv() {
    const rows = [
      ["Name", "SKU", "Category", "Stock", "Price", "Location"],
      ...filtered.map((p) => [
        p.name,
        p.sku,
        p.category,
        p.stock,
        p.price,
        p.location,
      ]),
    ];
    const blob = new Blob(
      [
        "\uFEFF" +
          rows
            .map((r) =>
              r
                .map(
                  (v) =>
                    '"' +
                    String(v)
                      .replace(/"/g, '""')
                      .replace(/^[=+@-]/, "'$&") +
                    '"',
                )
                .join(","),
            )
            .join("\r\n"),
      ],
      { type: "text/csv;charset=utf-8;" },
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "stockroom-inventory.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify("Inventory exported");
  }
  const open = (type, product) => {
    opener.current = document.activeElement;
    setError("");
    setModal({ type, product });
  };
  return (
    <div className="app">
      <aside
        inert={Boolean(modal) || (mobile && !menu)}
        className={`sidebar ${menu ? "open" : ""}`}
      >
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage("Overview");
          }}
        >
          <span className="brand-symbol">
            <Boxes size={24} />
          </span>
          stockroom<span className="brand-dot">.</span>
        </a>
        <button className="workspace" onClick={() => open("workspace")}>
          <span className="workspace-icon">F</span>
          <span>
            Forma Studio<small>Inventory workspace</small>
          </span>
          <ChevronDown size={15} />
        </button>
        <div className="nav-caption">Workspace</div>
        <nav>
          {[
            [LayoutDashboard, "Overview"],
            [Package, "Inventory"],
            [ArrowLeftRight, "Stock movements"],
            [Truck, "Suppliers"],
          ].map(([Icon, label]) => (
            <button
              key={label}
              className={page === label ? "nav-item active" : "nav-item"}
              onClick={() => {
                setPage(label);
                setMenu(false);
              }}
            >
              <Icon size={19} />
              {label}
              {label === "Inventory" && (
                <span className="nav-count">{products.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade">
            <span className="upgrade-icon">
              <Leaf size={20} />
            </span>
            <strong>A little more organized.</strong>
            <p>A lot more room to grow.</p>
            <button onClick={() => open("help")}>
              Explore your workspace <ArrowUpRight size={15} />
            </button>
          </div>
          <button
            className="nav-item"
            onClick={() => {
              setPage("Settings");
              setMenu(false);
            }}
          >
            <Settings size={19} />
            Settings
          </button>
          <button className="nav-item" onClick={() => open("help")}>
            <HelpCircle size={19} />
            Help & resources
          </button>
          <div className="profile">
            <span className="avatar">JL</span>
            <span>
              <strong>Jamie Lee</strong>
              <small>Workspace admin</small>
            </span>
            <button
              aria-label="Workspace profile"
              onClick={() => open("workspace")}
            >
              <MoreHorizontal size={19} />
            </button>
          </div>
        </div>
      </aside>
      <div inert={Boolean(modal)} className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu"
              aria-label="Toggle navigation"
              onClick={() => setMenu(!menu)}
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{page}</strong>
          </div>
          <div className="top-actions">
            <span className="live-indicator">
              <i />
              {api ? "API connected" : "Demo workspace"}
            </span>
            <button
              aria-label="Notifications"
              className="notification-button"
              onClick={() => setNotifications(!notifications)}
            >
              <Bell size={19} />
              {low.length > 0 && <i />}
            </button>
            <span className="avatar small">JL</span>
          </div>
          {notifications && (
            <div className="notification-popover">
              <strong>Stock alerts</strong>
              {low.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    open("adjust", p);
                    setNotifications(false);
                  }}
                >
                  <span>
                    {p.name}
                    <small>{p.stock} units remaining</small>
                  </span>
                  <ArrowUpRight size={16} />
                </button>
              ))}
            </div>
          )}
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="heading-note">Your workspace, at a glance</div>
              <h1>{page === "Overview" ? "Inventory overview" : page}</h1>
              <p>
                {page === "Overview"
                  ? "A clear view of your stock. More space for what’s next."
                  : page === "Inventory"
                    ? "Every product, every unit, all in one place."
                    : page === "Stock movements"
                      ? "Follow every change to your inventory."
                      : page === "Suppliers"
                        ? "The people who keep your shelves stocked."
                        : "Make this workspace your own."}
              </p>
            </div>
            <div className="heading-actions">
              <button className="button secondary" onClick={exportCsv}>
                <Download size={16} />
                Export
              </button>
              <button
                className="button primary"
                onClick={() => open("product")}
              >
                <Plus size={18} />
                Add product
              </button>
            </div>
          </div>
          {(page === "Overview" || page === "Inventory") && (
            <>
              {page === "Overview" && (
                <>
                  <div className="metrics">
                    <Metric
                      title="Total products"
                      value={products.length.toLocaleString()}
                      icon={Package}
                      foot="Across 5 product categories"
                    />
                    <Metric
                      title="Inventory value"
                      value={money(value)}
                      icon={Archive}
                      foot="Based on current stock cost"
                    />
                    <Metric
                      title="Units on hand"
                      value={units.toLocaleString()}
                      icon={Boxes}
                      foot="Across 2 warehouse locations"
                    />
                    <Metric
                      title="Needs attention"
                      value={low.length.toString().padStart(2, "0")}
                      icon={ArrowDownRight}
                      foot={`${low.filter((p) => p.stock === 0).length} out of stock · ${low.filter((p) => p.stock > 0).length} running low`}
                      warning
                    />
                  </div>
                  <div className="insights">
                    <section className="chart-panel">
                      <div className="section-heading">
                        <div>
                          <h2>Stock by category</h2>
                          <p>How your inventory is distributed</p>
                        </div>
                        <span className="subtle-pill">Live stock</span>
                      </div>
                      <div className="chart-body">
                        <div
                          className="donut"
                          style={{
                            background: (() => {
                              const colors = [
                                "#244d46",
                                "#7da994",
                                "#b4cdc1",
                                "#d6e4dc",
                                "#e9eeeb",
                              ];
                              let a = 0;
                              return `conic-gradient(${[
                                "Furniture",
                                "Lighting",
                                "Decor",
                                "Textiles",
                                "Storage",
                              ]
                                .map((c, i) => {
                                  const b = a;
                                  a +=
                                    (products
                                      .filter((p) => p.category === c)
                                      .reduce((s, p) => s + p.stock, 0) /
                                      (units || 1)) *
                                    100;
                                  return `${colors[i]} ${b}% ${a}%`;
                                })
                                .join(",")})`;
                            })(),
                          }}
                        >
                          <div>
                            <strong>{units}</strong>
                            <span>Total units</span>
                          </div>
                        </div>
                        <div className="legend">
                          {[
                            "Furniture",
                            "Lighting",
                            "Decor",
                            "Textiles",
                            "Storage",
                          ].map((c, i) => (
                            <div key={c}>
                              <span className={"legend-dot dot-" + i} />
                              <span>{c}</span>
                              <strong>
                                {products
                                  .filter((p) => p.category === c)
                                  .reduce((s, p) => s + p.stock, 0)}
                              </strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                    <section className="attention-panel">
                      <div className="section-heading">
                        <div>
                          <h2>Time for a restock</h2>
                          <p>A little attention goes a long way</p>
                        </div>
                        <span className="alert-count">{low.length} items</span>
                      </div>
                      <div className="restock-items">
                        {low.slice(0, 3).map((p) => (
                          <button
                            className="restock-row"
                            key={p.id}
                            onClick={() => open("adjust", p)}
                          >
                            <ProductArt product={p} />
                            <span className="restock-name">
                              <strong>{p.name}</strong>
                              <small>{p.sku}</small>
                            </span>
                            <span
                              className={
                                p.stock === 0 ? "remaining out" : "remaining"
                              }
                            >
                              {p.stock} left
                            </span>
                            <ChevronRight size={16} />
                          </button>
                        ))}
                      </div>
                      <button
                        className="attention-link"
                        onClick={() => {
                          setPage("Inventory");
                          setFilter("Low stock");
                        }}
                      >
                        Review low-stock products <ArrowUpRight size={16} />
                      </button>
                    </section>
                  </div>
                </>
              )}
              <section className="inventory-panel">
                <div className="inventory-title">
                  <div>
                    <h2>
                      {page === "Overview" ? "Your inventory" : "All products"}{" "}
                      <span>{products.length}</span>
                    </h2>
                    <p>A home for everything you keep in stock.</p>
                  </div>
                  <label className="select-wrap">
                    <SlidersHorizontal size={15} />
                    <select
                      aria-label="Warehouse"
                      value={warehouse}
                      onChange={(e) => setWarehouse(e.target.value)}
                    >
                      <option>All warehouses</option>
                      <option>Warehouse A</option>
                      <option>Warehouse B</option>
                    </select>
                  </label>
                </div>
                <div className="table-toolbar">
                  <div className="tabs">
                    {[
                      "All products",
                      "In stock",
                      "Low stock",
                      "Out of stock",
                    ].map((t) => (
                      <button
                        key={t}
                        className={filter === t ? "selected" : ""}
                        onClick={() => setFilter(t)}
                      >
                        {t}
                        {t === "Low stock" && (
                          <span>
                            {products.filter((p) => status(p) === t).length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="table-search">
                    <label className="search-input">
                      <Search size={16} />
                      <input
                        placeholder="Search products…"
                        aria-label="Search products"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                    <select
                      aria-label="Filter by category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option>All categories</option>
                      {[...new Set(products.map((p) => p.category))].map(
                        (c) => (
                          <option key={c}>{c}</option>
                        ),
                      )}
                    </select>
                  </div>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Stock level</th>
                        <th>Status</th>
                        <th>Unit price</th>
                        <th>Location</th>
                        <th>
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <button
                              className="product-cell"
                              onClick={() => open("product", p)}
                            >
                              <ProductArt product={p} />
                              <span>
                                <strong>{p.name}</strong>
                                <small>{p.sku}</small>
                              </span>
                            </button>
                          </td>
                          <td>{p.category}</td>
                          <td>
                            <div className="stock-number">
                              <strong>{p.stock}</strong>
                              <span>units</span>
                            </div>
                            <div className="stock-track">
                              <i
                                className={
                                  p.stock <= p.reorder_level ? "low" : ""
                                }
                                style={{
                                  width:
                                    Math.min((p.stock / 150) * 100, 100) + "%",
                                }}
                              />
                            </div>
                          </td>
                          <td>
                            <span
                              className={
                                "status " +
                                (p.stock === 0
                                  ? "out"
                                  : p.stock <= p.reorder_level
                                    ? "low"
                                    : "in")
                              }
                            >
                              <i />
                              {status(p)}
                            </span>
                          </td>
                          <td className="price">{unitPrice(p.price)}</td>
                          <td>{p.location}</td>
                          <td>
                            <button
                              className="row-action"
                              aria-label={"Adjust stock for " + p.name}
                              onClick={() => open("adjust", p)}
                            >
                              <ArrowLeftRight size={17} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!filtered.length && (
                    <div className="empty">
                      <Search size={28} />
                      <h3>No products found</h3>
                      <p>Try another search or clear your filters.</p>
                      <button
                        className="button secondary"
                        onClick={() => {
                          setFilter("All products");
                          setQuery("");
                          setCategory("All categories");
                          setWarehouse("All warehouses");
                        }}
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>
                <div className="table-footer">
                  <span>
                    Showing {filtered.length} of {products.length} products
                  </span>
                  <span className="saved">
                    <Check size={14} /> Changes saved{" "}
                    {api ? "to database" : "on this device"}
                  </span>
                </div>
              </section>
            </>
          )}
          {page === "Stock movements" && (
            <section className="inventory-panel movement-panel">
              <h2>Movement history</h2>
              {movements.length ? (
                movements.map((m) => (
                  <div className="movement-row" key={m.id}>
                    <span className="movement-icon">
                      <ArrowLeftRight size={20} />
                    </span>
                    <div>
                      <strong>{m.product_name || m.product?.name}</strong>
                      <p>{m.note || "Stock adjustment"}</p>
                    </div>
                    <strong
                      className={m.quantity > 0 ? "positive" : "negative"}
                    >
                      {m.quantity > 0 ? "+" : ""}
                      {m.quantity} units
                    </strong>
                    <time>{new Date(m.created_at).toLocaleDateString()}</time>
                  </div>
                ))
              ) : (
                <div className="empty">
                  <ArrowLeftRight size={30} />
                  <h3>Your stock story starts here</h3>
                  <p>Adjust a product’s stock to record your first movement.</p>
                  <button
                    className="button primary"
                    onClick={() => setPage("Inventory")}
                  >
                    Go to inventory
                  </button>
                </div>
              )}
            </section>
          )}
          {page === "Suppliers" && (
            <div className="supplier-grid">
              {[
                [
                  "Northwood Living",
                  "Furniture",
                  "hello@northwood.example",
                  "NL",
                ],
                [
                  "Object & Form",
                  "Decor & storage",
                  "studio@objectandform.example",
                  "OF",
                ],
                ["Lumina Supply", "Lighting", "orders@lumina.example", "LS"],
              ].map(([name, cat, email, initials]) => (
                <section className="supplier-card" key={name}>
                  <span className="supplier-avatar">{initials}</span>
                  <span className="subtle-pill">Demo supplier</span>
                  <h2>{name}</h2>
                  <p>{cat}</p>
                  <span>{email}</span>
                </section>
              ))}
            </div>
          )}
          {page === "Settings" && (
            <section className="settings-panel">
              <h2>Workspace preferences</h2>
              <p>
                Inventory is{" "}
                {api
                  ? "connected to the Laravel database."
                  : "saved locally in this browser. Start Laravel to use the database."}
              </p>
              <label>
                Workspace name
                <input value="Forma Studio" readOnly />
              </label>
              <label>
                Currency
                <input value="USD — US Dollar" readOnly />
              </label>
              <div className="settings-note">
                <Check size={18} /> Stock changes are automatically recorded in
                movement history.
              </div>
              <button
                className="button secondary"
                onClick={() => open("reset")}
              >
                <RefreshCw size={16} />
                Reset demo inventory
              </button>
            </section>
          )}
          <footer className="page-footer">
            <span>
              <span className="footer-mark">◈</span> A place for everything.
            </span>
            <span>
              Stockroom <span className="footer-dot">•</span> Inventory made
              clear
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
        </div>
      )}
      {modal && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget && !busy) setModal(null);
          }}
        >
          <dialog
            open
            aria-modal="true"
            className="modal"
            aria-labelledby="modal-title"
            onKeyDown={(e) => {
              if (e.key === "Escape" && !busy) setModal(null);
              if (e.key === "Tab") {
                const controls = e.currentTarget.querySelectorAll(
                  "button:not(:disabled), input, select, textarea",
                );
                const first = controls[0],
                  last = controls[controls.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
                }
              }
            }}
          >
            <button
              autoFocus
              className="modal-close"
              aria-label="Close dialog"
              onClick={() => setModal(null)}
              disabled={busy}
            >
              <X size={20} />
            </button>
            <h2 id="modal-title">
              {modal.type === "product"
                ? modal.product
                  ? "Edit product"
                  : "Add a product"
                : modal.type === "adjust"
                  ? "Adjust stock"
                  : modal.type === "reset"
                    ? "Reset demo inventory?"
                    : modal.type === "workspace"
                      ? "Forma Studio"
                      : "Welcome to Stockroom"}
            </h2>
            {modal.type === "product" || modal.type === "adjust" ? (
              <form onSubmit={save}>
                {modal.type === "product" ? (
                  <>
                    <label>
                      Product name
                      <input
                        required
                        name="name"
                        defaultValue={modal.product?.name}
                        placeholder="e.g. Arc lounge chair"
                        maxLength={120}
                      />
                    </label>
                    <div className="form-grid">
                      <label>
                        SKU
                        <input
                          required
                          name="sku"
                          defaultValue={modal.product?.sku}
                          placeholder="FUR-009"
                          maxLength={50}
                        />
                      </label>
                      <label>
                        Category
                        <select
                          name="category"
                          defaultValue={modal.product?.category || "Furniture"}
                        >
                          {[
                            "Furniture",
                            "Lighting",
                            "Decor",
                            "Textiles",
                            "Storage",
                          ].map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Stock quantity
                        <input
                          required
                          type="number"
                          min="0"
                          step="1"
                          name="stock"
                          defaultValue={modal.product?.stock ?? 0}
                        />
                      </label>
                      <label>
                        Reorder level
                        <input
                          required
                          type="number"
                          min="0"
                          step="1"
                          name="reorder_level"
                          defaultValue={modal.product?.reorder_level ?? 10}
                        />
                      </label>
                      <label>
                        Unit price ($)
                        <input
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          name="price"
                          defaultValue={modal.product?.price ?? 0}
                        />
                      </label>
                      <label>
                        Location
                        <select
                          name="location"
                          defaultValue={
                            modal.product?.location || "Warehouse A"
                          }
                        >
                          <option>Warehouse A</option>
                          <option>Warehouse B</option>
                        </select>
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <p>
                      {modal.product.name} currently has{" "}
                      <strong>{modal.product.stock} units</strong>.
                    </p>
                    <label>
                      Quantity change
                      <input
                        required
                        type="number"
                        step="1"
                        name="quantity"
                        placeholder="e.g. 20 or -5"
                      />
                    </label>
                    <small>
                      Use a positive number to receive stock, or a negative
                      number to remove it.
                    </small>
                    <label>
                      Note
                      <input
                        name="note"
                        maxLength={255}
                        placeholder="e.g. New shipment received"
                      />
                    </label>
                  </>
                )}
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setModal(null)}
                    disabled={busy}
                  >
                    Cancel
                  </button>
                  <button className="button primary" disabled={busy}>
                    {busy
                      ? "Saving…"
                      : modal.type === "adjust"
                        ? "Save adjustment"
                        : "Save product"}
                  </button>
                </div>
              </form>
            ) : modal.type === "reset" ? (
              <>
                <p>
                  This replaces inventory and movement history saved on this
                  device with the original demo data.
                </p>
                {api && <p>Reset is only available in demo mode.</p>}
                <button
                  className="button primary"
                  disabled={api}
                  onClick={() => {
                    setProducts(seed);
                    setMovements([]);
                    setModal(null);
                    notify("Demo inventory reset");
                  }}
                >
                  Reset demo data
                </button>
              </>
            ) : (
              <>
                <p>
                  {modal.type === "workspace"
                    ? "Your workspace for furniture, lighting, and everyday objects. Two warehouses. One clear view."
                    : "Add products, track stock, and catch low inventory before it slows you down."}
                </p>
                <div className="help-lines">
                  <p>
                    <Package size={18} /> Click a product to edit its details.
                  </p>
                  <p>
                    <ArrowLeftRight size={18} /> Use the arrows to receive or
                    remove stock.
                  </p>
                  <p>
                    <Download size={18} /> Export filtered inventory as a CSV.
                  </p>
                </div>
                <button
                  className="button primary"
                  onClick={() => setModal(null)}
                >
                  Got it
                </button>
              </>
            )}
          </dialog>
        </div>
      )}
    </div>
  );
}
