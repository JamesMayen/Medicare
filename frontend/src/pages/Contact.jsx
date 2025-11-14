export default function Contact() {
  return (
    <section className="py-16 px-6 text-center">
      <h2 className="text-4xl font-bold text-primary mb-4">Contact Us</h2>
      <form className="max-w-md mx-auto space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-primary"
        />
        <input
          type="email"
          placeholder="Your Email"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring focus:ring-primary"
        />
        <textarea
          placeholder="Your Message"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32 focus:ring focus:ring-primary"
        ></textarea>
        <button
          type="submit"
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition"
        >
          Send Message
        </button>
      </form>
    </section>
  )
}
