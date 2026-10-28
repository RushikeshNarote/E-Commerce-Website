const navItems = [
  { label: "Collection", href: "#collection" },
  { label: "The showcase", href: "#showcase" },
  { label: "Our story", href: "#story" },
];

function Navbar({
  cartOpen,
  cartCount,
  menuOpen,
  onCartOpen,
  onAccountOpen,
  onMenuClose,
  onMenuToggle,
  onSearchChange,
  onSearchToggle,
  searchOpen,
  searchQuery,
}) {
  return (
    <header className="site-header" id="top">
      <a className="site-logo" href="#top" aria-label="LEGENDS, home">
        <img
          alt="LEGENDS"
          height="54"
          src="/images/Brand%20logo%20with%20orange%20border.png"
          width="150"
        />
      </a>

      <button
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        className="menu-toggle"
        onClick={onMenuToggle}
        type="button"
      >
        <span />
        <span />
      </button>

      <nav
        className={`primary-nav${menuOpen ? " primary-nav--open" : ""}`}
        aria-label="Main navigation"
      >
        {navItems.map((item) => (
          <a href={item.href} key={item.label} onClick={onMenuClose}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <button aria-label="Open account" className="account-button" onClick={onAccountOpen} type="button">
          Account
        </button>
        <button
          aria-expanded={searchOpen}
          aria-label={searchOpen ? "Close product search" : "Search products"}
          className="icon-button"
          onClick={onSearchToggle}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4.3 4.3" />
          </svg>
        </button>
        <button
          aria-label={cartOpen ? `Cart preview open, ${cartCount} items` : `Open cart, ${cartCount} items`}
          className="cart-button"
          onClick={onCartOpen}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M4 8h16l-1.2 12H5.2L4 8Z" />
            <path d="M9 9V6a3 3 0 0 1 6 0v3" />
          </svg>
          <span>Bag</span>
          <span className="cart-count">{String(cartCount).padStart(2, "0")}</span>
        </button>
      </div>

      {searchOpen && (
        <form
          className="search-panel"
          onSubmit={(event) => {
            event.preventDefault();
            document.querySelector("#collection")?.scrollIntoView({ behavior: "smooth" });
            onMenuClose();
          }}
          role="search"
        >
          <label className="sr-only" htmlFor="product-search">
            Search collection by model or color
          </label>
          <input
            autoFocus
            id="product-search"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search models or colorways"
            type="search"
            value={searchQuery}
          />
          <button className="search-submit" type="submit">
            Search <span aria-hidden="true">↗</span>
          </button>
        </form>
      )}
    </header>
  );
}

export default Navbar;
