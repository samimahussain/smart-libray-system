export default function Contact() {
  return (
    <div className="min-h-screen px-8 py-16 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold">Contact Us</h1>
      <p className="mt-2 opacity-70">
        Have questions or want to integrate EduVault at your institution?
      </p>

      <form className="card p-8 mt-10">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="label">Name</label>
            <input className="input mt-1" />
          </div>

          <div>
            <label className="label">Email</label>
            <input className="input mt-1" />
          </div>
        </div>

        <div className="mt-6">
          <label className="label">Message</label>
          <textarea
            rows="5"
            className="input mt-1"
            placeholder="Tell us how we can help..."
          />
        </div>

        <button className="btn-primary mt-6">
          Send message
        </button>
      </form>
    </div>
  )
}
