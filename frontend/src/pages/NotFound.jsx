import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <section className="h-[80vh] flex flex-col justify-center items-center text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-gray-600 mb-6">Page not found</p>
      <Link
        to="/"
        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition"
      >
        Back Home
      </Link>
    </section>
  )
}
