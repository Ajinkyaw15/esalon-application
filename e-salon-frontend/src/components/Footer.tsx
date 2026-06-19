import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="site-footer">
      <section className="footer-cta">
        <h2>
          Why <em>Choose</em> Ecozii?
        </h2>
        <p>
          Top-rated salons, easy booking, and directions at your fingertips — all in one
          premium experience.
        </p>
      </section>

      <div className="footer-bar">
        <Logo light />
        <nav className="footer-links" aria-label="Footer">
          <a href="#salons">Salons</a>
          <a href="#about">About</a>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </nav>
        <div className="footer-social" aria-label="Social links">
          <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
            f
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
            𝕏
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
            ◎
          </a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
            ▶
          </a>
        </div>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} Ecozii. All Rights Reserved.</p>
    </footer>
  )
}
