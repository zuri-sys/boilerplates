import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock3,
  Headphones,
  LifeBuoy,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Ticket,
  Trash2,
  Pencil,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { api, readSession, saveSession } from "./api";
import {
  categories,
  priorities,
  statuses,
  emptyTicket,
  validateTicket,
  dateOnly,
  dateTime,
} from "./data";
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);
function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const [message, setMessage] = useState("");
  const logout = () => {
    saveSession(null);
    setSession(null);
  };
  useEffect(() => {
    const unauthorized = () => {
      logout();
      setMessage("Your session expired. Please sign in again.");
    };
    window.addEventListener("helpdesk:unauthorized", unauthorized);
    return () => window.removeEventListener("helpdesk:unauthorized", unauthorized);
  }, []);
  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(
      () => {
        logout();
        setMessage("Your session expired. Please sign in again.");
      },
      Math.max(0, session.expires_at - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [session]);
  return (
    <AuthContext.Provider
      value={{
        session,
        message,
        logout,
        login: (value) => {
          saveSession(value);
          setSession(value);
          setMessage("");
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
function Brand() {
  return (
    <span className="brand">
      <span className="brand-icon">
        <Headphones size={23} />
      </span>
      support<span className="brand-light">desk</span>
      <span className="brand-dot">.</span>
    </span>
  );
}
function ErrorMessage({ children }) {
  return children ? (
    <div className="error-message" role="alert">
      <CircleHelp size={17} />
      <span>{children}</span>
    </div>
  ) : null;
}
function Badge({ value }) {
  return (
    <span className={`badge ${value.toLowerCase().replaceAll(" ", "-")}`}>
      <span />
      {value}
    </span>
  );
}
function Login() {
  const { session, login, message } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  if (session) return <Navigate to="/tickets" replace />;
  async function submit(event) {
    event.preventDefault();
    setError("");
    const credentials = Object.fromEntries(new FormData(event.currentTarget));
    if (credentials.username !== "itadmin" || credentials.password !== "helpdesk123") {
      setError("Incorrect username or password. Please try again.");
      return;
    }
    setBusy(true);
    try {
      login(await api("/auth/login", { method: "POST", body: credentials }));
      navigate("/tickets", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page">
      <section className="login-story">
        <Brand />
        <div className="story-content">
          <span className="eyebrow">IT SERVICE MANAGEMENT</span>
          <h1>
            IT support, organized.
            <br />
            From request to resolution.
          </h1>
          <p>
            One workspace to manage requests, keep your team moving, and make IT support feel
            effortless.
          </p>
          <div className="story-illustration" aria-hidden="true">
            <div className="illustration-orbit" />
            <div className="illustration-ticket">
              <span className="illustration-icon">
                <Ticket size={26} />
              </span>
              <div>
                <strong>Centralized service requests</strong>
                <span>From first contact to resolution</span>
              </div>
              <Check size={20} />
            </div>
            <div className="illustration-note">
              <ShieldCheck size={21} />
              <span>Built for your support team</span>
            </div>
          </div>
          <div className="story-features">
            <span>
              <Check size={15} /> Organized requests
            </span>
            <span>
              <Check size={15} /> Clear priorities
            </span>
            <span>
              <Check size={15} /> Lasting records
            </span>
          </div>
        </div>
        <small>IT System Management & Helpdesk</small>
      </section>
      <section className="login-form-area">
        <form onSubmit={submit} className="login-form" noValidate>
          <span className="welcome-icon">
            <LifeBuoy size={28} />
          </span>
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to your workspace</h2>
          <p>Enter your credentials to access the IT helpdesk.</p>
          <ErrorMessage>{error || message}</ErrorMessage>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            placeholder="Enter your username"
            required
            disabled={busy}
          />
          <label htmlFor="password">Password</label>
          <div className="password-input">
            <input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              disabled={busy}
            />
            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow(!show)}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button className="button primary login-submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
            <ArrowUpRight size={18} />
          </button>
          <div className="credentials">
            <ShieldCheck size={18} />
            <div>
              <strong>Laboratory workspace</strong>
              <span>
                Username: <code>itadmin</code> · Password: <code>helpdesk123</code>
              </span>
            </div>
          </div>
          <div className="login-footer">IT System Management and Helpdesk</div>
        </form>
      </section>
    </div>
  );
}
function ProtectedLayout() {
  const { session, logout } = useAuth();
  const location = useLocation();
  if (!session) return <Navigate to="/login" replace />;
  const section = location.pathname.endsWith("/new")
    ? "Add ticket"
    : location.pathname.endsWith("/edit")
      ? "Edit ticket"
      : location.pathname === "/tickets"
        ? "All tickets"
        : "Ticket details";
  return (
    <div className="app">
      <aside className="sidebar">
        <Link to="/tickets" className="brand-link">
          <Brand />
        </Link>
        <div className="workspace">
          <span className="workspace-avatar">IT</span>
          <div>
            <strong>IT Operations</strong>
            <small>Helpdesk workspace</small>
          </div>
          <ShieldCheck size={16} />
        </div>
        <span className="nav-caption">WORKSPACE</span>
        <nav>
          <Link
            to="/tickets"
            className={`nav-item ${location.pathname === "/tickets" ? "active" : ""}`}
          >
            <ClipboardList size={19} /> Helpdesk tickets
            <span className="nav-dot" />
          </Link>
          <Link
            to="/tickets/new"
            className={`nav-item ${location.pathname === "/tickets/new" ? "active" : ""}`}
          >
            <Plus size={19} /> Create a ticket
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="support-card">
            <LifeBuoy size={24} />
            <strong>Service operations</strong>
            <p>
              Track requests and priorities,
              <br />
              from submission to resolution.
            </p>
          </div>
          <div className="profile">
            <span className="avatar">IA</span>
            <div>
              <strong>IT Administrator</strong>
              <small>Support team</small>
            </div>
            <button onClick={logout} aria-label="Sign out" title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace
            <ChevronRight size={14} />
            <span>{section}</span>
          </div>
          <div className="topbar-end">
            <span className="workspace-label">
              <span /> IT support workspace
            </span>
            <span className="avatar small">IA</span>
            <button className="mobile-logout" onClick={logout} aria-label="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
        <footer className="page-footer">
          <span>Supportdesk · IT Service Management</span>
          <span>
            <ShieldCheck size={13} /> Helpdesk workspace
          </span>
        </footer>
      </div>
    </div>
  );
}
function useRemote(path) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: "" });
    api(path, { signal: controller.signal })
      .then((data) => setState({ data, loading: false, error: "" }))
      .catch((error) => {
        if (error.name !== "AbortError")
          setState({ data: null, loading: false, error: error.message });
      });
    return () => controller.abort();
  }, [path, version]);
  return { ...state, retry: () => setVersion((value) => value + 1) };
}
function Loading() {
  return (
    <div className="empty-state" role="status">
      <RefreshCw className="spin" size={26} />
      <h3>Loading tickets…</h3>
      <p>Getting the latest from your helpdesk.</p>
    </div>
  );
}
function LoadError({ error, retry }) {
  return (
    <div className="load-error">
      <ErrorMessage>{error}</ErrorMessage>
      <button className="button secondary" onClick={retry}>
        <RefreshCw size={16} /> Try again
      </button>
    </div>
  );
}
function TicketList() {
  const { data, loading, error, retry } = useRemote("/tickets");
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("All tickets");
  const [priority, setPriority] = useState("");
  const [notice, setNotice] = useState(location.state?.notice || "");
  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null });
  }, []);
  const tickets = data || [];
  const filtered = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          (tab === "All tickets" || ticket.status === tab) &&
          (!priority || ticket.priority === priority) &&
          `${ticket.ticket_number} ${ticket.subject} ${ticket.requester_name} ${ticket.requester_email}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [data, query, tab, priority],
  );
  const metrics = [
    {
      label: "Total tickets",
      value: tickets.length,
      icon: Ticket,
      caption: "All submitted service requests",
      tone: "green",
    },
    {
      label: "Open requests",
      value: tickets.filter((t) => t.status === "Open").length,
      icon: ClipboardList,
      caption: "Requests awaiting action",
      tone: "amber",
    },
    {
      label: "In progress",
      value: tickets.filter((t) => t.status === "In progress").length,
      icon: Clock3,
      caption: "Requests currently being handled",
      tone: "blue",
    },
    {
      label: "Resolved",
      value: tickets.filter((t) => ["Resolved", "Closed"].includes(t.status)).length,
      icon: ShieldCheck,
      caption: "Resolved and closed requests",
      tone: "green",
    },
  ];
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">SERVICE OPERATIONS</span>
          <h1>
            Helpdesk tickets<span className="heading-dot">.</span>
          </h1>
          <p>Manage support requests, monitor priorities, and track service resolution.</p>
        </div>
        <Link className="button primary" to="/tickets/new">
          <Plus size={17} /> Add ticket
        </Link>
      </div>
      {notice && (
        <div className="success-message" role="status">
          <Check size={17} />
          {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss notification">
            ×
          </button>
        </div>
      )}
      <section className="metrics" aria-label="Ticket statistics">
        {metrics.map(({ label, value, icon: Icon, caption, tone }) => (
          <div className="metric" key={label}>
            <div className="metric-top">
              <span>{label}</span>
              <span className={`metric-icon ${tone}`}>
                <Icon size={19} />
              </span>
            </div>
            <strong>{loading || error ? "—" : value.toString().padStart(2, "0")}</strong>
            <span className="metric-caption">{caption}</span>
          </div>
        ))}
      </section>
      <section className="ticket-panel">
        <div className="panel-heading">
          <div>
            <h2>
              Service request queue{" "}
              <span className="count">{loading || error ? "—" : tickets.length}</span>
            </h2>
            <p>Review, prioritize, and manage your support tickets.</p>
          </div>
          <button
            className="icon-button"
            onClick={retry}
            aria-label="Refresh ticket list"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "spin" : ""} />
          </button>
        </div>
        <div className="table-toolbar">
          <div className="tabs" aria-label="Filter by status">
            {["All tickets", "Open", "In progress", "Resolved", "Closed"].map((value) => (
              <button
                key={value}
                className={tab === value ? "selected" : ""}
                onClick={() => setTab(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="table-filters">
            <div className="search-input">
              <Search size={17} />
              <input
                aria-label="Search tickets"
                placeholder="Search tickets…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              aria-label="Filter by priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">All priorities</option>
              {priorities.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>
        {loading ? (
          <Loading />
        ) : error ? (
          <LoadError error={error} retry={retry} />
        ) : !filtered.length ? (
          <div className="empty-state">
            <span className="empty-icon">
              <Ticket size={30} />
            </span>
            <h3>{tickets.length ? "No matching tickets" : "No tickets yet"}</h3>
            <p>
              {tickets.length
                ? "Try a different search, status, or priority."
                : "Create your first ticket to start tracking support requests."}
            </p>
            {tickets.length ? (
              <button
                className="button secondary"
                onClick={() => {
                  setQuery("");
                  setTab("All tickets");
                  setPriority("");
                }}
              >
                Clear filters
              </button>
            ) : (
              <Link to="/tickets/new" className="button primary">
                <Plus size={16} /> Add your first ticket
              </Link>
            )}
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Ticket / subject</th>
                  <th>Requester</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date created</th>
                  <th>
                    <span className="sr-only">View ticket</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <Link className="ticket-link" to={`/tickets/${ticket.id}`}>
                        <span className="ticket-number">{ticket.ticket_number}</span>
                        <strong>{ticket.subject}</strong>
                        <small>{ticket.issue_category}</small>
                      </Link>
                    </td>
                    <td>
                      <div className="requester">
                        <span className="requester-avatar">
                          {ticket.requester_name
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((word) => word[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                        <div>
                          <strong>{ticket.requester_name}</strong>
                          <small>{ticket.requester_email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge value={ticket.priority} />
                    </td>
                    <td>
                      <Badge value={ticket.status} />
                    </td>
                    <td className="date-cell">{dateOnly(ticket.created_at)}</td>
                    <td>
                      <Link
                        className="icon-button"
                        to={`/tickets/${ticket.id}`}
                        aria-label={`View ${ticket.ticket_number}`}
                      >
                        <ArrowUpRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          <span>
            {loading
              ? "Loading queue…"
              : error
                ? "Queue unavailable"
                : `Showing ${filtered.length} of ${tickets.length} tickets`}
          </span>
          <span>IT helpdesk service requests</span>
        </div>
      </section>
      <div className="queue-note">
        <LifeBuoy size={17} />
        <span>Track each request from submission through resolution.</span>
      </div>
      <Link className="floating-add" to="/tickets/new" aria-label="Add ticket">
        <Plus size={26} />
      </Link>
    </>
  );
}
function TicketForm({ ticket = null }) {
  const [values, setValues] = useState(
    ticket
      ? Object.fromEntries(Object.keys(emptyTicket).map((key) => [key, ticket[key]]))
      : { ...emptyTicket },
  );
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault();
    const normalized = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value.trim()]),
    );
    const validation = validateTicket(normalized);
    setErrors(validation);
    setError("");
    if (Object.keys(validation).length) {
      setError("Please check the highlighted fields.");
      return;
    }
    setBusy(true);
    try {
      await api(ticket ? `/tickets/${ticket.id}` : "/tickets", {
        method: ticket ? "PUT" : "POST",
        body: normalized,
      });
      navigate("/tickets", {
        state: {
          notice: ticket ? "Ticket updated successfully." : "Ticket created successfully.",
        },
      });
    } catch (err) {
      setError(err.message);
      setErrors(
        Object.fromEntries(
          Object.entries(err.fields || {}).map(([key, value]) => [
            key,
            Array.isArray(value) ? value[0] : value,
          ]),
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  function field(name, label, options = null, full = false) {
    const props = {
      id: name,
      name,
      value: values[name],
      disabled: busy,
      required: true,
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": errors[name] ? `${name}-error` : undefined,
      onChange: (event) => {
        setValues({ ...values, [name]: event.target.value });
        setErrors({ ...errors, [name]: "" });
      },
    };
    return (
      <div className={`field ${full ? "full" : ""}`}>
        <label htmlFor={name}>
          {label}
          <span className="required" aria-hidden="true">
            *
          </span>
        </label>
        {options ? (
          <select {...props}>
            <option value="">Select {label.toLowerCase()}</option>
            {options.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        ) : name === "description" ? (
          <textarea
            {...props}
            rows={6}
            maxLength={10000}
            placeholder="Describe the issue, what happened, and any troubleshooting already tried…"
          />
        ) : (
          <input
            {...props}
            type={name === "requester_email" ? "email" : "text"}
            maxLength={name === "subject" ? 200 : name === "requester_name" ? 120 : 254}
            placeholder={
              {
                requester_name: "e.g. Alex Santos",
                requester_email: "e.g. alex@company.com",
                subject: "A short, clear summary of the issue",
              }[name]
            }
          />
        )}
        {errors[name] && (
          <span className="field-error" id={`${name}-error`}>
            {errors[name]}
          </span>
        )}
      </div>
    );
  }
  return (
    <>
      <Link className="back-link" to={ticket ? `/tickets/${ticket.id}` : "/tickets"}>
        <ArrowLeft size={16} /> Back to {ticket ? "ticket details" : "tickets"}
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{ticket ? ticket.ticket_number : "NEW SERVICE REQUEST"}</span>
          <h1>
            {ticket ? "Edit ticket" : "Create a ticket"}
            <span className="heading-dot">.</span>
          </h1>
          <p>
            {ticket
              ? "Keep the details current and the resolution moving."
              : "Provide the requester information and a detailed description of the issue."}
          </p>
        </div>
      </div>
      <div className="form-layout">
        <form className="form-panel" onSubmit={submit} noValidate>
          <div className="form-section">
            <span className="section-number">01</span>
            <div>
              <h2>Requester information</h2>
              <p>Contact details for the person requesting support.</p>
            </div>
          </div>
          <div className="form-grid">
            {field("requester_name", "Requester name")}
            {field("requester_email", "Requester email")}
          </div>
          <div className="form-section divider">
            <span className="section-number">02</span>
            <div>
              <h2>Issue details</h2>
              <p>Categorize the request and describe the issue.</p>
            </div>
          </div>
          <div className="form-grid">
            {field("issue_category", "Issue category", categories)}
            {field("priority", "Priority", priorities)}
            {field("subject", "Subject", null, true)}
            {field("description", "Description", null, true)}
            {ticket && field("status", "Status", statuses)}
          </div>
          <ErrorMessage>{error}</ErrorMessage>
          <div className="form-actions">
            <Link className="button secondary" to={ticket ? `/tickets/${ticket.id}` : "/tickets"}>
              Cancel
            </Link>
            <button className="button primary" disabled={busy}>
              {busy ? "Saving…" : ticket ? "Save changes" : "Create ticket"}
              <Check size={17} />
            </button>
          </div>
        </form>
        <aside className="form-tips">
          <span className="tips-icon">
            <LifeBuoy size={25} />
          </span>
          <h3>Request guidelines</h3>
          <p>A few thoughtful details help your support team find a solution faster.</p>
          <div>
            <strong>Keep the subject clear</strong>
            <p>Summarize the problem in a few words.</p>
          </div>
          <div>
            <strong>Include the essentials</strong>
            <p>Mention the device, error messages, and when the issue started.</p>
          </div>
          <div>
            <strong>Choose the right priority</strong>
            <p>Critical means work is blocked across your team. Low is for issues that can wait.</p>
          </div>
          <small>
            <ShieldCheck size={14} /> All required fields are marked with an asterisk
          </small>
        </aside>
      </div>
    </>
  );
}
function EditTicket() {
  const { id } = useParams();
  const { data, loading, error, retry } = useRemote(`/tickets/${id}`);
  return loading ? (
    <Loading />
  ) : error ? (
    <>
      <Link className="back-link" to="/tickets">
        <ArrowLeft size={16} /> Back to tickets
      </Link>
      <LoadError error={error} retry={retry} />
    </>
  ) : (
    <TicketForm key={data.id} ticket={data} />
  );
}
function TicketDetails() {
  const { id } = useParams();
  const { data: ticket, loading, error, retry } = useRemote(`/tickets/${id}`);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const navigate = useNavigate();
  async function remove() {
    setDeleting(true);
    setDeleteError("");
    try {
      await api(`/tickets/${id}`, { method: "DELETE" });
      navigate("/tickets", {
        replace: true,
        state: { notice: "Ticket deleted successfully." },
      });
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  }
  return (
    <>
      <Link className="back-link" to="/tickets">
        <ArrowLeft size={16} /> Back to tickets
      </Link>
      {loading ? (
        <Loading />
      ) : error ? (
        <LoadError error={error} retry={retry} />
      ) : (
        <>
          <div className="page-heading">
            <div>
              <span className="eyebrow">{ticket.ticket_number}</span>
              <h1 className="detail-title">{ticket.subject}</h1>
              <p>Created {dateTime(ticket.created_at)}</p>
            </div>
            <Link className="button primary" to={`/tickets/${id}/edit`}>
              <Pencil size={16} /> Edit ticket
            </Link>
          </div>
          <div className="details-layout">
            <article className="detail-panel">
              <div className="detail-panel-heading">
                <h2>Ticket information</h2>
                <Badge value={ticket.status} />
              </div>
              <dl className="detail-grid">
                <div>
                  <dt>Requester name</dt>
                  <dd>{ticket.requester_name}</dd>
                </div>
                <div>
                  <dt>Requester email</dt>
                  <dd>
                    <a href={`mailto:${ticket.requester_email}`}>{ticket.requester_email}</a>
                  </dd>
                </div>
                <div>
                  <dt>Issue category</dt>
                  <dd>{ticket.issue_category}</dd>
                </div>
                <div>
                  <dt>Priority</dt>
                  <dd>
                    <Badge value={ticket.priority} />
                  </dd>
                </div>
                <div>
                  <dt>Ticket number</dt>
                  <dd>{ticket.ticket_number}</dd>
                </div>
                <div>
                  <dt>Last updated</dt>
                  <dd>{dateTime(ticket.updated_at)}</dd>
                </div>
              </dl>
              <div className="description-block">
                <h3>Description</h3>
                <p>{ticket.description}</p>
              </div>
            </article>
            <aside className="ticket-side">
              <div className="form-tips">
                <Clock3 size={25} />
                <h3>Resolution tracking</h3>
                <p>Update the ticket as work progresses so everyone knows where things stand.</p>
                <Link className="button secondary" to={`/tickets/${id}/edit`}>
                  Update status <ArrowUpRight size={16} />
                </Link>
              </div>
              <div className="delete-panel">
                <h3>Delete this ticket</h3>
                <p>This permanently removes the ticket from the database.</p>
                {confirmDelete ? (
                  <>
                    <p className="delete-question">Delete {ticket.ticket_number}?</p>
                    <ErrorMessage>{deleteError}</ErrorMessage>
                    <div className="delete-actions">
                      <button className="button danger" onClick={remove} disabled={deleting}>
                        {deleting ? "Deleting…" : "Delete ticket"}
                      </button>
                      <button
                        className="button secondary"
                        disabled={deleting}
                        onClick={() => setConfirmDelete(false)}
                      >
                        Keep ticket
                      </button>
                    </div>
                  </>
                ) : (
                  <button className="delete-link" onClick={() => setConfirmDelete(true)}>
                    <Trash2 size={15} /> Delete ticket
                  </button>
                )}
              </div>
            </aside>
          </div>
        </>
      )}
    </>
  );
}
function NotFound() {
  return (
    <div className="empty-state">
      <CircleHelp size={30} />
      <h1>Page not found</h1>
      <p>This page does not exist in your workspace.</p>
      <Link className="button primary" to="/tickets">
        Back to tickets
      </Link>
    </div>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedLayout />}>
            <Route index element={<Navigate to="/tickets" replace />} />
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/tickets/new" element={<TicketForm />} />
            <Route path="/tickets/:id" element={<TicketDetails />} />
            <Route path="/tickets/:id/edit" element={<EditTicket />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
