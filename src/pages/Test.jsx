import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

function App() {
  // ✅ Home Page
  const Home = () => (
    <div className="page home-page">
      <h1>☀️ Power Your Future with SolarRent</h1>
      <p>
        Affordable solar panel rentals for homes and businesses. Experience
        clean, renewable energy without the heavy investment.
      </p>
      <button className="explore-btn">Explore Plans</button>
    </div>
  );

  // ✅ Plans Page
  const Plans = () => {
    const rentalOptions = [
      { id: 1, title: "1 Month Plan", price: "₹1500", details: "Perfect for short-term events.", duration: "1 month" },
      { id: 2, title: "3 Months Plan", price: "₹4000", details: "Great for seasonal businesses.", duration: "3 months" },
      { id: 3, title: "6 Months Plan", price: "₹7500", details: "Value plan for mid-term usage.", duration: "6 months" },
      { id: 4, title: "1 Year Plan", price: "₹14000", details: "Best deal for long-term solar needs.", duration: "1 year" },
    ];

    return (
      <div className="page plans-page">
        <h1>Our Rental Plans</h1>
        <div className="cards-container">
          {rentalOptions.map((option) => (
            <div key={option.id} className="rental-card">
              <h2>{option.title}</h2>
              <p className="price">{option.price}</p>
              <p>{option.details}</p>
              <button className="rent-btn">Rent for {option.duration}</button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ✅ About Page
  const About = () => (
    <div className="page about-page">
      <h1>About SolarRent</h1>
      <p>
        SolarRent is committed to making renewable energy affordable for
        everyone. We offer flexible rental options for high-quality solar
        panels that help reduce your electricity bills and carbon footprint.
      </p>
      <p>
        Whether you're a homeowner, small business, or event organizer, we
        provide the right solar solution that fits your needs and budget.
      </p>
    </div>
  );

  // ✅ Contact Page
  const Contact = () => (
    <div className="page contact-page">
      <h1>Contact Us</h1>
      <p>Have questions or want a custom plan? Send us a message!</p>
      <form className="contact-form">
        <input type="text" placeholder="Your Name" required />
        <input type="email" placeholder="Your Email" required />
        <textarea placeholder="Your Message" rows="4" required></textarea>
        <button type="submit">Send Message</button>
      </form>
    </div>
  );

  return (
    <Router>
      {/* ✅ Navbar */}
      <nav className="navbar">
        <div className="logo">SolarRent</div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/plans">Plans</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </nav>

      {/* ✅ Route Configuration */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
