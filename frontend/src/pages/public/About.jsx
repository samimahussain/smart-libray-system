export default function About() {
  return (
    <div className="min-h-screen px-8 py-16 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold">About EduVault</h1>

      <p className="mt-6 text-lg opacity-80">
        EduVault is an AI-powered smart library platform designed to
        modernize how students discover, read, and manage learning
        resources — both digital and physical.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Value title="AI-Driven Learning">
          Personalized study plans, recommendations, and analytics.
        </Value>
        <Value title="Smart Library">
          Online & offline book issue with tracking and insights.
        </Value>
        <Value title="Enterprise Ready">
          Role-based access for students, librarians, and admins.
        </Value>
      </div>
    </div>
  )
}

function Value({ title, children }) {
  return (
    <div className="card p-6">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm opacity-70 mt-2">{children}</p>
    </div>
  )
}
