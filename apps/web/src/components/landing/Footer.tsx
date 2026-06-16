import { footerGroups, footerContact } from "@/data/landing";

const SOCIAL = [
  { label: "f", aria: "Facebook" },
  { label: "ig", aria: "Instagram" },
  { label: "tw", aria: "Twitter" },
];

const CONTACT = [
  { icon: "TEL", value: footerContact.phone },
  { icon: "@", value: footerContact.email },
  { icon: "PIN", value: footerContact.address },
];

export function Footer() {
  return (
    <footer
      id="contact"
      className="footer-carved relative w-full overflow-hidden px-6 pb-14 pt-12 sm:px-10 lg:px-14"
    >
      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
        <div>
          <div className="footer-brand mb-5">
            <span
              className="font-engraved text-xs font-black uppercase tracking-[0.22em]"
              style={{ color: "#C89A42" }}
            >
              Barangay
            </span>
            <strong
              className="font-carved text-2xl font-black uppercase"
              style={{
                color: "#F6DF9A",
                textShadow: "0 2px 0 #2A1408, 0 4px 12px rgba(0,0,0,0.8)",
              }}
            >
              Harvest
            </strong>
          </div>
          <p
            className="max-w-[260px] text-sm font-semibold leading-7"
            style={{ color: "#C8A058" }}
          >
            Sariwang ani mula sa ating barangay, hatid sa iyong tahanan.
          </p>
          <div className="mt-5 flex gap-2">
            {SOCIAL.map(s => (
              <a key={s.label} href="#home" aria-label={s.aria} className="social-carve">
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {footerGroups.map(group => (
          <div key={group.title}>
            <h3
              className="font-carved mb-5 text-lg font-black uppercase"
              style={{
                color: "#F5DDA2",
                textShadow: "0 2px 0 #2A1408",
              }}
            >
              {group.title}
            </h3>
            <ul className="grid gap-3">
              {group.links.map(link => (
                <li key={link}>
                  <a href="#home" className="footer-link">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3
            className="font-carved mb-5 text-lg font-black uppercase"
            style={{ color: "#F5DDA2", textShadow: "0 2px 0 #2A1408" }}
          >
            {footerContact.title}
          </h3>
          <ul className="grid gap-4">
            {CONTACT.map(row => (
              <li key={row.value} className="flex items-start gap-3">
                <span className="contact-glyph" aria-hidden="true">
                  {row.icon}
                </span>
                <span
                  className="text-sm font-bold break-all"
                  style={{ color: "#C8A058" }}
                >
                  {row.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
