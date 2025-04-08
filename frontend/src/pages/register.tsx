export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Register</h1>
      <form>
        <div className="mb-4 d-flex flex-column">
          <label className="mb-2" htmlFor="username">
            Username
          </label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
          />
        </div>
        <div className="mb-4 d-flex flex-column">
          <label className="mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Register
        </button>
      </form>
    </div>
  )
}