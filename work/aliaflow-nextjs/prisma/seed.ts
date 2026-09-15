import "dotenv/config";
import { prisma } from "../lib/db";
import { hashPassword } from "../lib/auth";

const sections: Record<string, Record<string, unknown>> = {
  header: {
    wordmark: "ALIAFLOW",
    logo: "/assets/aliaflow-logo.svg",
    logo_alt: "ALIAFLOW",
    home_href: "#home",
    menu_label: "Menu",
    links: [
      { label: "Home", href: "#home" },
      { label: "Products", href: "#service-catalogue" },
      { label: "Packages", href: "#thrivable-business" },
      { label: "Projects", href: "#portfolio" },
      { label: "About us", href: "#why-us" },
      { label: "Contact us", href: "#contact-us" },
    ],
  },

  hero: {
    eyebrow: "A L I A F L O W",
    heading: "YOUR TRUSTED\nLEADERSHIP PARTNER",
    image: "/assets/boardroom.png",
    image_alt: "Leadership team around a strategic table",
  },

  outcomes: {
    intro_heading: "YOUR BUSINESS\nIS...",
    title_prefix: "is",
    title_suffix: "but we make it",
    detail_prefix: "Not only",
    detail_connector: "but also",
    items: [
      {
        label: "Desirable",
        emphasis: "DIFFERENT",
        copy: "We create a truly differentiated business for you, built around the new and emerging needs and desires in your target market. It will not only be desirable and wanted by your customers, but also socially impactful and will create a lasting change in their work or life.",
        image: "/assets/blank-panel.png",
        image_alt: "Desirable outcome panel",
        stats: [{ value: "# 4 Senses" }, { value: "# 3 Loops" }],
      },
      {
        label: "Feasible",
        emphasis: "COMPETITIVE",
        copy: "The competitive advantage we create for you is based on a mixture of your organization’s capabilities and the future of emerging technologies, which makes it a unique and hard-to-copy advantage. At the same time, this competitive advantage will be at several silos and levels of your organization. Different types of innovation would eventually make it hard for your competitors to imitate your business structure.",
        image: "/assets/blank-panel-1.png",
        image_alt: "Feasible outcome panel",
        stats: [{ value: "# 7 Risks" }, { value: "# 6 Roles" }, { value: "# 5 Games" }],
      },
      {
        label: "Viable",
        emphasis: "SCALABLE",
        copy: "At this stage, we design a sustainable revenue model for your business that ensures long-term growth and keeps the organization moving steadily toward its goals. This model is built to support consistent progress, not just short-term gains. We also plan growth in a controlled and strategic way at every phase, ensuring that each step strengthens the business and prepares it for the next version of your business model.",
        image: "/assets/blank-panel-2.png",
        image_alt: "Viable outcome panel",
        stats: [{ value: "# 8 Changes" }, { value: "# 9 Tests" }],
      },
    ],
    manifesto_heading: "YOUR THRIVABLE\nBUSINESS IS",
    manifesto_words: "DIFFERENT\nCOMPETITIVE\nSCALABLE",
    manifesto_shape: "/assets/subtract.svg",
  },

  "service-catalogue-nav": {
    heading: "OUR SERVICE CATALOGUE",
    tabs: [
      { number: "1", label: "Thrivable Business" },
      { number: "2", label: "Business Leadership" },
      { number: "3", label: "Technocratic Design" },
      { number: "4", label: "Execution Management" },
    ],
  },

  "thrivable-business": {
    heading: "THRIVABLE BUSINESS",
    question_image: "/assets/metro-paths.png",
    question_image_alt: "A leader standing at the intersection of business pathways",
    question_section_label: "Where to play, how to win",
    question: "WHERE TO PLAY?\nHOW TO WIN?",
    service_blocks: [
      {
        number: "1",
        title: "Future of X Book",
        body: "Many companies lack the time, resources, and expertise required to continuously monitor the future of their industry, emerging technologies and new business models suitable for growth. At AliaFlow, by analyzing weak signals and emerging trends, we produce fully customized, periodic reports on future of industries in a technocratic world where new market and technologies emerge and disrupt the old model of doing business.",
        image: "/assets/future-of-x-book.svg",
        image_alt: "Future of X Book icon",
      },
      {
        number: "2",
        title: "Critical Business Loop",
        body: "Based on the desired future, we consider the most value creating loops, aligned with your current capabilities and portfolio, into a practical business model with its most critical services. This critical business model provides a starting framework for developing a short-term and long-term strategies, helping leaders and decision makers align their planning and decisions around a shared goal.",
        image: "",
        image_alt: "Critical Business Loop icon",
      },
      {
        number: "3",
        title: "Brand Culture & XP",
        body: "We shape the designed business model, we build a Brand City — a conceptual collaborative inner space that brings your brand's future to life in all its dimensions. From brand identity and culture, to the daily behaviors, and communication systems that make it real. The right open systems and ways of working will remove some of its stakeholders.",
        image: "",
        image_alt: "Brand Culture and XP icon",
      },
    ],
    futures: [
      {
        image: "/assets/future-of-banking-card.png",
        alt: "Future of Banking in a Technocratic World",
      },
    ],
    loops: [
      { image: "/assets/aliasys-loop.png", image_alt: "Aliasys business loop", label: "ICT Infrastructure", title: "Aliasys Business Loop", body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet." },
      { image: "/assets/aliapay-loop.png", image_alt: "Aliapay business loop", label: "Banking and Fintech", title: "Aliapay Business Loop", body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet." },
      { image: "/assets/alialab-loop.png", image_alt: "AliaLab business loop", label: "Education", title: "AliaLab Business Loop", body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet." },
    ],
    cultures: [
      { image: "/assets/workshop.png", image_alt: "Technocratic culture workshop", label: "ICT Infrastructure", title: "Technocratic Culture", body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet." },
      { image: "/assets/design-event.png", image_alt: "Design thinking workshop", label: "Innovation & Design", title: "Design Thinking Culture", body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet." },
      { image: "/assets/meeting-halftone.png", image_alt: "Collaborative agile culture meeting", label: "Leadership & Management", title: "Collaborative Agile Culture", body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet." },
    ],
    magazine_heading: "THE FUTURE OF BANKING\nIN A TECHNOCRATIC WORLD\nMAGAZINE",
    magazine_price: "$900",
    magazine_image: "/assets/magazine.png",
    magazine_image_alt: "Future of Banking magazine spread",
    magazine_cta_label: "Buy Magazine",
    magazine_cta_href: "#contact-us",
    jam_heading: "Banking\nThrivability JAM",
    jam_date: "Mon, Oct 13, 2025 - Oct 17, 2025",
    jam_body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet.",
    jam_image: "/assets/banking-event.png",
    jam_image_alt: "Venue for the Banking Thrivability JAM",
    jam_cta_label: "Book Now",
    jam_cta_href: "#contact-us",
  },

  "business-leadership": {
    department_heading: "BUSINESS LEADERSHIP",
    question_image: "/assets/metro-boardroom.png",
    question_image_alt: "Business leaders in a boardroom",
    question: "WHAT TO PLAY?\nHOW TO LEAD?",
    statements: [
      {
        number: "4",
        title: "Business Game",
        body: "Through our proprietary Business Loop Game methodology, we help your organization move beyond a reactive mode and become a driver of change—where every decision contributes to creating a new game, rather than merely continuing the existing one.",
        cards: [
          { title: "Business Game 1", image: "/assets/business-game-card.png" },
          { title: "Business Game 2", image: "/assets/business-game-card.png" },
          { title: "Business Game 3", image: "/assets/business-game-card.png" },
        ],
      },
      {
        number: "5",
        title: "Strategic Roles",
        body: "Implementing Brand City is not merely a creative project; it is an organizational transformation that requires leadership, role definition, and clear strategies to guide the future.",
        cards: [
          { title: "Strategic Role 1", image: "/assets/strategic-role-card.png" },
          { title: "Strategic Role 2", image: "/assets/strategic-role-card.png" },
          { title: "Strategic Role 3", image: "/assets/strategic-role-card.png" },
        ],
      },
      {
        number: "6",
        title: "Leadership Model",
        body: "The strategic roles designed for your Brand City are entirely unique; they are a direct reflection of your brand's DNA and the future architecture of your business.",
        cards: [
          { title: "Leadership model 1", image: "/assets/leadership-model-card.png" },
          { title: "Leadership model 2", image: "/assets/leadership-model-card.png" },
          { title: "Leadership model 3", image: "/assets/leadership-model-card.png" },
        ],
      },
    ],
    holocratic_line: "Mentoring, Leading, Training, Coaching, Managing",
    event_title: "Future Leadership JAM",
    event_image: "/assets/future-leadership-jam.svg",
    event_image_alt: "Leadership team gathering",
    event_kicker: "Mon, Oct 13, 2025 – Fri, Oct 17, 2025",
    event_body: "Lorem ipsum dolor sit amet, consevbi hgseif adipiscing, sed do eismod hgseif adipiscing elit. Lorem ipsum dolor sit amet, consevbi hgseif adipiscing, sed do eismod sevbi hgseif adipiscing.",
    event_cta_label: "Book Event",
    event_cta_href: "#contact-us",
  },

  "technocratic-design": {
    department_heading: "TECHNOCRATIC DESIGN",
    question_image: "/assets/metro-boardroom.png",
    question_image_alt: "Technocratic design workshop",
    question: "WHEN TO DESIGN?\nHOW TO CHANGE?",
    pillars: [{ label: "Business Telling" }, { label: "Business Living" }, { label: "Business Playing" }],
    statements: [
      {
        number: "7",
        title: "Risk Setting",
        body: "Many businesses work on the wrong problems, wasting time and resources. We help your organization become part of the minority that identifies the right problem and solves it the right way.",
        cards: [
          { title: "Risk Setting 1", image: "/assets/risk-setting-card.png" },
          { title: "Risk Setting 2", image: "/assets/risk-setting-card.png" },
          { title: "Risk Setting 3", image: "/assets/risk-setting-card.png" },
        ],
      },
      {
        number: "8",
        title: "Change Solving",
        body: "Based on the real needs and challenges identified in the previous stages, our team researches, analyzes, and designs solutions that are fully aligned with your organization's DNA.",
        cards: [
          { title: "Change Solving 1", image: "/assets/change-solving-card.png" },
          { title: "Change Solving 2", image: "/assets/change-solving-card.png" },
          { title: "Change Solving 3", image: "/assets/change-solving-card.png" },
        ],
      },
      {
        number: "9",
        title: "Performance Testing",
        body: "The implementation of solutions is carried out in close collaboration with the organization’s units and experts through a fully participatory process. From the designed options, the most suitable solution is selected and implemented with the active involvement of each department’s team—while remaining open to development and improvement throughout execution, as needed.",
        cards: [
          { title: "Performance Testing 1", image: "/assets/performance-testing-card.png" },
          { title: "Performance Testing 2", image: "/assets/performance-testing-card.png" },
          { title: "Performance Testing 3", image: "/assets/performance-testing-card.png" },
        ],
      },
    ],
    event_title: "Technocratic Design For Leadership JAM",
    event_image: "/assets/technocratic-leadership-jam.png",
    event_image_alt: "Technocratic design event",
    event_kicker: "Mon, Oct 13, 2025 – Fri, Oct 17, 2025",
    event_body: "Lorem ipsum dolor sit amet, consevbi hgseif adipiscing, sed do eismod hgseif adipiscing elit. Lorem ipsum dolor sit amet, consevbi hgseif adipiscing, sed do eismod sevbi hgseif adipiscing.",
    event_cta_label: "Book Event",
    event_cta_href: "#contact-us",
  },

  "execution-management": {
    heading: "EXECUTION MANAGEMENT",
    orbit_labels: [
      { label: "ADORE\nREBRANDING" },
      { label: "DOGHAZAL\nEXPERIENCE" },
      { label: "FOMENTO\nBRANDING" },
      { label: "ARVA\nCAMPAIGN" },
    ],
    emphasized_label: "ALIASYS\nEXHIBITION",
    body: "By leveraging advanced information and communication technologies, we support businesses in creating a more optimized, efficient, and successful version of themselves.",
  },

  "why-choose-us": {
    eyebrow: "Why choose us?",
    heading: "Enabling Business\nThrivability through\nTechnocratic\nInnovation",
    ring_center_label: "BUSINESS\nTHRIVABILITY",
    points: [
      {
        label: "Reason to believe",
        title: "Different",
        body: "Business Continuity refers to an organization’s ability to maintain essential functions during and after a disaster, disruption, or unexpected event.",
        image: "/assets/why-different.svg",
        image_alt: "Different illustration",
      },
      {
        label: "Reason to believe",
        title: "Competitive",
        body: "Business Continuity refers to an organization’s ability to maintain essential functions during and after a disaster, disruption, or unexpected event.",
        image: "/assets/why-competitive.svg",
        image_alt: "Competitive illustration",
      },
      {
        label: "Reason to believe",
        title: "Scalable",
        body: "Business Continuity refers to an organization’s ability to maintain essential functions during and after a disaster, disruption, or unexpected event.",
        image: "/assets/why-scalable.svg",
        image_alt: "Scalable illustration",
      },
    ],
  },

  "portfolio-people": {
    portfolio_heading: "PORTFOLIO",
    people_heading: "PEOPLE",
    toolkits_heading: "DESIGN TOOLKITS",
    timeline: [
      { year: "1389", label: "Timeline Machine" },
      { year: "1390", label: "Time Machine" },
      { year: "1395", label: "Timeline Machine" },
    ],
    people: [
      { name: "Vahid Daem", role: "Business Manager", image: "/assets/daem.png", image_alt: "Vahid Daem" },
      { name: "Nasim Tavakkoli", role: "Automation & AI Specialist", image: "/assets/tavakoli.png", image_alt: "Nasim Tavakkoli" },
      { name: "Saman Ehteshamzade", role: "Marketing Manager", image: "/assets/ehteshamzadeh.png", image_alt: "Saman Ehteshamzade" },
      { name: "Narges Mohit", role: "Space Designer", image: "/assets/mohit.png", image_alt: "Narges Mohit" },
    ],
    toolkits: [
      { title: "Toolkit 1", body: "Lorem ipsum dolot sit amet", image: "/assets/toolkit-1.png", image_alt: "Toolkit 1" },
      { title: "Toolkit 2", body: "Lorem ipsum dolot sit amet", image: "/assets/toolkit-2.png", image_alt: "Toolkit 2" },
      { title: "Toolkit 3", body: "Lorem ipsum dolot sit amet", image: "/assets/toolkit-3.png", image_alt: "Toolkit 3" },
      { title: "Toolkit 4", body: "Lorem ipsum dolot sit amet", image: "/assets/toolkit-4.png", image_alt: "Toolkit 4" },
    ],
  },

  "testimonials-footer": {
    trust_heading: "WHY TRUST US",
    trust_subheading: "R E A S O N   T O   B E L I E V E",
    partners_heading: "PARTNERS",
    testimonials_heading: "TESTIMONIAL",
    partners: [
      { name: "Amin Advisor" },
      { name: "Atolie" },
      { name: "Tehran University", logo: "/assets/partner-tehran-university.png", logo_alt: "Tehran University" },
      { name: "Raad Architect", logo: "/assets/partner-raad-architect.png", logo_alt: "Raad Architect" },
      { name: "Lorem Ipsum" },
      { name: "Lorem Ipsum" },
      { name: "Lorem Ipsum" },
      { name: "Lorem Ipsum" },
    ],
    testimonials: [
      {
        name: "Mr Ansari",
        role: "Cisco Manager",
        title: "Supporting after Sales",
        body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit",
        image: "/assets/testimonial-ansari.png",
        image_alt: "Mr Ansari, Cisco Manager",
      },
      {
        name: "Mr Bahadori",
        role: "Cisco Manager",
        title: "Supporting after Sales",
        body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit",
        image: "/assets/testimonial-ansari.png",
        image_alt: "Mr Bahadori, Cisco Manager",
      },
      {
        name: "Mr Ansari",
        role: "Cisco Manager",
        title: "Supporting after Sales",
        body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit",
        image: "/assets/testimonial-ansari.png",
        image_alt: "Mr Ansari, Cisco Manager",
      },
      {
        name: "Mr Bahadori",
        role: "Cisco Manager",
        title: "Supporting after Sales",
        body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit",
        image: "/assets/testimonial-ansari.png",
        image_alt: "Mr Bahadori, Cisco Manager",
      },
    ],
    closing_heading: "WHAT\nIF...",
    closing_body: "You Could Change Your\nSuccessful Business to A\nThrivable Business",
  },

  footer: {
    logo: "/assets/aliaflow-logo.svg",
    logo_alt: "Aliaflow",
    home_href: "#home",
    eyebrow: "LET’S TALK",
    heading_line1: "Make your business",
    heading_emphasis: "thrive.",
    email: "hello@aliaflow.com",
    description: "Leadership partner for desirable, competitive and scalable businesses.",
    social_links: [
      { label: "LinkedIn", href: "#home" },
      { label: "Instagram", href: "#home" },
    ],
    copyright: "© 2025 Aliaflow. All rights reserved.",
  },
};

async function main() {
  let created = 0;
  for (const [key, data] of Object.entries(sections)) {
    const existing = await prisma.section.findUnique({ where: { key } });
    if (existing) continue;
    await prisma.section.create({ data: { key, data: JSON.stringify(data), publishedData: JSON.stringify(data), publishedAt: new Date() } });
    created += 1;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the admin user");
  }

  const passwordHash = await hashPassword(adminPassword);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash },
  });

  const defaults = {
    siteName: "Aliaflow",
    siteUrl: "http://localhost:3000",
    locale: "en",
    timezone: "Asia/Tehran",
    seoTitle: "Aliaflow — Your Trusted Leadership Partner",
    seoDescription: "Leadership partner for desirable, competitive and scalable businesses.",
    seoImage: "/assets/aliaflow-logo.svg",
    seoImageAlt: "Aliaflow",
  };
  for (const [key, value] of Object.entries(defaults)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  console.log(`Seeded ${created} new section(s) (${Object.keys(sections).length - created} already existed, left untouched) and admin user ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
