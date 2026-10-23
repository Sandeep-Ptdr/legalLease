import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BookType,
  Check,
  ClipboardCheck,
  Home,
  Info,
  Landmark,
  Menu,
  MessageCircle,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react";
import "./App.css";

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");
const examples = [
  "What is a rental agreement?",
  "What should I check before signing a lease?",
  "What is a security deposit?",
  "Who is responsible for maintenance?",
];

const pages = [
  { id: "home", label: "Home", icon: Home },
  { id: "ask", label: "Ask LegalLease", icon: MessageCircle },
  { id: "basics", label: "Lease Basics", icon: BookOpen },
  { id: "tenant-rights", label: "Tenant Rights", icon: ShieldCheck },
  { id: "landlord-rights", label: "Landlord Rights", icon: Landmark },
  { id: "checklists", label: "Documents & Checklists", icon: ClipboardCheck },
  { id: "glossary", label: "Legal Glossary", icon: BookType },
  { id: "about", label: "About the Project", icon: Info },
];

const glossaryTerms = [
  [
    "Agreement",
    "A written or oral arrangement between parties. The rental-agreement materials recommend recording important terms clearly in writing.",
  ],
  [
    "Deposit",
    "Money held under the terms of an agreement. The repository does not verify one universal deposit cap or refund period for residential rentals across India.",
  ],
  [
    "Lessee",
    "The person who accepts the right to enjoy immovable property under a lease. Commonly called the tenant.",
  ],
  [
    "Lessor",
    "The person who transfers the right to enjoy immovable property under a lease. Commonly called the landlord.",
  ],
  [
    "Lease",
    "Under Section 105 of the Transfer of Property Act, 1882, a transfer of a right to enjoy immovable property for a specified time or in perpetuity, for consideration.",
  ],
  [
    "Notice",
    "A communication used for a purpose such as ending a tenancy. Notice form and timing depend on the agreement and applicable local law; Section 106 provides conditional default rules.",
  ],
  [
    "Premium",
    "Consideration paid or promised for a lease, as described in Section 105 of the Transfer of Property Act, 1882.",
  ],
  [
    "Rent",
    "Periodic or otherwise agreed consideration for a lease. Payment timing and records should be checked against the agreement and applicable law.",
  ],
  [
    "Security deposit",
    "An amount agreed between the parties as security, subject to the agreement and applicable law. Model Tenancy Act proposals are not automatically applicable law.",
  ],
  [
    "Stamp duty",
    "A charge governed by applicable stamp legislation. Rates and procedures can differ by State/UT and should be confirmed with current official sources.",
  ],
  [
    "Tenancy",
    "The arrangement under which a tenant occupies or uses property under agreed terms and applicable law.",
  ],
];

