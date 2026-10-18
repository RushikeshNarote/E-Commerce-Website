const exploreLinks = [
  { label: "Home", href: "#top" },
  { label: "Collection", href: "#collection" },
  { label: "Our Story", href: "#story" },
  { label: "Contact", href: "#contact" },
];

const teamMembers = [
  {
    name: "Rushikesh Narote",
    role: "Animation, 3D Asset and UI/UX Integration",
  },
  {
    name: "Sanket Palve",
    role: "Backend Server and Node.js Integration",
  },
  {
    name: "Durvas Palve",
    role: "Database and MongoDB Integration",
  },
  {
    name: "Shreyash Pagare",
    role: "RESTful API Integration",
  },
];

function Footer() {
  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="footer-main">
        <section className="footer-brand" aria-labelledby="footer-brand-title">
          <a
            className="footer-logo"
            href="#top"
            aria-label="LEGENDS, back to top"
          >
            <img
              alt="LEGENDS — MOVE BEYOND"
              height="86"
              src="/images/legends-footer-logo.svg"
              width="390"
            />
          </a>
          <h2 className="sr-only" id="footer-brand-title">
            LEGENDS — MOVE BEYOND
          </h2>
          <p className="footer-brand__description">
            Built for those who move differently. Discover your next step with
            LEGENDS.
          </p>
          <span className="footer-brand__accent" aria-hidden="true" />
        </section>

        <nav className="footer-column footer-explore" aria-labelledby="footer-explore-title">
          <h2 className="footer-heading" id="footer-explore-title">
            Explore
          </h2>
          <ul className="footer-link-list">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <section
          className="footer-column footer-project"
          aria-labelledby="footer-project-title"
        >
          <h2 className="footer-heading" id="footer-project-title">
            The project
          </h2>
          <p className="footer-project__name">LEGENDS — MOVE BEYOND</p>
          <p className="footer-project__type">
            MERN Stack Shoe E-Commerce Website
          </p>
          <p className="footer-project__description">
            MongoDB, Express, React, and Node.js. The current storefront
            foundation is built with React and Vite.
          </p>
          <p className="footer-contact-note" id="contact">
            Project contact details have not been provided.
          </p>
        </section>

        <section
          className="footer-team"
          aria-labelledby="footer-team-title"
        >
          <div className="footer-team__heading">
            <p className="footer-kicker">The people behind the project</p>
            <h2 className="footer-heading" id="footer-team-title">
              Development team
            </h2>
          </div>
          <ul className="footer-team__list">
            {teamMembers.map((member) => (
              <li className="footer-team__member" key={member.name}>
                <p className="footer-team__name">{member.name}</p>
                <p className="footer-team__role">{member.role}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="footer-guidance"
          aria-labelledby="footer-guidance-title"
        >
          <span className="footer-guidance__mark" aria-hidden="true">
            /
          </span>
          <div>
            <p className="footer-kicker">Faculty guidance</p>
            <h2 className="sr-only" id="footer-guidance-title">
              Project guidance
            </h2>
            <p className="footer-guidance__copy">
              Project developed under the guidance of Professor Gajanan Kadam.
            </p>
          </div>
        </section>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} LEGENDS — MOVE BEYOND.</p>
        <p>Designed to move beyond limits.</p>
        <a className="footer-top" href="#top">
          Back to top <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  );
}

export default Footer;
