import "dotenv/config";
import { prisma } from "../lib/db";
import { hashPassword } from "../lib/auth";

const sections: Record<string, Record<string, unknown>> = {
  header: {
    wordmark: "ALIAFLOW",
    links: [
      { label: "Home" },
      { label: "Products" },
      { label: "Packages" },
      { label: "Projects" },
      { label: "About us" },
      { label: "Contact us" },
    ],
  },

  hero: {
    eyebrow: "A L I A F L O W",
    heading: "YOUR TRUSTED\nLEADERSHIP PARTNER",
    image: "/assets/boardroom.png",
  },

  outcomes: {
    intro_heading: "YOUR BUSINESS\nIS...",
    items: [
      {
        label: "is Desirable",
        emphasis: "DIFFERENT",
        copy: "We create a truly differentiated business for you, built around the new and emerging needs and desires in your target market. It will not only be desirable and wanted by your customers, but also socially impactful and will create a lasting change in their work or life.",
        stats: [{ value: "# 4 Senses" }, { value: "# 3 Loops" }],
      },
      {
        label: "is Feasible",
        emphasis: "COMPETITIVE",
        copy: "The competitive advantage we create for you is based on a mixture of your organization’s capabilities and the future of emerging technologies, which makes it a unique and hard-to-copy advantage. At the same time, this competitive advantage will be at several silos and levels of your organization. Different types of innovation would eventually make it hard for your competitors to imitate your business structure.",
        stats: [{ value: "# 7 Risks" }, { value: "# 6 Roles" }, { value: "# 5 Games" }],
      },
      {
        label: "is Viable",
        emphasis: "SCALABLE",
        copy: "At this stage, we design a sustainable revenue model for your business that ensures long-term growth and keeps the organization moving steadily toward its goals. This model is built to support consistent progress, not just short-term gains. We also plan growth in a controlled and strategic way at every phase, ensuring that each step strengthens the business and prepares it for the next version of your business model.",
        stats: [{ value: "# 8 Changes" }, { value: "# 9 Tests" }],
      },
    ],
    manifesto_heading: "YOUR THRIVABLE\nBUSINESS IS",
    manifesto_words: "DIFFERENT\nCOMPETITIVE\nSCALABLE",
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
    question: "WHERE TO PLAY?\nHOW TO WIN?",
    service_blocks: [
      {
        number: "1",
        title: "Future of X Book",
        body: "Many companies lack the time, resources, and expertise required to continuously monitor the future of their industry, emerging technologies and new business models suitable for growth. At AliaFlow, by analyzing weak signals and emerging trends, we produce fully customized, periodic reports on future of industries in a technocratic world where new market and technologies emerge and disrupt the old model of doing business.",
      },
      {
        number: "2",
        title: "Critical Business Loop",
        body: "Based on the desired future, we consider the most value creating loops, aligned with your current capabilities and portfolio, into a practical business model with its most critical services. This critical business model provides a starting framework for developing a short-term and long-term strategies, helping leaders and decision makers align their planning and decisions around a shared goal.",
      },
      {
        number: "3",
        title: "Brand Culture & XP",
        body: "We shape the designed business model, we build a Brand City — a conceptual collaborative inner space that brings your brand's future to life in all its dimensions. From brand identity and culture, to the daily behaviors, and communication systems that make it real. The right open systems and ways of working will remove some of its stakeholders.",
      },
    ],
    futures: [
      {
        title: "Future of BANKING",
        heading: "Future of Banking in\na Technocratic world",
        tags: "#Digital Banking #FinTech Innovation\n#Automated & AI",
      },
      {
        title: "Future of GOVERNANCE",
        heading: "Future of Governance in\na Technocratic World",
        tags: "#Digital Governance #Smart Policy Systems\n#Futuristic Administration",
      },
      {
        title: "Future of EDUCATION",
        heading: "Future of Education in\na Technocratic World",
        tags: "#EdTech #Digital Learning\n#Future Classrooms",
      },
    ],
    loops: [
      { image: "/assets/aliasys-loop.png", label: "ICT Infrastructure", title: "Aliasys Business Loop" },
      { image: "/assets/aliapay-loop.png", label: "Banking and Fintech", title: "Aliapay Business Loop" },
      { image: "/assets/alialab-loop.png", label: "Education", title: "AliaLab Business Loop" },
    ],
    cultures: [
      { image: "/assets/workshop.png", label: "ICT Infrastructure", title: "Technocratic Culture" },
      { image: "/assets/design-event.png", label: "Innovation & Design", title: "Design Thinking Culture" },
      { image: "/assets/meeting-halftone.png", label: "Leadership & Management", title: "Collaborative Agile Culture" },
    ],
    magazine_heading: "THE FUTURE OF BANKING\nIN A TECHNOCRATIC WORLD\nMAGAZINE",
    magazine_price: "$900",
    magazine_image: "/assets/magazine.png",
    jam_heading: "Banking\nThrivability JAM",
    jam_date: "Mon, Oct 13, 2025 - Oct 17, 2025",
    jam_body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet.",
    jam_image: "/assets/banking-event.png",
  },

  "business-leadership": {
    question: "WHAT TO PLAY?\nHOW TO LEAD?",
    statements: [
      {
        number: "4",
        title: "Business Game",
        body: "Through our proprietary Business Loop Game methodology, we help your organization move beyond a reactive mode and become a driver of change—where every decision contributes to creating a new game, rather than merely continuing the existing one.",
        cards: [
          { title: "Business Game 1", image: "/assets/alialab-loop.png" },
          { title: "Business Game 2", image: "/assets/aliapay-loop.png" },
          { title: "Business Game 3", image: "/assets/aliasys-loop.png" },
        ],
      },
      {
        number: "5",
        title: "Strategic Roles",
        body: "Implementing Brand City is not merely a creative project; it is an organizational transformation that requires leadership, role definition, and clear strategies to guide the future.",
        cards: [
          { title: "Strategic Role 1", image: "/assets/cyborg.png" },
          { title: "Strategic Role 2", image: "/assets/cyborg.png" },
          { title: "Strategic Role 3", image: "/assets/cyborg.png" },
        ],
      },
      {
        number: "6",
        title: "Leadership Model",
        body: "The strategic roles designed for your Brand City are entirely unique; they are a direct reflection of your brand's DNA and the future architecture of your business.",
        cards: [
          { title: "Leadership model 1", image: "" },
          { title: "Leadership model 2", image: "" },
          { title: "Leadership model 3", image: "" },
        ],
      },
    ],
    holocratic_line: "Mentoring, Leading, Training, Coaching, Managing",
    event_title: "Future Leadership JAM",
    event_image: "/assets/leadership-team.png",
  },

  "technocratic-design": {
    question: "WHEN TO DESIGN?\nHOW TO CHANGE?",
    pillars: [{ label: "Business Telling" }, { label: "Business Living" }, { label: "Business Playing" }],
    statements: [
      {
        number: "7",
        title: "Risk Setting",
        body: "Many businesses work on the wrong problems, wasting time and resources. We help your organization become part of the minority that identifies the right problem and solves it the right way.",
        cards: [
          { title: "Risk Setting 1", image: "/assets/people-feedback.png" },
          { title: "Risk Setting 2", image: "/assets/people-care.png" },
          { title: "Risk Setting 3", image: "/assets/workshop.png" },
        ],
      },
      {
        number: "8",
        title: "Change Solving",
        body: "Based on the real needs and challenges identified in the previous stages, our team researches, analyzes, and designs solutions that are fully aligned with your organization's DNA.",
        cards: [
          { title: "Change Solving 1", image: "" },
          { title: "Change Solving 2", image: "" },
          { title: "Change Solving 3", image: "" },
        ],
      },
      {
        number: "9",
        title: "Performance Testing",
        body: "The implementation of solutions is carried out in close collaboration with the organization’s units and experts through a fully participatory process.",
        cards: [
          { title: "Performance Testing 1", image: "" },
          { title: "Performance Testing 2", image: "" },
          { title: "Performance Testing 3", image: "" },
        ],
      },
    ],
    event_title: "Technocratic Design For Leadership JAM",
    event_image: "/assets/design-event.png",
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
    points: [
      {
        label: "Different",
        body: "Business Continuity refers to an organization’s ability to maintain essential functions during and after a disaster, disruption, or unexpected event.",
      },
      {
        label: "Competitive",
        body: "Business Continuity refers to an organization’s ability to maintain essential functions during and after a disaster, disruption, or unexpected event.",
      },
      {
        label: "Scalable",
        body: "Business Continuity refers to an organization’s ability to maintain essential functions during and after a disaster, disruption, or unexpected event.",
      },
    ],
  },

  "portfolio-people": {
    timeline: [
      { year: "1389", label: "Timeline Machine" },
      { year: "1390", label: "Time Machine" },
      { year: "1395", label: "Timeline Machine" },
    ],
    people: [
      { name: "Vahid Daem", role: "Business Manager", image: "/assets/daem.png" },
      { name: "Nasim Tavakkoli", role: "Automation & AI Specialist", image: "/assets/tavakoli.png" },
      { name: "Saman Ehteshamzade", role: "Marketing Manager", image: "/assets/ehteshamzadeh.png" },
      { name: "Narges Mohit", role: "Space Designer", image: "/assets/mohit.png" },
    ],
    toolkits: [
      { title: "Toolkit 1", body: "Lorem ipsum dolot sit amet" },
      { title: "Toolkit 2", body: "Lorem ipsum dolot sit amet" },
      { title: "Toolkit 3", body: "Lorem ipsum dolot sit amet" },
      { title: "Toolkit 4", body: "Lorem ipsum dolot sit amet" },
    ],
  },

  "testimonials-footer": {
    trust_heading: "WHY TRUST US",
    trust_subheading: "R E A S O N   T O   B E L I E V E",
    partners: [
      { name: "Amin Advisor" },
      { name: "Atolie" },
      { name: "Tehran University" },
      { name: "Raad Architect" },
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
      },
      {
        name: "Mr Bahadori",
        role: "Cisco Manager",
        title: "Supporting after Sales",
        body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit",
      },
    ],
    closing_heading: "WHAT\nIF...",
    closing_body: "You Could Change Your\nSuccessful Business to A\nThrivable Business",
  },

  footer: {
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
  for (const [key, data] of Object.entries(sections)) {
    await prisma.section.upsert({
      where: { key },
      update: { data: JSON.stringify(data) },
      create: { key, data: JSON.stringify(data) },
    });
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

  console.log(`Seeded ${Object.keys(sections).length} sections and admin user ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