export default function App() {
  const [page, setPage] = useState(
    () => window.location.hash.replace(/^#\/?/, "") || "home",
  );
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("legallease-theme");
    return (
      saved ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
    );
  });

  useEffect(() => {
    const updatePage = () => {
      const route = window.location.hash.replace(/^#\/?/, "") || "home";
      setPage(pages.some((item) => item.id === route) ? route : "home");
      setDrawerOpen(false);
    };
    window.addEventListener("hashchange", updatePage);
    return () => window.removeEventListener("hashchange", updatePage);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("legallease-theme", theme);
  }, [theme]);

  const activePage = pages.find((item) => item.id === page) || pages[0];

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {drawerOpen && (
        <button
          className="drawer-scrim"
          type="button"
          aria-label="Close navigation"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <aside
        className={`sidebar ${drawerOpen ? "drawer-open" : ""}`}
        aria-label="Main navigation"
      >
        <a className="brand" href="#/home" aria-label="LegalLease home">
          <span className="brand-mark" aria-hidden="true">
            §
          </span>
          <span className="brand-copy">
            <span className="brand-name">LegalLease</span>
            <span className="brand-caption">RENTAL KNOWLEDGE</span>
          </span>
        </a>
        <div className="nav-label">WORKSPACE</div>
        <nav className="primary-nav">
          {pages.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#/${id}`}
              className={`nav-link ${page === id ? "active" : ""}`}
              aria-current={page === id ? "page" : undefined}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </a>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-note">
          <span className="note-mark">i</span>
          <p>Educational information only. Not legal advice.</p>
        </div>
        <button
          className="sidebar-toggle"
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
          <span>{collapsed ? "Expand menu" : "Collapse menu"}</span>
        </button>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            type="button"
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            <span>LEGALLEASE</span>
            <span aria-hidden="true">/</span>
            <strong>{activePage.label}</strong>
          </div>
          <button
            className="icon-button theme-toggle"
            type="button"
            onClick={() =>
              setTheme((value) => (value === "dark" ? "light" : "dark"))
            }
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
          <button
            className="icon-button mobile-close"
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
          >
            <X size={20} />
          </button>
        </header>
        <main id="main-content" className="page-content" tabIndex="-1">
          {page === "home" && <HomePage />}
          {page === "ask" && <ChatPage />}
          {page === "basics" && <BasicsPage />}
          {page === "tenant-rights" && <TenantRightsPage />}
          {page === "landlord-rights" && <LandlordRightsPage />}
          {page === "checklists" && <ChecklistsPage />}
          {page === "glossary" && <GlossaryPage />}
          {page === "about" && <AboutPage />}
        </main>
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, children }) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{children}</p>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <>
      <PageHeading
        eyebrow="LEGALLEASE · PROJECT DESK"
        title="Rental knowledge, made easier to navigate."
      >
        A practical learning workspace for residential leases, tenant and
        landlord topics, and source-aware questions.
      </PageHeading>
      <section className="dashboard-intro" aria-labelledby="dashboard-welcome">
        <div>
          <span className="eyebrow">ACADEMIC PROJECT</span>
          <h2 id="dashboard-welcome">
            Understand the agreement before the conversation.
          </h2>
          <p>
            Start with the lease essentials, explore jurisdiction-aware topics,
            or ask the assistant a question grounded in the project’s local
            reference material.
          </p>
          <a className="primary-link" href="#/ask">
            Ask LegalLease <ArrowRight size={16} />
          </a>
        </div>
        <div className="intro-side">
          <span className="intro-symbol" aria-hidden="true">
            §
          </span>
          <span className="mono-label">INDIA · GUJARAT CONTEXT</span>
          <span className="small-muted">
            Rules can vary by location and change over time.
          </span>
        </div>
      </section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h2>Choose a starting point</h2>
        </div>
        <span className="section-meta">8 PROJECT SECTIONS</span>
      </div>
      <section className="destination-grid" aria-label="Project sections">
        <DestinationCard
          href="#/ask"
          icon={MessageCircle}
          number="01"
          title="Ask LegalLease"
          text="Ask a rental question and inspect where the answer came from."
          accent="green"
        />
        <DestinationCard
          href="#/basics"
          icon={BookOpen}
          number="02"
          title="Lease Basics"
          text="Review core lease concepts and general central-law context."
        />
        <DestinationCard
          href="#/tenant-rights"
          icon={ShieldCheck}
          number="03"
          title="Tenant Rights"
          text="Explore sourced tenant topics, with Gujarat applicability caveats."
          accent="gold"
        />
        <DestinationCard
          href="#/landlord-rights"
          icon={Landmark}
          number="04"
          title="Landlord Rights"
          text="Understand responsibilities, limits, and points to verify locally."
        />
        <DestinationCard
          href="#/checklists"
          icon={ClipboardCheck}
          number="05"
          title="Documents & Checklists"
          text="Use practical prompts to prepare for reviewing a rental agreement."
        />
        <DestinationCard
          href="#/glossary"
          icon={BookType}
          number="06"
          title="Legal Glossary"
          text="Browse plain-language definitions of common lease terms."
          accent="gold"
        />
        <DestinationCard
          href="#/about"
          icon={Info}
          number="07"
          title="About the Project"
          text="See the academic project scope, architecture, and limitations."
        />
      </section>
      <Notice tone="caution">
        <strong>Keep jurisdiction in view.</strong> This workspace draws on
        general Indian materials and Gujarat-focused documents. Applicability
        depends on the property, agreement, current local law, and facts.
      </Notice>
    </>
  );
}

function DestinationCard({
  href,
  icon: Icon,
  number,
  title,
  text,
  accent = "",
}) {
  return (
    <a className={`destination-card ${accent}`} href={href}>
      <div className="destination-top">
        <span className="destination-icon">
          <Icon size={19} strokeWidth={1.8} />
        </span>
        <span className="destination-number">{number}</span>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <span className="card-arrow" aria-hidden="true">
        <ArrowUpRight size={17} />
      </span>
    </a>
  );
}

