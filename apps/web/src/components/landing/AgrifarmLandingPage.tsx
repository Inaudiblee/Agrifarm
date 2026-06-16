"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Leaf,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sprout,
  Star,
  Store,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import {
  categories,
  marketplaceBenefits,
  products,
  stats,
} from "@/data/landing";
import { useLocale } from "@/components/locale-provider";
import { getAuthToken, getAuthUser, type AuthUser } from "@/lib/auth-storage";
import { getRoleHomeHref, isSeller } from "@/lib/auth-routing";

const CONTENT = "/assets/agrifarm-content";

const benefitIcons = [Leaf, Store, Sprout, MessageCircle, BarChart3, Truck];
const heroHighlightIcons = [UserRound, Leaf, Truck];
const trustIcons = [Leaf, ShieldCheck, LockKeyhole, Truck];

function MotionSection({
  id,
  className,
  children,
}: {
  id?: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      className={className}
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}

export function AgrifarmLandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const { locale, copy, setLocale } = useLocale();
  const t = copy.landing;
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.22], [0, prefersReducedMotion ? 0 : -46]);

  const year = useMemo(() => new Date().getFullYear(), []);
  const accountHref = getRoleHomeHref(authUser);
  const accountRole = isSeller(authUser) ? t.account.seller : t.account.buyer;
  const accountAction = isSeller(authUser) ? t.account.dashboard : t.account.marketplace;

  useEffect(() => {
    const token = getAuthToken();
    const user = getAuthUser();
    setAuthUser(token && user ? user : null);
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = document.getElementById("marketplace");
    target?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  function handleAddToCart() {
    setCartItemCount(count => count + 1);
  }

  function handleLocaleChange(option: "ENG" | "FIL") {
    setLocale(option === "ENG" ? "en" : "fil");
  }

  return (
    <div className="agrifarm-premium min-h-screen overflow-x-hidden">
      <header className="premium-nav fixed inset-x-0 top-0 z-50">
        <div className="premium-nav-frame" aria-hidden="true" />
        <div className="premium-nav-content">
          <Link href="#home" className="premium-logo" aria-label="AGRIFARM home">
            <span className="premium-logo-plaque" aria-hidden="true" />
            <span className="premium-logo-mark">
              <Leaf size={25} strokeWidth={2.4} />
            </span>
            <span>
              <span className="premium-logo-kicker">{t.logoKicker}</span>
              <strong>AGRIFARM</strong>
            </span>
          </Link>

          <nav className="premium-nav-links" aria-label="Main navigation">
            {t.nav.map((label, index) => (
              <Link key={label} href={["#marketplace", "#farmers", "#categories", "#about", "#contact"][index]}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="premium-nav-actions">
            <div className="premium-language-toggle" aria-label="Language selector">
              {(["ENG", "FIL"] as const).map(option => (
                <button
                  key={option}
                  type="button"
                  className={(locale === "en" && option === "ENG") || (locale === "fil" && option === "FIL") ? "is-active" : ""}
                  aria-pressed={(locale === "en" && option === "ENG") || (locale === "fil" && option === "FIL")}
                  onClick={() => handleLocaleChange(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {cartItemCount > 0 ? (
              <Link href="#marketplace" className="premium-cart" aria-label={`${t.cartAria}, ${cartItemCount} items`}>
                <ShoppingCart size={21} />
                <span>{cartItemCount}</span>
              </Link>
            ) : null}
            {authUser ? (
              <Link href={accountHref} className="premium-account-link">
                <UserRound size={17} />
                <span>
                  <strong>{authUser.fullName}</strong>
                  <small>{accountRole}</small>
                </span>
              </Link>
            ) : (
              <Link href="/login" className="premium-login">
                <UserRound size={17} />
                {t.login}
              </Link>
            )}
          </div>

          <button
            type="button"
            className="premium-menu-button"
            aria-label={menuOpen ? t.closeMenu : t.openMenu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <nav className={`premium-mobile-menu ${menuOpen ? "is-open" : ""}`} aria-label="Mobile navigation">
          {t.nav.map((label, index) => (
            <Link key={label} href={["#marketplace", "#farmers", "#categories", "#about", "#contact"][index]} onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}
          <div className="premium-mobile-language" aria-label="Language selector">
            {(["ENG", "FIL"] as const).map(option => (
              <button
                key={option}
                type="button"
                className={(locale === "en" && option === "ENG") || (locale === "fil" && option === "FIL") ? "is-active" : ""}
                aria-pressed={(locale === "en" && option === "ENG") || (locale === "fil" && option === "FIL")}
                onClick={() => handleLocaleChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
          {cartItemCount > 0 ? (
            <Link href="#marketplace" onClick={() => setMenuOpen(false)}>
              {t.cart} ({cartItemCount})
            </Link>
          ) : null}
          {authUser ? (
            <Link href={accountHref} onClick={() => setMenuOpen(false)}>
              {authUser.fullName} - {accountRole}
            </Link>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              {t.login}
            </Link>
          )}
        </nav>
      </header>

      <main>
        <section id="home" className="premium-hero" data-locale={locale}>
          <div className="premium-container premium-hero-grid">
            <motion.div
              className="premium-hero-copy"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <span className="premium-eyebrow">{t.heroEyebrow}</span>
              {authUser ? (
                <div className="premium-session-panel">
                  <span>{t.account.welcome}, {authUser.fullName}</span>
                  <strong>{accountRole}</strong>
                  <Link href={accountHref}>
                    {accountAction}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ) : null}
              <h1>
                <span>{t.heroTitle[0]} {t.heroTitle[1]}</span>
                <span>{t.heroTitle[2]}</span>
                <span className="premium-title-green">{t.heroTitle[3]} {t.heroTitle[4]}</span>
              </h1>
              <p>{t.heroBody}</p>

              <div className="premium-hero-highlights" aria-label="Agrifarm highlights">
                {t.heroHighlights.map((item, index) => {
                  const Icon = heroHighlightIcons[index];
                  return (
                    <div key={item.title} className="premium-hero-highlight">
                      <span className="premium-hero-highlight-icon" aria-hidden="true">
                        <Icon size={28} />
                      </span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.description}</small>
                      </span>
                    </div>
                  );
                })}
              </div>

              <form className="premium-search" onSubmit={handleSearch}>
                <div className="premium-search-frame" aria-hidden="true" />
                <label className="sr-only" htmlFor="hero-search">{t.searchLabel}</label>
                <Search className="premium-search-icon" size={22} aria-hidden="true" />
                <input
                  id="hero-search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder={t.searchPlaceholder}
                />
                <button type="submit">{t.searchButton}</button>
              </form>

              <div className="premium-hero-buttons">
                <Link href="#marketplace" className="premium-asset-button primary">
                  <ShoppingCart size={19} aria-hidden="true" />
                  {t.browseMarketplace}
                  <ArrowRight size={18} />
                </Link>
                <Link href="/register" className="premium-asset-button secondary">
                  <Store size={19} aria-hidden="true" />
                  {t.becomeSeller}
                </Link>
              </div>

            </motion.div>

            <motion.div
              className="premium-hero-visual"
              style={{ y: heroY }}
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.08 }}
            >
              <div className="premium-hero-frame" style={{ position: "relative" }}>
                <div className="premium-hero-card">
                  <span className="premium-hero-card-icon" aria-hidden="true">
                    <Leaf size={28} />
                  </span>
                  <span>{t.heroCardLabel}</span>
                  <strong>{t.heroCardValue}</strong>
                  <small>{t.heroCardSub}</small>
                </div>
              </div>
            </motion.div>

            <div className="premium-trust-row">
              {t.trustFeatures.map((feature, index) => {
                const Icon = trustIcons[index];
                return (
                  <div key={feature} className="premium-trust-item">
                    <span className="premium-trust-icon">
                      <Icon size={28} />
                    </span>
                    <span className="premium-trust-copy">
                      <strong>{feature}</strong>
                      <small>{t.trustDescriptions[index]}</small>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <MotionSection id="marketplace" className="premium-section premium-products">
          <div className="premium-container">
            <SectionHeading
              eyebrow={t.sections.marketplace.eyebrow}
              title={t.sections.marketplace.title}
              description={t.sections.marketplace.description}
            />

            <div className="premium-product-grid">
              {products.map((product, index) => (
                <motion.article
                  key={product.name}
                  className="premium-product-card"
                  whileHover={prefersReducedMotion ? undefined : { y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <span className="premium-product-frame" aria-hidden="true" />
                  <div className="premium-product-image" style={{ position: "absolute" }}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 86vw, (max-width: 1280px) 42vw, 22vw"
                    />
                  </div>
                  <div className="premium-product-body">
                    <div>
                      <span className="premium-product-subtitle">{t.products[index]?.subtitle ?? product.subtitle}</span>
                      <h3>{product.name}</h3>
                    </div>
                    <div className="premium-product-meta">
                      <span>
                        <MapPin size={14} />
                        {product.location}
                      </span>
                      <span>
                        <Star size={14} fill="currentColor" />
                        {product.rating}
                      </span>
                    </div>
                    <p>{product.seller}</p>
                    <div className="premium-product-footer">
                      <strong>{product.price}</strong>
                      <button type="button" onClick={handleAddToCart} aria-label={`${t.addToCartAria}: ${product.name}`}>
                        <ShoppingCart size={16} />
                        {t.products[index]?.add ?? "Add"}
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection id="categories" className="premium-section premium-categories">
          <div className="premium-container">
            <SectionHeading
              eyebrow={t.sections.categories.eyebrow}
              title={t.sections.categories.title}
              description={t.sections.categories.description}
            />

            <div className="premium-category-grid">
              {categories.map((category, index) => (
                <motion.a
                  key={category.name}
                  href="#marketplace"
                  className="premium-category-card"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.03, y: -4 }}
                  transition={{ duration: 0.28 }}
                >
                  <span className="premium-category-frame" aria-hidden="true" />
                  <span className="premium-category-image" style={{ position: "absolute" }}>
                    <Image src={category.image} alt="" fill sizes="(max-width: 768px) 82vw, 30vw" />
                  </span>
                  <span className="premium-category-copy">
                    <strong>{t.categories[index]?.name ?? category.name}</strong>
                    <span>{t.categories[index]?.description ?? category.description}</span>
                  </span>
                </motion.a>
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection id="about" className="premium-section premium-why">
          <div className="premium-container premium-why-grid">
            <div>
              <SectionHeading
                eyebrow={t.sections.about.eyebrow}
                title={t.sections.about.title}
                description={t.sections.about.description}
                align="left"
              />
              <div className="premium-feature-list">
                {t.trustFeatures.map((feature, index) => {
                  const Icon = trustIcons[index];
                  return (
                    <div key={feature} className="premium-feature-row">
                      <Icon size={22} />
                      <span>{feature}</span>
                      <CheckCircle2 size={18} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="premium-stat-grid premium-stat-stack">
              {stats.map((stat, index) => (
                <motion.article
                  key={stat.label}
                  className="premium-stat-card"
                  whileHover={prefersReducedMotion ? undefined : { y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  <span className="premium-stat-frame" aria-hidden="true" />
                  <strong>{stat.value}</strong>
                  <span>{t.stats[index] ?? stat.label}</span>
                </motion.article>
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection id="farmers" className="premium-section premium-farmer">
          <div className="premium-container">
            <div className="premium-farmer-card">
              <span className="premium-farmer-frame" aria-hidden="true" />
              <div className="premium-farmer-image" style={{ position: "relative" }}>
                <Image
                  src={`${CONTENT}/farmer-collective.jpg`}
                  alt="Group of Filipino farmers with a fresh vegetable harvest"
                  fill
                  loading="eager"
                  sizes="(max-width: 1024px) 88vw, 48vw"
                />
              </div>
              <div className="premium-farmer-copy">
                <span className="premium-eyebrow">{t.farmer.eyebrow}</span>
                <h2>{t.farmer.title}</h2>
                <p>{t.farmer.body}</p>
                <dl>
                  <div>
                    <dt>{t.farmer.locationLabel}</dt>
                    <dd>{t.farmer.location}</dd>
                  </div>
                  <div>
                    <dt>{t.farmer.productsLabel}</dt>
                    <dd>{t.farmer.products}</dd>
                  </div>
                </dl>
                <Link href="/register" className="premium-asset-button primary compact">
                  {t.farmer.cta}
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </MotionSection>

        <MotionSection className="premium-section premium-benefits">
          <div className="premium-container">
            <SectionHeading
              eyebrow={t.sections.benefits.eyebrow}
              title={t.sections.benefits.title}
              description={t.sections.benefits.description}
            />
            <div className="premium-benefit-grid">
              {marketplaceBenefits.map((benefit, index) => {
                const Icon = benefitIcons[index];
                return (
                  <article key={benefit} className="premium-benefit-card">
                    <Icon size={25} />
                    <h3>{t.benefits[index] ?? benefit}</h3>
                    <p>{t.benefitBody}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </MotionSection>

        <MotionSection className="premium-section premium-cta">
          <div className="premium-container">
            <div className="premium-cta-panel">
              <div>
                <span className="premium-eyebrow">{t.cta.eyebrow}</span>
                <h2>{t.cta.title}</h2>
                <p>{t.cta.body}</p>
              </div>
              <div className="premium-cta-actions">
                <Link href="#marketplace" className="premium-asset-button primary">
                  {t.cta.shop}
                  <ArrowRight size={18} />
                </Link>
                <Link href="/register" className="premium-asset-button success">
                  {t.cta.seller}
                </Link>
              </div>
            </div>
          </div>
        </MotionSection>
      </main>

      <footer id="contact" className="premium-footer">
        <div className="premium-footer-frame" aria-hidden="true" />
        <div className="premium-container premium-footer-grid">
          <div className="premium-footer-brand">
            <strong>AGRIFARM</strong>
            <p>{t.footer.brand}</p>
          </div>
          <div>
            <h3>{t.footer.marketplace}</h3>
            <Link href="#marketplace">{t.footer.featured}</Link>
            <Link href="#categories">{t.footer.categories}</Link>
            <Link href="#farmers">{t.footer.farmers}</Link>
          </div>
          <div>
            <h3>{t.footer.contact}</h3>
            <span><Phone size={16} /> +63 912 365 5768</span>
            <span><Mail size={16} /> hello@agrifarm.ph</span>
            <span><MapPin size={16} /> Philippines</span>
          </div>
          <div>
            <h3>{t.footer.newsletter}</h3>
            <p>{t.footer.newsletterBody}</p>
            <form className="premium-newsletter" onSubmit={event => event.preventDefault()}>
              <label className="sr-only" htmlFor="newsletter-email">{t.footer.emailLabel}</label>
              <input id="newsletter-email" type="email" placeholder={t.footer.emailPlaceholder} />
              <button type="submit" aria-label={t.footer.subscribe}>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
        <p className="premium-copyright">&copy; {year} AGRIFARM. {t.footer.copyright}</p>
      </footer>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "center" | "left";
}) {
  return (
    <div className={`premium-section-heading premium-heading-compact ${align === "left" ? "is-left" : ""}`}>
      <span className="premium-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
