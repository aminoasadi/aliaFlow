/**
 * Mock/placeholder article content for the 27 card detail pages, keyed by
 * each card's current display name (its `heading` field, falling back to
 * `title` for cards that have not been migrated to the newer schema yet —
 * see publish-mock-articles.mjs for the matching logic).
 *
 * Written to read as plausible, on-brand copy for Aliaflow's consulting
 * services rather than lorem ipsum, but it is still placeholder content:
 * replace it through the CMS once real copy exists for a card.
 */
export const MOCK_ARTICLES = {
  // --- Future of X Book -----------------------------------------------
  "Future of Banking": {
    lead: "Banking is being rebuilt around technologies that did not exist when its current operating model was designed.",
    sections: [
      {
        heading: "What is changing",
        body: "Open banking APIs, embedded finance and AI-driven underwriting are moving faster than the compliance and legacy-core-banking cycles built to govern them, forcing incumbent banks to compete against fintechs that were never built for a branch network.",
      },
      {
        heading: "What we deliver",
        body: "A customized future-of-banking report — signal-mapped by regulation, technology and customer behaviour — that gives your leadership a shared, evidence-based view of where the industry moves next and what to build for it.",
      },
    ],
    key_points: [
      { title: "Signal, not speculation", body: "Every trend in the report is sourced from regulatory filings, patent activity and funding data, not analyst opinion." },
      { title: "Quarterly cadence", body: "The report updates every quarter, so the roadmap it feeds never goes stale." },
      { title: "Board-ready", body: "Delivered as a briefing your leadership can act on the same week, not a research archive that sits unread." },
    ],
    cta_heading: "Get your Future of Banking report",
    cta_label: "Request the report",
    cta_href: "#contact-us",
  },
  "Future of Governance": {
    lead: "Governance is slow by design, and the systems it governs are no longer slow.",
    sections: [
      {
        heading: "The mismatch",
        body: "Public and quasi-public institutions still run annual planning cycles against citizens and markets that move in weeks, and every year the gap between the two clocks gets more expensive to ignore.",
      },
      {
        heading: "What we deliver",
        body: "A technocratic-world outlook for governance bodies, mapping digital identity, algorithmic policy and citizen-facing automation against your institution's own mandate and constraints.",
      },
    ],
    key_points: [
      { title: "Mandate-aware", body: "Every recommendation is filtered through what your institution can actually change, not a generic public-sector wishlist." },
      { title: "Cross-jurisdiction signal", body: "Draws on regulatory movement across multiple markets, so you see patterns before they reach yours." },
      { title: "Built for briefing rooms", body: "Structured for the kind of short, high-stakes review governance bodies actually run." },
    ],
    cta_heading: "Bring this to your next governance review",
    cta_label: "Request the report",
    cta_href: "#contact-us",
  },
  "Future of Education": {
    lead: "Education is being pulled apart by the same forces that are rebuilding the work it prepares people for.",
    sections: [
      {
        heading: "The disconnect",
        body: "Curricula built for a stable labour market are now training people for jobs that AI and automation are actively reshaping before graduation.",
      },
      {
        heading: "What we deliver",
        body: "A future-of-education outlook that connects emerging technology, employer demand and pedagogy, so institutions can redesign programs around where skills are actually going.",
      },
    ],
    key_points: [
      { title: "Employer-linked", body: "Findings are cross-checked against real hiring signal, not curriculum theory." },
      { title: "Technology-honest", body: "Names which technologies are genuinely disruptive to a program and which are hype." },
      { title: "Actionable by term", body: "Structured so a curriculum committee can act within one academic cycle." },
    ],
    cta_heading: "Rethink your program roadmap",
    cta_label: "Request the report",
    cta_href: "#contact-us",
  },

  // --- Critical Business Loop -------------------------------------------
  "Aliasys Business Loop": {
    lead: "An ICT infrastructure business whose growth depended on making its own complexity invisible.",
    sections: [
      {
        heading: "The loop",
        body: "Aliasys's attraction depended on technical credibility, its loyalty on uptime nobody had to think about, and its satisfaction on customers never seeing how much engineering sat behind the reliability they took for granted.",
      },
      {
        heading: "What we built",
        body: "A business loop model connecting sales narrative, service design and support operations into one system, so every team optimizes for the same customer outcome instead of its own function.",
      },
    ],
    key_points: [
      { title: "One shared loop", body: "Sales, delivery and support stopped optimizing separately and started optimizing the same attraction-loyalty-satisfaction cycle." },
      { title: "Complexity absorbed, not exposed", body: "The engineering effort behind reliability became a selling point instead of a support burden." },
      { title: "Measurable handoffs", body: "Each stage of the loop has an owner and a metric, closing the gaps where customers used to fall through." },
    ],
    cta_heading: "Design your own critical business loop",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },
  "Aliapay Business Loop": {
    lead: "A payments business that had to earn loyalty in a market where switching costs had collapsed.",
    sections: [
      {
        heading: "The loop",
        body: "In a market where changing payment providers takes an afternoon, Aliapay's loyalty could not be built on lock-in — it had to come from the loop performing better on attraction and satisfaction, every cycle, than the alternative.",
      },
      {
        heading: "What we built",
        body: "A loyalty model tied to visible service quality rather than contractual friction, so retention came from wanting to stay rather than the cost of leaving.",
      },
    ],
    key_points: [
      { title: "Switching cost removed on purpose", body: "The model assumes customers can leave any day, and designs the loop to make that undesirable rather than difficult." },
      { title: "Fintech-speed feedback", body: "Attraction and satisfaction signals are reviewed weekly, matching the pace fintech customers actually churn at." },
      { title: "Loyalty as a KPI, not a clause", body: "Retention is tracked as a loop outcome, not a contract term." },
    ],
    cta_heading: "Build a loyalty loop that doesn't rely on lock-in",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },
  "AliaLab Business Loop": {
    lead: "An education lab that treated every cohort as a test of its own operating model.",
    sections: [
      {
        heading: "The loop",
        body: "AliaLab's satisfaction loop closed differently for every cohort, so each intake became a live test of what attracted the right learners and what actually kept them engaged through completion.",
      },
      {
        heading: "What we built",
        body: "A cohort-level feedback loop that feeds directly back into program design, so the business model itself improves with every cycle rather than staying fixed while only the content changes.",
      },
    ],
    key_points: [
      { title: "Cohort as feedback unit", body: "Every intake is treated as a data point on the business model, not just a class to teach." },
      { title: "Completion-linked satisfaction", body: "Satisfaction is measured against outcomes learners actually use, not end-of-course surveys." },
      { title: "Model that compounds", body: "Each loop cycle improves the next cohort's attraction, not just its own satisfaction score." },
    ],
    cta_heading: "Turn your next cohort into a feedback loop",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },

  // --- Brand Culture & XP -------------------------------------------------
  "Technocratic Culture": {
    lead: "A culture where technical judgement carries the same weight as commercial judgement.",
    sections: [
      {
        heading: "The problem it solves",
        body: "Most organizations let commercial arguments win by default, which quietly pushes technical debt and engineering risk to the back of every roadmap until it becomes unavoidable and expensive.",
      },
      {
        heading: "What we build",
        body: "A technocratic decision culture where engineering and product sit in the same room with equal authority over what ships and when, backed by shared metrics both sides trust.",
      },
    ],
    key_points: [
      { title: "Equal seat at the table", body: "Technical leads have real veto power on roadmap decisions, not just advisory input." },
      { title: "Shared metrics", body: "Commercial and technical teams are measured against the same outcomes, removing the incentive to trade one off against the other." },
      { title: "Debt made visible", body: "Technical debt is tracked and reported with the same rigor as revenue." },
    ],
    cta_heading: "Bring technical judgement into your roadmap decisions",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },
  "Design Thinking Culture": {
    lead: "A culture that starts every problem in the room where the problem is felt.",
    sections: [
      {
        heading: "The problem it solves",
        body: "Solutions designed in a strategy meeting, far from the people who live the problem daily, tend to solve the wrong version of it — accurately, expensively, and too late to matter.",
      },
      {
        heading: "What we build",
        body: "A design thinking operating rhythm that puts frontline staff and real customers inside the problem-definition stage, not just the feedback stage.",
      },
    ],
    key_points: [
      { title: "Problem defined on-site", body: "Discovery happens where the problem occurs, not in a conference room describing it secondhand." },
      { title: "Prototyped before scaled", body: "Every solution is tested small before it becomes a company-wide rollout." },
      { title: "Feedback loop stays open", body: "The people who surfaced the problem also see how their input shaped the fix." },
    ],
    cta_heading: "Start your next initiative where the problem actually lives",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },
  "Collaborative Agile Culture": {
    lead: "A culture that moves in short cycles without losing the thread between them.",
    sections: [
      {
        heading: "The problem it solves",
        body: "Agile ceremonies without a shared thread between sprints turn into fast motion with no direction — teams that ship weekly but drift yearly.",
      },
      {
        heading: "What we build",
        body: "A collaborative agile culture where short cycles stay anchored to a shared strategic thread, so speed compounds instead of scattering.",
      },
    ],
    key_points: [
      { title: "Thread over ceremony", body: "Every sprint is checked against the strategic thread, not just its own backlog." },
      { title: "Cross-functional by default", body: "Squads include every function a decision touches, not just engineering." },
      { title: "Speed that compounds", body: "Each cycle builds on the last instead of resetting context every two weeks." },
    ],
    cta_heading: "Make your sprints add up to something",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },

  // --- Business Game --------------------------------------------------
  "Business Game 1": {
    lead: "A simulation that puts your leadership team inside the decisions before the market does.",
    sections: [
      {
        heading: "The scenario",
        body: "Your leadership team plays out a full market-entry cycle — pricing, positioning, competitor response — compressed into a single working session, with real stakes and real disagreement.",
      },
      {
        heading: "What it reveals",
        body: "Where the team's stated strategy and its actual decision-making under pressure diverge, before that gap costs a real launch.",
      },
    ],
    key_points: [
      { title: "Compressed timeline", body: "A year of market dynamics plays out in one session, not one fiscal year." },
      { title: "Real disagreement", body: "The game is designed to surface where the team actually disagrees, not paper over it." },
      { title: "Debrief with data", body: "Every decision is logged and reviewed, so the debrief is evidence-based, not anecdotal." },
    ],
    cta_heading: "Run the Market Entry Game with your team",
    cta_label: "Book a session",
    cta_href: "#contact-us",
  },
  "Business Game 2": {
    lead: "A simulation that puts your leadership team inside the decisions before the market does.",
    sections: [
      {
        heading: "The scenario",
        body: "Leadership plays out a wave of key departures and counter-offers under time pressure, forcing real prioritization between retention spend, role redesign, and succession planning.",
      },
      {
        heading: "What it reveals",
        body: "Whether your retention strategy survives contact with an actual crisis, or only works on paper when nobody is actually leaving.",
      },
    ],
    key_points: [
      { title: "Pressure-tested, not theoretical", body: "Decisions are made against a ticking clock, the way real departures happen." },
      { title: "Succession exposed", body: "The game surfaces exactly which roles have no real backup plan." },
      { title: "Retention spend prioritized", body: "Forces a ranked, not equal, allocation of retention budget." },
    ],
    cta_heading: "Stress-test your retention strategy",
    cta_label: "Book a session",
    cta_href: "#contact-us",
  },
  "Business Game 3": {
    lead: "A simulation that puts your leadership team inside the decisions before the market does.",
    sections: [
      {
        heading: "The scenario",
        body: "A competitor cuts prices without warning. Your team has to decide, in real time, whether to match, hold, or reposition, with the game modelling the customer and margin consequences of each path.",
      },
      {
        heading: "What it reveals",
        body: "Whether your pricing strategy is a considered position or a reflex, and what it actually costs to defend it.",
      },
    ],
    key_points: [
      { title: "Margin consequences modelled", body: "Every pricing move shows its effect on margin, not just market share." },
      { title: "Reflex vs strategy", body: "Separates decisions made from conviction from decisions made from panic." },
      { title: "Repeatable playbook", body: "The session produces a documented response plan for the next price war, not just a debrief." },
    ],
    cta_heading: "Prepare your pricing playbook before you need it",
    cta_label: "Book a session",
    cta_href: "#contact-us",
  },

  // --- Strategic Roles --------------------------------------------------
  "Strategic Role 1": {
    lead: "Roles defined by the future the business is moving toward, not the org chart it inherited.",
    sections: [
      {
        heading: "Why this role exists",
        body: "Most org charts describe who reports to whom today; they say nothing about who owns the decisions the business will need made in two years. This role is defined against that future, not the present structure.",
      },
      {
        heading: "What we define",
        body: "A clear mandate, decision rights and success measures for a role built specifically around your Brand City's technocratic direction.",
      },
    ],
    key_points: [
      { title: "Mandate, not title", body: "The role is defined by what it decides, not what it's called." },
      { title: "Decision rights mapped", body: "Removes the ambiguity over who actually has authority to act." },
      { title: "Tied to the future state", body: "Designed against where the business is going, not where it's been." },
    ],
    cta_heading: "Define the roles your future actually needs",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },
  "Strategic Role 2": {
    lead: "Roles defined by the future the business is moving toward, not the org chart it inherited.",
    sections: [
      {
        heading: "Why this role exists",
        body: "Culture work usually has no single owner, which is exactly why it drifts. This role gives Brand City's cultural direction a name, a mandate and a way to be held accountable.",
      },
      {
        heading: "What we define",
        body: "Authority over cultural decisions that currently get made by default — hiring signals, ritual, recognition — with clear measures of whether the culture is actually moving in the intended direction.",
      },
    ],
    key_points: [
      { title: "Single point of accountability", body: "Culture decisions stop being everyone's job and no one's responsibility." },
      { title: "Measured, not assumed", body: "Cultural direction is tracked against defined indicators, not gut feel." },
      { title: "Connected to Brand City", body: "The role's mandate is explicitly tied to the Brand City model, not a generic HR function." },
    ],
    cta_heading: "Give your culture a real owner",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },
  "Strategic Role 3": {
    lead: "Roles defined by the future the business is moving toward, not the org chart it inherited.",
    sections: [
      {
        heading: "Why this role exists",
        body: "Transformation initiatives stall without a sponsor who has both the authority and the mandate to remove blockers, not just endorse the initiative in a kickoff meeting.",
      },
      {
        heading: "What we define",
        body: "A change sponsorship role with explicit authority over resourcing and prioritization conflicts, so transformation work survives contact with competing priorities.",
      },
    ],
    key_points: [
      { title: "Authority, not endorsement", body: "The role can actually reprioritize resources, not just say yes at the start." },
      { title: "Named blockers, named owner", body: "Every blocker raised has a clear person accountable for clearing it." },
      { title: "Built to outlast the initiative", body: "Defined so the role continues past the first project it sponsors." },
    ],
    cta_heading: "Give your next transformation a real sponsor",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },

  // --- Leadership Model ---------------------------------------------------
  "Leadership model 1": {
    lead: "A leadership operating model drawn from your brand's DNA rather than from a framework.",
    sections: [
      {
        heading: "The model",
        body: "Authority is distributed to the roles closest to each decision, rather than concentrated at the top and slowed by approval chains that were never designed for your business's actual pace.",
      },
      {
        heading: "Why it fits",
        body: "Built from what already makes your Brand City distinctive, not adapted from a leadership book written for a different kind of organization.",
      },
    ],
    key_points: [
      { title: "Decisions at the point of contact", body: "Authority sits with whoever is closest to the consequence." },
      { title: "Fewer approval layers", body: "Removes steps that exist by habit rather than by necessity." },
      { title: "Native to your brand", body: "Modelled on your organization's own DNA, not a borrowed framework." },
    ],
    cta_heading: "Build a leadership model that fits your business",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },
  "Leadership model 2": {
    lead: "A leadership operating model drawn from your brand's DNA rather than from a framework.",
    sections: [
      {
        heading: "The model",
        body: "Leadership of cross-functional initiatives rotates to whoever has the clearest stake in the outcome, rather than defaulting permanently to the most senior person in the room.",
      },
      {
        heading: "Why it fits",
        body: "Keeps decision-making close to expertise as your Brand City's priorities shift, instead of leaving every initiative under one fixed leader regardless of fit.",
      },
    ],
    key_points: [
      { title: "Ownership follows expertise", body: "Leadership shifts with the problem, not with seniority." },
      { title: "No permanent single point of failure", body: "No initiative depends entirely on one person's availability." },
      { title: "Built for shifting priorities", body: "Designed to flex as your strategic focus moves." },
    ],
    cta_heading: "Design leadership that moves with your priorities",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },
  "Leadership model 3": {
    lead: "A leadership operating model drawn from your brand's DNA rather than from a framework.",
    sections: [
      {
        heading: "The model",
        body: "Senior leaders act as coaches to distributed decision-makers rather than as the decision-makers themselves, multiplying judgement across the organization instead of bottlenecking it.",
      },
      {
        heading: "Why it fits",
        body: "Matches a Brand City built around holocratic management — mentoring, leading, training and coaching working as one leadership system.",
      },
    ],
    key_points: [
      { title: "Judgement multiplied, not centralized", body: "Senior leaders scale their judgement through others, not through personal bandwidth." },
      { title: "Coaching as a leadership duty", body: "Coaching is part of the role's mandate, not an extra." },
      { title: "Aligned with holocratic management", body: "Built to work inside the same operating philosophy as the rest of your Brand City." },
    ],
    cta_heading: "Build leaders who multiply judgement, not bottleneck it",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },

  // --- Risk Setting -------------------------------------------------------
  "Risk Setting 1": {
    lead: "Most businesses solve the wrong problem well. This is the work of choosing the right one.",
    sections: [
      {
        heading: "The work",
        body: "Before any solution gets designed, we map where regulatory exposure is actually concentrated in your operations, rather than where it's assumed to be.",
      },
      {
        heading: "Why it matters",
        body: "Teams solve the risks they can see, not the risks that are actually largest — this audit corrects that before resources are committed.",
      },
    ],
    key_points: [
      { title: "Exposure mapped, not assumed", body: "Findings are based on your actual operations, not a generic compliance checklist." },
      { title: "Prioritized by real cost", body: "Risks are ranked by what they would actually cost, not by how visible they are." },
      { title: "Precedes the solution", body: "Done before any fix is designed, so effort goes to the right problem first." },
    ],
    cta_heading: "Find out where your real exposure is",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },
  "Risk Setting 2": {
    lead: "Most businesses solve the wrong problem well. This is the work of choosing the right one.",
    sections: [
      {
        heading: "The work",
        body: "We identify the operational failure points your team has stopped noticing because they've become normal — the risks hiding in plain sight inside daily process.",
      },
      {
        heading: "Why it matters",
        body: "The most expensive risks are often the ones nobody flags anymore because they've never yet caused visible damage.",
      },
    ],
    key_points: [
      { title: "Normalized risk surfaced", body: "Finds the risks your team has stopped seeing because nothing has broken yet." },
      { title: "Process-level detail", body: "Looks at daily operations, not just strategic-level risk registers." },
      { title: "No blame framing", body: "Designed to surface blind spots without turning the review into a search for fault." },
    ],
    cta_heading: "Surface the risks you've stopped noticing",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },
  "Risk Setting 3": {
    lead: "Most businesses solve the wrong problem well. This is the work of choosing the right one.",
    sections: [
      {
        heading: "The work",
        body: "We pressure-test the assumptions behind your organization's biggest current strategic bet, before the market does it for you.",
      },
      {
        heading: "Why it matters",
        body: "Big bets rarely fail because the plan was bad — they fail because an assumption underneath the plan was never actually tested.",
      },
    ],
    key_points: [
      { title: "Assumptions made explicit", body: "Every load-bearing assumption behind the bet is named and tested." },
      { title: "Tested before committed", body: "Done while the bet can still be adjusted, not after it's fully resourced." },
      { title: "Board-level clarity", body: "Produces a clear view leadership can act on, not just a list of concerns." },
    ],
    cta_heading: "Pressure-test your next big bet",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },

  // --- Change Solving -------------------------------------------------
  "Change Solving 1": {
    lead: "Solutions designed against the real constraints your organization already operates under.",
    sections: [
      {
        heading: "The challenge",
        body: "Replacing a legacy system that the whole organization has quietly built workarounds around, without breaking the workflows those workarounds were solving.",
      },
      {
        heading: "Our approach",
        body: "We map the workarounds first, design the transition around what they were actually compensating for, and sequence the change so no team loses function mid-migration.",
      },
    ],
    key_points: [
      { title: "Workarounds mapped first", body: "Nothing gets replaced until we know what informal fix it was standing in for." },
      { title: "Zero-function-loss sequencing", body: "Migration is staged so no team goes without a working process." },
      { title: "Built with the people who built the workarounds", body: "The staff who created the informal fixes help design their replacement." },
    ],
    cta_heading: "Plan a transition that doesn't break what already works",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },
  "Change Solving 2": {
    lead: "Solutions designed against the real constraints your organization already operates under.",
    sections: [
      {
        heading: "The challenge",
        body: "Two operating cultures, two tech stacks, and a deadline that ignores both — merger integration usually fails on the human system, not the technical one.",
      },
      {
        heading: "Our approach",
        body: "We design the integration around the cultural constraint first, sequencing technical and process changes to match how fast people can actually absorb them.",
      },
    ],
    key_points: [
      { title: "Culture sequenced first", body: "Technical integration follows the pace people can absorb, not a fixed calendar." },
      { title: "Two systems, one plan", body: "Designed for both legacy stacks explicitly, not built around one and retrofitted to the other." },
      { title: "Deadline reality-checked", body: "The timeline is stress-tested against constraints before it's committed to leadership." },
    ],
    cta_heading: "Integrate without losing the people who make it work",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },
  "Change Solving 3": {
    lead: "Solutions designed against the real constraints your organization already operates under.",
    sections: [
      {
        heading: "The challenge",
        body: "New regulation lands with a compliance deadline that doesn't account for your existing operational load, forcing a choice between compliance and delivery.",
      },
      {
        heading: "Our approach",
        body: "We design the compliance response to run alongside existing delivery commitments, not compete with them for the same teams.",
      },
    ],
    key_points: [
      { title: "Runs alongside, not instead of", body: "Delivery commitments and compliance work are sequenced together, not traded off." },
      { title: "Resourced realistically", body: "Built against actual team capacity, not an idealized org chart." },
      { title: "Documented for the regulator and for you", body: "Produces a compliance trail that also improves the underlying process." },
    ],
    cta_heading: "Meet the deadline without stopping delivery",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },

  // --- Performance Testing -------------------------------------------
  "Performance Testing 1": {
    lead: "Capability tested in the reality of your operating system, not in a deck.",
    sections: [
      {
        heading: "The test",
        body: "Before go-live, we run the new capability through your actual operating conditions — real volume, real staffing, real edge cases — not a controlled demo environment.",
      },
      {
        heading: "What it proves",
        body: "Whether the solution holds up under your organization's real pressure, before your customers find out the hard way.",
      },
    ],
    key_points: [
      { title: "Real conditions, not a demo", body: "Tested under actual load and staffing, not a curated walkthrough." },
      { title: "Edge cases included", body: "Includes the messy real-world cases a demo environment usually skips." },
      { title: "Go/no-go with evidence", body: "Produces a clear, evidence-based readiness call, not a gut-feel sign-off." },
    ],
    cta_heading: "Test readiness before your customers do",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },
  "Performance Testing 2": {
    lead: "Capability tested in the reality of your operating system, not in a deck.",
    sections: [
      {
        heading: "The test",
        body: "We push the new capability to a volume well beyond current demand, so scaling problems show up in testing instead of during your biggest week of the year.",
      },
      {
        heading: "What it proves",
        body: "Where the system actually breaks under load, and how much runway you have before that becomes your reality.",
      },
    ],
    key_points: [
      { title: "Beyond current demand", body: "Tested at a volume higher than today's peak, not just today's average." },
      { title: "Breaking point identified", body: "Finds the actual limit, not just confirms the system works at normal load." },
      { title: "Runway quantified", body: "Tells you how much growth you can absorb before the next investment is needed." },
    ],
    cta_heading: "Find your breaking point before your busiest week does",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },
  "Performance Testing 3": {
    lead: "Capability tested in the reality of your operating system, not in a deck.",
    sections: [
      {
        heading: "The test",
        body: "Most failures happen at the handoff between teams, not inside any one team's process, so we test the capability specifically at those seams.",
      },
      {
        heading: "What it proves",
        body: "Whether the handoffs between departments actually work end to end, not just whether each department's own piece works in isolation.",
      },
    ],
    key_points: [
      { title: "Seams tested, not just parts", body: "Focused on the handoffs between teams, where most real failures occur." },
      { title: "End-to-end, not siloed", body: "Evaluates the full path a request takes, not each department in isolation." },
      { title: "Fixes owned across teams", body: "Issues found are assigned jointly, not handed back to a single department." },
    ],
    cta_heading: "Test the handoffs, not just the pieces",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  },
};