function Notice({ children, tone = "plain" }) {
  return (
    <aside className={`notice ${tone}`}>
      <span className="notice-symbol" aria-hidden="true">
        {tone === "caution" ? "!" : "i"}
      </span>
      <p>{children}</p>
    </aside>
  );
}

function SourceList({ sources }) {
  return (
    <div className="source-list">
      {sources.map(([label, url, detail]) => {
        const content = (
          <>
            <span>
              {label}
              {detail && <small>{detail}</small>}
            </span>
            {url && <ArrowUpRight size={15} aria-hidden="true" />}
          </>
        );
        return url ? (
          <a key={label} href={url} target="_blank" rel="noreferrer">
            {content}
          </a>
        ) : (
          <div className="source-reference" key={label}>
            {content}
          </div>
        );
      })}
    </div>
  );
}

function BasicsPage() {
  return (
    <>
      <PageHeading eyebrow="REFERENCE · INDIA" title="Lease Basics">
        A short orientation to the concepts covered in the project’s local
        lease-basics document. These are general central-law materials, not a
        complete statement of local tenancy law.
      </PageHeading>
      <Notice tone="caution">
        <strong>Jurisdiction matters.</strong> The source document notes that
        State/UT tenancy, rent-control, registration, and stamp-duty rules may
        supplement or change the general rules.
      </Notice>
      <div className="content-grid">
        <section className="content-section">
          <span className="section-index">01 / CONCEPT</span>
          <h2>What is a lease?</h2>
          <p>
            Section 105 of the Transfer of Property Act, 1882 describes a lease
            as a transfer of a right to enjoy immovable property for a specified
            time, express or implied, or in perpetuity, in consideration of
            value paid or promised.
          </p>
          <p>
            The person transferring the right is the{" "}
            <a href="#/glossary">lessor</a>; the person accepting it is the{" "}
            <a href="#/glossary">lessee</a>. In everyday use, these are commonly
            called landlord and tenant.
          </p>
        </section>
        <section className="content-section">
          <span className="section-index">02 / DURATION & NOTICE</span>
          <h2>Default rules have conditions</h2>
          <p>
            Section 106 provides default rules where there is no contract, local
            law, or usage to the contrary. For purposes other than agriculture
            or manufacturing, it describes a month-to-month default with a
            fifteen-day written notice rule.
          </p>
          <p>
            This is not an automatic rule for every residential tenancy. The
            agreement and applicable State/UT law can change the analysis.
          </p>
        </section>
        <section className="content-section">
          <span className="section-index">03 / DOCUMENTS</span>
          <h2>Registration and execution</h2>
          <p>
            Sections 107 of the Transfer of Property Act and 17(1)(d) of the
            Registration Act address registration for leases from year to year,
            over one year, or reserving yearly rent, subject to statutory
            qualifications and exceptions.
          </p>
          <p>
            Stamp duty, fees, procedures, and local requirements can vary.
            Confirm current requirements with the relevant official State/UT
            source for the property.
          </p>
        </section>
        <section className="content-section">
          <span className="section-index">04 / RESPONSIBILITIES</span>
          <h2>Record what each party agrees to do</h2>
          <p>
            Section 108 sets out lessor and lessee rights and liabilities in the
            absence of a contrary contract or local usage, and only as
            applicable. It covers topics such as disclosure of certain material
            defects, rent payment, care of the property, and limited inspection
            access.
          </p>
          <p>
            Practical responsibilities for repairs, utilities, access, and
            handover should be read alongside the actual agreement and local
            law.
          </p>
        </section>
      </div>
      <SourceList
        sources={[
          [
            "Transfer of Property Act, 1882 · Sections 105–108",
            "https://www.indiacode.nic.in/bitstream/123456789/14648/1/tpa.pdf",
            "India Code · cited by the lease-basics source document",
          ],
          [
            "Registration Act, 1908 · Section 17",
            "https://www.indiacode.nic.in/bitstream/123456789/14646/1/ra1908-16.pdf",
            "India Code · registration reference",
          ],
          [
            "Lease Basics source document",
            null,
            "Local project knowledge base · status checked 8 October 2026",
          ],
        ]}
      />
    </>
  );
}

