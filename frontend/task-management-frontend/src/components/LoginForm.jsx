function LoginForm({
  form,
  onChange,
  onSubmit,
  busyAction,
}) {
  return (
    <form className="stack-form" onSubmit={onSubmit}>
      <h3>Login</h3>
      <label>
        Username
        <input
          name="username"
          value={form.username}
          onChange={onChange}
          placeholder="Enter your username"
        />
      </label>
      <label>
        Password
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          placeholder="Enter your password"
        />
      </label>
      <button
        type="submit"
        className="dark-button full-width"
        disabled={busyAction === "login"}
      >
        {busyAction === "login" ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}

export default LoginForm;
