import type { FieldSchema, SectionSchema } from "./section-validation";

function text(label: string): FieldSchema {
  return { type: "text", label };
}

function textarea(label: string): FieldSchema {
  return { type: "textarea", label };
}

function image(label: string): FieldSchema {
  return { type: "image", label };
}

function list(label: string, itemLabel: string, fields: Record<string, FieldSchema>): FieldSchema {
  return { type: "list", label, itemLabel, fields };
}

export const sectionSchemas: Record<string, SectionSchema> = {
  header: {
    label: "Header",
    fields: {
      wordmark: text("Wordmark"),
      links: list("Navigation links", "Link", {
        label: text("Label"),
      }),
    },
  },

  hero: {
    label: "Hero",
    fields: {
      eyebrow: text("Eyebrow"),
      heading: textarea("Heading (use a new line for a line break)"),
      image: image("Background image"),
    },
  },

  outcomes: {
    label: "Outcomes",
    fields: {
      intro_heading: textarea("Intro heading"),
      items: list("Outcomes", "Outcome", {
        label: text("Label (e.g. \"is Desirable\")"),
        emphasis: text("Emphasis word (e.g. \"DIFFERENT\")"),
        copy: textarea("Body copy"),
        image: image("Detail panel image"),
        stats: list("Stats", "Stat", { value: text("Value") }),
      }),
      manifesto_heading: textarea("Manifesto heading"),
      manifesto_words: textarea("Manifesto word stack"),
    },
  },

  "service-catalogue-nav": {
    label: "Service Catalogue Nav",
    fields: {
      heading: text("Heading"),
      tabs: list("Tabs", "Tab", {
        number: text("Number"),
        label: text("Label"),
      }),
    },
  },

  "thrivable-business": {
    label: "Thrivable Business",
    fields: {
      heading: text("Heading"),
      question_image: image("Question section image"),
      question: textarea("Question heading"),
      service_blocks: list("Service blocks", "Block", {
        number: text("Number"),
        title: text("Title"),
        body: textarea("Body"),
        image: image("Icon image (leave blank to use the default icon)"),
      }),
      futures_image: image("Futures grid background image"),
      futures: list("Future cards", "Future", {
        title: text("Card label"),
        heading: textarea("Heading"),
        tags: textarea("Tags"),
      }),
      loops: list("Business loop tiles", "Loop", {
        image: image("Image"),
        label: text("Label"),
        title: text("Title"),
      }),
      cultures: list("Culture tiles", "Culture", {
        image: image("Image"),
        label: text("Label"),
        title: text("Title"),
      }),
      magazine_heading: textarea("Magazine heading"),
      magazine_price: text("Magazine price"),
      magazine_image: image("Magazine image"),
      jam_heading: textarea("JAM heading"),
      jam_date: text("JAM date"),
      jam_body: textarea("JAM body"),
      jam_image: image("JAM image"),
    },
  },

  "business-leadership": {
    label: "Business Leadership",
    fields: {
      question_image: image("Question hero background image"),
      question: textarea("Question heading"),
      statements: list("Statements", "Statement", {
        number: text("Number"),
        title: text("Title"),
        body: textarea("Body"),
        cards: list("Cards", "Card", {
          title: text("Title"),
          image: image("Image (leave blank for a plain numbered tile)"),
        }),
      }),
      holocratic_line: text("Holocratic line"),
      event_title: text("Event title"),
      event_image: image("Event image"),
    },
  },

  "technocratic-design": {
    label: "Technocratic Design",
    fields: {
      question_image: image("Question hero background image"),
      question: textarea("Question heading"),
      pillars: list("Pillars", "Pillar", { label: text("Label") }),
      statements: list("Statements", "Statement", {
        number: text("Number"),
        title: text("Title"),
        body: textarea("Body"),
        cards: list("Cards", "Card", {
          title: text("Title"),
          image: image("Image (leave blank for a plain numbered tile)"),
        }),
      }),
      event_title: text("Event title"),
      event_image: image("Event image"),
    },
  },

  "execution-management": {
    label: "Execution Management",
    fields: {
      heading: text("Heading"),
      orbit_labels: list("Orbit labels", "Label", { label: textarea("Label") }),
      emphasized_label: textarea("Emphasized (center) label"),
      body: textarea("Body"),
    },
  },

  "why-choose-us": {
    label: "Why Choose Us",
    fields: {
      eyebrow: text("Eyebrow"),
      heading: textarea("Heading"),
      points: list("Points", "Point", {
        label: text("Label"),
        body: textarea("Body"),
      }),
    },
  },

  "portfolio-people": {
    label: "Portfolio & People",
    fields: {
      timeline: list("Timeline", "Milestone", {
        year: text("Year"),
        label: text("Label"),
      }),
      people: list("People", "Person", {
        name: text("Name"),
        role: text("Role"),
        image: image("Photo"),
      }),
      toolkits: list("Toolkits", "Toolkit", {
        title: text("Title"),
        body: textarea("Body"),
      }),
    },
  },

  "testimonials-footer": {
    label: "Testimonials",
    fields: {
      trust_heading: text("Trust banner heading"),
      trust_subheading: text("Trust banner subheading"),
      partners: list("Partners", "Partner", { name: text("Name") }),
      testimonials: list("Testimonials", "Testimonial", {
        name: text("Name"),
        role: text("Role"),
        title: text("Quote title"),
        body: textarea("Quote body"),
      }),
      closing_heading: textarea("Closing heading"),
      closing_body: textarea("Closing body"),
    },
  },

  footer: {
    label: "Footer",
    fields: {
      eyebrow: text("Eyebrow"),
      heading_line1: text("Heading line 1"),
      heading_emphasis: text("Heading emphasis word"),
      email: text("Contact email"),
      description: textarea("Description"),
      social_links: list("Social links", "Link", {
        label: text("Label"),
        href: text("URL"),
      }),
      copyright: text("Copyright line"),
    },
  },
};