function TenantRightsPage() {
  return (
    <>
      <PageHeading eyebrow="REFERENCE · GUJARAT, INDIA" title="Tenant Rights">
        Topics summarized from the project’s Gujarat tenant-rights document.
        Applicability of the cited rent-control provisions must be checked for
        the particular premises.
      </PageHeading>
      <Notice tone="caution">
        <strong>Gujarat-specific source, not a universal rule.</strong> The
        source notes exemptions and uncertainty about current applicability. It
        does not treat the Gujarat Rent Bill, 2026 or the Model Tenancy Act,
        2021 as enacted, applicable Gujarat law.
      </Notice>
      <div className="topic-list">
        <Topic
          number="01"
          title="Rent receipts"
          badge="Gujarat · conditional"
          text="Section 26 of the Gujarat Rents, Hotel and Lodging House Rates Control Act, 1947 addresses written receipts for amounts received in respect of covered premises. Check whether the Act applies to the particular property."
        />
        <Topic
          number="02"
          title="Essential services"
          badge="Gujarat · conditional"
          text="Section 24 addresses cutting off or withholding an essential supply or service without just or sufficient cause, subject to the Act’s applicability and statutory conditions."
        />
        <Topic
          number="03"
          title="Repairs and maintenance"
          badge="Gujarat · conditional"
          text="Section 23 is identified in the source as addressing a landlord’s duty to keep premises in good repair. The current scope and mechanism depend on the law and premises involved."
        />
        <Topic
          number="04"
          title="Possession protections"
          badge="Gujarat · conditional"
          text="Section 12 contains restrictions on recovery of possession of covered premises, subject to statutory grounds and conditions. The source warns not to assume that all Gujarat tenancies are covered."
        />
        <Topic
          number="05"
          title="Tenant responsibilities"
          badge="Central law · default"
          text="Section 108 of the Transfer of Property Act includes applicable default duties such as paying rent as required, taking care of the property, and returning possession subject to statutory rules."
        />
        <Topic
          number="06"
          title="Keep a clear record"
          badge="Practical · educational"
          text="The local source recommends keeping the signed agreement, rent and deposit records, condition notes, repair communications, notices, and handover evidence. These are practical recommendations, not universal statutory requirements."
        />
      </div>
      <h2 className="subsection-title">Sources in the project</h2>
      <SourceList
        sources={[
          [
            "Gujarat Rents, Hotel and Lodging House Rates Control Act, 1947",
            "https://www.indiacode.nic.in/bitstream/123456789/4655/1/rentshotelact.pdf",
            "India Code · Sections 12, 23, 24, 26 and 28",
          ],
          [
            "Transfer of Property Act, 1882",
            "https://www.indiacode.nic.in/bitstream/123456789/14648/1/tpa.pdf",
            "India Code · Section 108",
          ],
          [
            "Tenant Rights source document",
            null,
            "Local project knowledge base · status checked 8 October 2026",
          ],
        ]}
      />
    </>
  );
}

function LandlordRightsPage() {
  return (
    <>
      <PageHeading eyebrow="REFERENCE · GUJARAT, INDIA" title="Landlord Rights">
        A source-aware overview of landlord topics in the local project
        material, including where the source explicitly says the current rule
        was not verified.
      </PageHeading>
      <Notice tone="caution">
        <strong>Do not assume one rule applies to every property.</strong> The
        source highlights property exemptions, agreement terms, and unresolved
        current-law questions. Confirm the governing law and facts before
        relying on a rule.
      </Notice>
      <div className="topic-list">
        <Topic
          number="01"
          title="Access and inspection"
          badge="Not verified · Gujarat-wide rule"
          text="The source does not verify a general Gujarat-specific statutory inspection notice period. Entry can depend on the tenancy agreement and applicable local law. Section 108(m) of the Transfer of Property Act describes limited inspection access at reasonable times, subject to its terms."
        />
        <Topic
          number="02"
          title="Maintenance and repairs"
          badge="Conditional · property-specific"
          text="Section 23 of the Gujarat rent-control Act is identified as addressing landlord repair duties. Its applicability in 2026 must be established for the particular premises; the source also warns against treating the Model Tenancy Act as Gujarat law without verified adoption."
        />
        <Topic
          number="03"
          title="Rent and payment defaults"
          badge="Agreement + applicable law"
          text="The source does not verify a current Gujarat-wide rent-increase rule or arrears procedure for every residential tenancy. These issues may depend on the governing tenancy law, agreement, property, and facts."
        />
        <Topic
          number="04"
          title="Ending a tenancy"
          badge="Conditional · not automatic eviction"
          text="Section 106 of the Transfer of Property Act provides conditional default notice rules when no contrary contract, local law, or usage applies. The source cautions against treating this as an unconditional eviction rule. A landlord should not be described as having an automatic right to physically remove a tenant without the applicable legal process."
        />
        <Topic
          number="05"
          title="Security deposits"
          badge="Not verified · universal cap"
          text="The source does not verify a current Gujarat-wide statutory deposit cap, refund period, or universal deductions procedure for ordinary residential tenancies. The agreement and applicable current law need to be checked."
        />
        <Topic
          number="06"
          title="Dispute routes"
          badge="Depends on governing law"
          text="The proper forum depends on the applicable tenancy legislation, property, and dispute. The Model Tenancy Act’s proposed Rent Authority/Court/Tribunal structure must not be represented as the current Gujarat system without verified adoption."
        />
      </div>
      <h2 className="subsection-title">Sources in the project</h2>
      <SourceList
        sources={[
          [
            "Transfer of Property Act, 1882",
            "https://www.indiacode.nic.in/bitstream/123456789/14037/1/transfer_of_property_act8_%281%29.pdf",
            "India Code · Sections 105–108",
          ],
          [
            "Gujarat Rents, Hotel and Lodging House Rates Control Act, 1947",
            "https://www.indiacode.nic.in/bitstream/123456789/4655/1/rentshotelact.pdf",
            "India Code · applicability and exemptions need checking",
          ],
          [
            "Landlord Rights source document",
            null,
            "Local project knowledge base · status checked 8 October 2026",
          ],
        ]}
      />
    </>
  );
}

