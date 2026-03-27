function LogoutButton({ onLogout, busyAction, className = "ghost-button full-width" }) {
  return (
    <button
      type="button"
      className={className}
      onClick={onLogout}
      disabled={busyAction === "logout"}
    >
      {busyAction === "logout" ? "Logging out..." : "Logout"}
    </button>
  );
}

export default LogoutButton;
