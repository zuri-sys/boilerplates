export const categories = ["Hardware", "Software", "Network", "Account & access", "Other"];
export const priorities = ["Low", "Medium", "High", "Critical"];
export const statuses = ["Open", "In progress", "Resolved", "Closed"];
export const emptyTicket = {
  requester_name: "",
  requester_email: "",
  issue_category: "",
  priority: "",
  subject: "",
  description: "",
  status: "Open",
};
export function validateTicket(ticket) {
  const errors = {};
  const limits = {
    requester_name: 120,
    requester_email: 254,
    subject: 200,
    description: 10000,
  };
  for (const field of Object.keys(emptyTicket)) {
    if (!ticket[field]?.trim()) errors[field] = "This field is required.";
    else if (limits[field] && ticket[field].length > limits[field])
      errors[field] = `Use ${limits[field]} characters or fewer.`;
  }
  if (ticket.requester_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ticket.requester_email))
    errors.requester_email = "Enter a valid email address.";
  for (const [field, options] of [
    ["issue_category", categories],
    ["priority", priorities],
    ["status", statuses],
  ]) {
    if (ticket[field] && !options.includes(ticket[field])) errors[field] = "Select a valid option.";
  }
  return errors;
}
export const dateTime = (value) =>
  new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
export const dateOnly = (value) =>
  new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(new Date(value));