function Topic({ number, title, badge, text }) {
  return (
    <article className="topic-row">
      <span className="topic-number">{number}</span>
      <div className="topic-copy">
        <div className="topic-title">
          <h2>{title}</h2>
          <span className="topic-badge">{badge}</span>
        </div>
        <p>{text}</p>
      </div>
    </article>
  );
}

const checklistGroups = [
  {
    title: "Before signing",
    items: [
      "Confirm the full names of the parties and identify the property clearly.",
      "Write down the start date, agreed term, rent amount, due date, and payment method.",
      "Review the deposit amount and the agreed return or adjustment terms.",
      "Clarify utility, service-charge, repair, and maintenance responsibilities.",
      "Review notice, termination, renewal, and access arrangements.",
      "Check whether registration or stamp-duty requirements apply to this transaction.",
      "Record included furniture, appliances, and the property condition at handover.",
    ],
  },
  {
    title: "Keep during the tenancy",
    items: [
      "Keep a signed agreement and payment confirmations or rent receipts.",
      "Save deposit records, notices, and written communications about changes.",
      "Record repair requests and responses in a durable format.",
      "Keep utility and other agreed charge records where practical.",
    ],
  },
  {
    title: "At handover",
    items: [
      "Record the date possession and keys are returned.",
      "Compare the property condition with the move-in record, allowing for the agreement and applicable law.",
      "Keep written records of any proposed deposit deductions or adjustments.",
      "Retain copies of final payments and communications.",
    ],
  },
];

