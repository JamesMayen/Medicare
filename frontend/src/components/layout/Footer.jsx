import logo4 from "../images/logo-4.svg";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-500 via-green-500 via-gray-500 to-gray-200 text-white p-2">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <img src={logo4} alt="MediCare Logo" className="mx-auto w-60 h-60 object-contain text-white" />
          <p>Your trusted healthcare companion for finding doctors and booking appointments.</p>
          <p className="text-blue-100">Services: Find Doctors | Book Appointments | AI Health Assistant | Emergency Care</p>
          <p className="text-blue-100">Support: Help Center | Contact Us | Privacy Policy | Terms of Service</p>
          <p className="text-blue-100">Emergency: 211 | Support: (211) 922-422-477 | info@medicare-app.com</p>
          <p className="text-blue-100 text-xs">© 2025 MediCare. All rights reserved.</p>
        </div>
      </footer>
  )
}