function ChecklistsPage() {
  const [checked, setChecked] = useState({});
  const [showChecked, setShowChecked] = useState(true);
  const total = checklistGroups.reduce(
    (sum, group) => sum + group.items.length,
    0,
  );
  const completed = Object.values(checked).filter(Boolean).length;
  return (
    <>
      <PageHeading
        eyebrow="PRACTICAL TOOL · EDUCATIONAL"
        title="Documents & Checklists"
      >
        Use these prompts to organize a lease review and keep useful records.
        They are based on the project’s rental-agreement and tenant-rights
        material, not a guarantee of legal compliance.
      </PageHeading>
      <Notice tone="caution">
        <strong>Educational checklist, not legal advice.</strong> No single
        agreement format or list is legally required for every tenancy.
        Requirements depend on current local law, the property, and the
        agreement.
      </Notice>
      <div className="checklist-controls">
        <span className="progress-copy">
          <Check size={16} /> {completed} of {total} items checked
        </span>
        <button
          type="button"
          className="text-button"
          onClick={() => setShowChecked((value) => !value)}
        >
          {showChecked ? "Hide" : "Show"} completed
        </button>
      </div>
      <div className="checklist-groups">
        {checklistGroups.map((group, groupIndex) => (
          <section className="checklist-group" key={group.title}>
            <div className="checklist-heading">
              <span className="section-index">
                0{groupIndex + 1} / EDUCATIONAL CHECKLIST
              </span>
              <h2>{group.title}</h2>
            </div>
            <ul>
              {group.items.map((item, itemIndex) => {
                const id = `${groupIndex}-${itemIndex}`;
                return (
                  (showChecked || !checked[id]) && (
                    <li key={id}>
                      <label className={checked[id] ? "is-checked" : ""}>
                        <input
                          type="checkbox"
                          checked={Boolean(checked[id])}
                          onChange={(event) =>
                            setChecked((value) => ({
                              ...value,
                              [id]: event.target.checked,
                            }))
                          }
                        />
                        <span className="custom-check" aria-hidden="true">
                          <Check size={13} />
                        </span>
                        <span>{item}</span>
                      </label>
                    </li>
                  )
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      <div className="related-links">
        <a href="#/basics">
          Review lease basics <ArrowRight size={16} />
        </a>
        <a href="#/tenant-rights">
          Browse tenant topics <ArrowRight size={16} />
        </a>
      </div>
    </>
  );
}

function GlossaryPage() {
  const [query, setQuery] = useState("");
  const filtered = glossaryTerms.filter(([term, definition]) =>
    `${term} ${definition}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading eyebrow="REFERENCE · PLAIN LANGUAGE" title="Legal Glossary">
        Browse key words from the local lease and rental materials. Definitions
        are general explanations and do not replace the cited laws or a
        jurisdiction-specific review.
      </PageHeading>
      <label className="search-field">
        <Search size={18} aria-hidden="true" />
        <span className="sr-only">Search glossary</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a term or phrase"
        />
      </label>
      <p className="results-count" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "term" : "terms"}
      </p>
      {filtered.length ? (
        <dl className="glossary-list">
          {filtered.map(([term, definition]) => (
            <div className="glossary-entry" key={term}>
              <dt>{term}</dt>
              <dd>{definition}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="empty-state">No matching terms. Try a broader search.</p>
      )}
      <Notice>
        <strong>Definitions are context-sensitive.</strong> Terms may have a
        specific meaning under a particular statute, contract, or jurisdiction.
      </Notice>
    </>
  );
}

function AboutPage() {
  return (
    <>
      <PageHeading eyebrow="ACADEMIC PROJECT" title="About LegalLease">
        A small educational project exploring how a local knowledge base and
        retrieval workflow can support questions about renting and lease
        agreements in India.
      </PageHeading>
      <section className="about-lead">
        <span className="eyebrow">PROJECT PURPOSE</span>
        <p>
          LegalLease organizes introductory rental information and provides a
          chat interface that can retrieve relevant local passages, identify
          sources, and fall back to web search when local material is
          insufficient.
        </p>
      </section>
      <div className="about-grid">
        <section className="about-section">
          <span className="section-index">01 / PROBLEM STATEMENT</span>
          <h2>Rental information is difficult to navigate.</h2>
          <p>
            People reviewing rental agreements encounter unfamiliar terms,
            jurisdiction-specific rules, and scattered reference material. This
            project presents a learning-oriented starting point; it does not
            decide what law applies to a specific tenancy.
          </p>
        </section>
        <section className="about-section">
          <span className="section-index">02 / OBJECTIVES</span>
          <h2>Make material easier to explore.</h2>
          <ul>
            <li>Organize introductory lease and rental topics.</li>
            <li>
              Preserve visible source information and jurisdiction caveats.
            </li>
            <li>
              Demonstrate a retrieval-augmented question-and-answer workflow.
            </li>
            <li>Keep the experience educational and communicate its limits.</li>
          </ul>
        </section>
      </div>
      <section className="architecture-section">
        <div className="architecture-heading">
          <span className="section-index">03 / HIGH-LEVEL ARCHITECTURE</span>
          <h2>From question to sourced response</h2>
          <p>
            Frontend and Express API remain separate. The diagram describes the
            current repository implementation.
          </p>
        </div>
        <div
          className="architecture-flow"
          aria-label="Question flows from React frontend to Express API, local retrieval, optional web search and optional Groq generation, then returns with source metadata"
        >
          <div className="flow-node">
            <span>01</span>
            <strong>React + Vite</strong>
            <small>Chat and reference UI</small>
          </div>
          <ArrowRight className="flow-arrow" size={18} />
          <div className="flow-node">
            <span>02</span>
            <strong>Express API</strong>
            <small>/api/chat · /api/rag/status</small>
          </div>
          <ArrowRight className="flow-arrow" size={18} />
          <div className="flow-node">
            <span>03</span>
            <strong>Local RAG</strong>
            <small>Embeddings + lexical scoring</small>
          </div>
          <ArrowRight className="flow-arrow" size={18} />
          <div className="flow-node alternate">
            <span>04</span>
            <strong>Fallback / draft</strong>
            <small>Web search; optional Groq</small>
          </div>
        </div>
      </section>
      <div className="about-grid">
        <section className="about-section">
          <span className="section-index">04 / RAG WORKFLOW</span>
          <h2>Local first, with explicit fallbacks</h2>
          <ol>
            <li>
              The backend loads precomputed records from{" "}
              <code>backend/data/embeddings/embeddings.json</code>.
            </li>
            <li>
              Queries are embedded using a local 256-dimensional hashed
              bag-of-words function; cosine similarity and lexical overlap rank
              passages.
            </li>
            <li>
              When relevant local chunks are found, they are cited in the
              response. Optional Groq can draft an answer from those excerpts;
              without it, the backend returns extractive local information.
            </li>
            <li>
              When local retrieval has no usable chunks, the backend attempts
              DuckDuckGo HTML web search. Results are labeled as web sources;
              optional Groq may draft from snippets.
            </li>
            <li>
              The API returns answer, source type, sources, and retrieval
              metadata for the chat UI.
            </li>
          </ol>
        </section>
        <section className="about-section">
          <span className="section-index">05 / DATA SOURCES</span>
          <h2>What the project currently uses</h2>
          <ul>
            <li>
              <code>backend/data/knowledge-base.json</code> for structured
              knowledge entries.
            </li>
            <li>
              Plain-text documents in <code>backend/data/documents/</code>,
              including lease basics, rental agreements, tenant rights, and
              landlord rights.
            </li>
            <li>
              Generated embedding records in{" "}
              <code>backend/data/embeddings/</code>.
            </li>
            <li>
              External web-search results only as fallback snippets and links,
              not as verified legal conclusions.
            </li>
          </ul>
          <p>
            The source documents cite India Code and other references and state
            a checked date of 8 October 2026. Verify current official sources
            before relying on legal information.
          </p>
        </section>
      </div>
      <section className="limitations-section">
        <span className="section-index">06 / LIMITATIONS</span>
        <h2>What this project does not establish</h2>
        <ul>
          <li>
            It is not legal advice, a legal service, or a determination of which
            law applies.
          </li>
          <li>
            Source coverage is limited; retrieval may miss relevant material or
            return incomplete passages.
          </li>
          <li>
            Search snippets may be incomplete or out of date and are not treated
            as verified legal authority.
          </li>
          <li>
            Optional generated answers can be wrong despite source grounding;
            check consequential matters against current official material or a
            qualified lawyer.
          </li>
          <li>
            MongoDB is optional and only saves chat history when configured; the
            application continues without it.
          </li>
        </ul>
      </section>
      <section className="future-section">
        <span className="section-index">07 / FUTURE IMPROVEMENTS</span>
        <h2>Possible next steps</h2>
        <p>
          Broader and regularly reviewed primary-source coverage; clearer
          source-update workflows; jurisdiction-specific retrieval evaluation;
          and systematic testing of retrieval quality and answer grounding.
        </p>
      </section>
      <Notice tone="caution">
        <strong>Educational information only.</strong> LegalLease provides
        general educational information, not legal advice. Laws vary by
        jurisdiction and can change.
      </Notice>
    </>
  );
}

function ChatPage() {
  const [jurisdiction, setJurisdiction] = useState("India");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [systemStatus, setSystemStatus] = useState("Checking knowledge base");
  const feed = useRef(null);
  const textarea = useRef(null);

  useEffect(() => {
    let active = true;
    fetch(`${API}/rag/status`)
      .then((response) => response.json())
      .then((status) => {
        if (active)
          setSystemStatus(
            status.ready
              ? "Local knowledge ready · web fallback"
              : "Knowledge base unavailable",
          );
      })
      .catch(() => {
        if (active) setSystemStatus("API unavailable");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const panel = feed.current;
    if (panel) panel.scrollTo({ top: panel.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const field = textarea.current;
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, 144)}px`;
  }, [input]);

  async function ask(value = input) {
    const message = value.trim();
    if (!message || loading) return;
    setInput("");
    setError("");
    setLoading(true);
    setMessages((current) => [...current, { role: "user", text: message }]);
    try {
      const history = messages
        .slice(-6)
        .map((entry) => ({
          role: entry.role,
          content: (entry.text || entry.answer || "").slice(0, 1200),
        }));
      const response = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, jurisdiction, history }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          data.message || "The assistant could not answer. Please try again.",
        );
      setMessages((current) => [...current, { role: "assistant", ...data }]);
    } catch (err) {
      setError(
        err.message ||
          "Could not reach the backend. Check that the server is running and try again.",
      );
    } finally {
      setLoading(false);
      textarea.current?.focus();
    }
  }

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      ask();
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="ASK LEGALLEASE"
        title="A question, with its sources."
      >
        Ask about rental agreements and leases. Choose a jurisdiction as
        context; the assistant’s response is general educational information.
      </PageHeading>
      <section className="chat-toolbar" aria-label="Chat settings">
        <span className="ready">
          <span className="status-dot" />
          {systemStatus}
        </span>
        <label>
          JURISDICTION
          <select
            value={jurisdiction}
            onChange={(event) => setJurisdiction(event.target.value)}
          >
            <option>India</option>
            <option>Gujarat</option>
          </select>
        </label>
      </section>
      <section className="chat-panel" aria-label="Chat with LegalLease">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <span className="chat-mark" aria-hidden="true">
              §
            </span>
            <h2>What would you like to understand?</h2>
            <p>Try a suggested question or write your own.</p>
            <div className="examples">
              {examples.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => ask(question)}
                  disabled={loading}
                >
                  {question}
                  <ArrowUpRight size={14} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="feed"
            ref={feed}
            aria-live="polite"
            aria-relevant="additions text"
          >
            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={message.role}
              >
                <b aria-hidden="true">{message.role === "user" ? "Y" : "§"}</b>
                <div className="bubble">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.text || message.answer || ""}
                  </ReactMarkdown>
                  {message.role === "assistant" && (
                    <>
                      <em>
                        {message.sourceType === "out_of_scope"
                          ? "Outside my scope"
                          : `${message.sourceType === "web" ? "Live web search fallback" : message.sourceType === "local" ? "Local knowledge base" : "No relevant sources found"} · ${message.retrieval?.generation === "groq" ? "Groq-assisted" : "source-grounded"}`}
                      </em>
                      {/* {!!message.sources?.length && (
                        <div className="sources">
                          {message.sources.map((source, sourceIndex) => (
                            <span
                              className={`source ${source.type || ""}`}
                              key={`${source.name || source.title}-${sourceIndex}`}
                            >
                              {source.url ? (
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  ↗ {source.name || source.title}
                                </a>
                              ) : (
                                <span>{source.name || source.title}</span>
                              )}
                              {source.page ? ` · Page ${source.page}` : ""}
                            </span>
                          ))}
                        </div>
                      )} */}
                      {/* <details>
                        <summary>How this answer was sourced</summary>
                        <span>
                          Mode: {message.retrieval?.mode || "unknown"} · Local
                          passages: {message.retrieval?.chunkCount ?? 0} · Web
                          search:{" "}
                          {message.retrieval?.webSearchUsed
                            ? "used"
                            : "not needed"}{" "}
                          · Drafting:{" "}
                          {message.retrieval?.generation || "source-grounded"}
                        </span>
                      </details> */}
                    </>
                  )}
                </div>
              </article>
            ))}
            {loading && (
              <article
                className="assistant"
                aria-label="Assistant is responding"
              >
                <b aria-hidden="true">§</b>
                <div className="bubble typing">
                  <span />
                  <span />
                  <span />
                </div>
              </article>
            )}
          </div>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <form
          className="composer"
          onSubmit={(event) => {
            event.preventDefault();
            ask();
          }}
        >
          <textarea
            ref={textarea}
            rows="1"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about renting or leases..."
            aria-label="Your message"
            disabled={loading}
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!input.trim() || loading}
          >
            Send <span aria-hidden="true">↑</span>
          </button>
        </form>
        <small className="hint">
          Enter to send <span>·</span> Shift + Enter for a new line
        </small>
      </section>
      {messages.length > 0 && (
        <button
          className="clear"
          type="button"
          onClick={() => {
            setMessages([]);
            setError("");
            setInput("");
          }}
        >
          Clear conversation
        </button>
      )}
      <footer className="disclaimer">
        <strong>Educational information only.</strong> This assistant provides
        general legal information, not legal advice. Rental laws vary by
        jurisdiction and can change; verify important matters using current
        official sources or a qualified lawyer.
      </footer>
    </>
  );
}
