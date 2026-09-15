import type { FieldSchema, SectionSchema } from "./section-validation";

function text(label: string, description?: string, defaultValue?: string): FieldSchema {
  return { type: "text", label, description, defaultValue };
}

function textarea(label: string, description?: string, defaultValue?: string): FieldSchema {
  return { type: "textarea", label, description, defaultValue };
}

function image(label: string, description?: string, defaultValue?: string): FieldSchema {
  return { type: "image", label, description, defaultValue };
}

function list(
  label: string,
  itemLabel: string,
  fields: Record<string, FieldSchema>,
  description?: string,
): FieldSchema {
  return { type: "list", label, itemLabel, fields, description };
}

export const sectionSchemas: Record<string, SectionSchema> = {
  header: {
    label: "Header",
    fields: {
      wordmark: text("Wordmark", undefined, "ALIAFLOW"),
      logo: image("Logo image", "Shown in the header.", "/assets/aliaflow-logo.svg"),
      logo_alt: text("Logo image description", undefined, "ALIAFLOW"),
      home_href: text("Logo link URL", undefined, "#home"),
      menu_label: text("Mobile menu button label", undefined, "Menu"),
      links: list("Navigation links", "Link", {
        label: text("Label"),
        href: text("Link URL"),
      }),
    },
  },

  hero: {
    label: "Hero",
    fields: {
      eyebrow: text("Eyebrow"),
      heading: textarea("Heading (use a new line for a line break)"),
      image: image("Background image"),
      image_alt: text("Background image description", undefined, "Leadership team around a strategic table"),
    },
  },

  outcomes: {
    label: "Outcomes",
    fields: {
      intro_heading: textarea("Intro heading"),
      title_prefix: text("Outcome title prefix", undefined, "is"),
      title_suffix: text("Outcome title connector", undefined, "but we make it"),
      detail_prefix: text("Outcome detail prefix", undefined, "Not only"),
      detail_connector: text("Outcome detail connector", undefined, "but also"),
      items: list("Outcomes", "Outcome", {
        label: text("Label (e.g. \"is Desirable\")"),
        emphasis: text("Emphasis word (e.g. \"DIFFERENT\")"),
        copy: textarea("Body copy"),
        image: image("Detail panel image"),
        image_alt: text("Detail image description"),
        stats: list("Stats", "Stat", { value: text("Value") }),
      }),
      manifesto_heading: textarea("Manifesto heading"),
      manifesto_words: textarea("Manifesto word stack"),
      manifesto_shape: image("Manifesto decorative image", "Optional decorative asset behind the manifesto words.", "/assets/subtract.svg"),
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
      question_image_alt: text("Question image description", undefined, "A leader standing at the intersection of business pathways"),
      question_section_label: text("Question section label", undefined, "Where to play, how to win"),
      question: textarea("Question heading"),
      service_blocks: list("Service blocks", "Block", {
        number: text("Number"),
        title: text("Title"),
        body: textarea("Body"),
        image: image("Icon image (leave blank to use the default icon)"),
        image_alt: text("Icon image description"),
      }),
      futures: list("Future of X image cards", "Image card", {
        image: image(
          "Complete card image",
          "Upload the finished card artwork. Its title, copy, and visual design should already be part of the image.",
        ),
        alt: text("Image description", "A short description for screen readers."),
      }, "Add, remove, and reorder the images in the draggable card rail."),
      loops: list("Business loop tiles", "Loop", {
        image: image("Card image", "Used in this card only."),
        label: text("Label"),
        title: text("Title"),
        body: textarea("Body"),
        image_alt: text("Card image description"),
      }, "Add, remove, and reorder the Critical Business Loop cards."),
      cultures: list("Culture tiles", "Culture", {
        image: image("Card image", "Used in this card only."),
        label: text("Label"),
        title: text("Title"),
        body: textarea("Body"),
        image_alt: text("Card image description"),
      }, "Add, remove, and reorder the Brand Culture & XP cards."),
      magazine_heading: textarea("Magazine heading"),
      magazine_price: text("Magazine price"),
      magazine_image: image("Magazine image"),
      magazine_image_alt: text("Magazine image description", undefined, "Future of Banking magazine spread"),
      magazine_cta_label: text("Magazine button label", undefined, "Buy Magazine"),
      magazine_cta_href: text("Magazine button URL", undefined, "#contact-us"),
      jam_heading: textarea("JAM heading"),
      jam_date: text("JAM date"),
      jam_body: textarea("JAM body"),
      jam_image: image("JAM image"),
      jam_image_alt: text("JAM image description", undefined, "Venue for the Banking Thrivability JAM"),
      jam_cta_label: text("JAM button label", undefined, "Book Now"),
      jam_cta_href: text("JAM button URL", undefined, "#contact-us"),
    },
  },

  "business-leadership": {
    label: "Business Leadership",
    fields: {
      department_heading: text("Section heading", undefined, "BUSINESS LEADERSHIP"),
      question_image: image("Question hero background image"),
      question_image_alt: text("Question image description"),
      question: textarea("Question heading"),
      statements: list("Statements", "Statement", {
        number: text("Number"),
        title: text("Title"),
        body: textarea("Body"),
        cards: list("Cards", "Card", {
          title: text("Image description", "Used as accessible alternative text and for an empty-card placeholder."),
          image: image("Complete card image", "Upload the finished card artwork for this card only."),
        }, "Add, remove, and reorder the image cards shown under this statement."),
      }),
      holocratic_line: text("Holocratic line"),
      event_title: text("Event title"),
      event_image: image("Event image"),
      event_image_alt: text("Event image description"),
      event_kicker: text("Event supporting heading", undefined, "More workshops to come"),
      event_body: textarea("Event body"),
      event_cta_label: text("Event button label", undefined, "Book Event"),
      event_cta_href: text("Event button URL", undefined, "#contact-us"),
    },
  },

  "technocratic-design": {
    label: "Technocratic Design",
    fields: {
      department_heading: text("Section heading", undefined, "TECHNOCRATIC DESIGN"),
      question_image: image("Question hero background image"),
      question_image_alt: text("Question image description"),
      question: textarea("Question heading"),
      pillars: list("Pillars", "Pillar", { label: text("Label") }),
      statements: list("Statements", "Statement", {
        number: text("Number"),
        title: text("Title"),
        body: textarea("Body"),
        cards: list("Cards", "Card", {
          title: text("Image description", "Used as accessible alternative text and for an empty-card placeholder."),
          image: image("Complete card image", "Upload the finished card artwork for this card only."),
        }, "Add, remove, and reorder the image cards shown under this statement."),
      }),
      event_title: text("Event title"),
      event_image: image("Event image"),
      event_image_alt: text("Event image description"),
      event_kicker: text("Event supporting heading", undefined, "More workshops to come"),
      event_body: textarea("Event body"),
      event_cta_label: text("Event button label", undefined, "Book Event"),
      event_cta_href: text("Event button URL", undefined, "#contact-us"),
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
    },
  },

  "portfolio-people": {
    label: "Portfolio & People",
    fields: {
      portfolio_heading: text("Portfolio heading", undefined, "PORTFOLIO"),
      people_heading: text("People heading", undefined, "PEOPLE"),
      toolkits_heading: text("Toolkits heading", undefined, "DESIGN TOOLKITS"),
      timeline: list("Timeline", "Milestone", {
        year: text("Year"),
        label: text("Label"),
      }),
      people: list("People", "Person", {
        name: text("Name"),
        role: text("Role"),
        image: image("Photo"),
        image_alt: text("Photo description"),
      }),
      toolkits: list("Toolkits", "Toolkit", {
        title: text("Title"),
        body: textarea("Body"),
        image: image("Toolkit image"),
        image_alt: text("Toolkit image description"),
      }),
    },
  },

  "testimonials-footer": {
    label: "Testimonials",
    fields: {
      trust_heading: text("Trust banner heading"),
      trust_subheading: text("Trust banner subheading"),
      partners_heading: text("Partners heading", undefined, "PARTNERS"),
      testimonials_heading: text("Testimonials heading", undefined, "TESTIMONIAL"),
      partners: list("Partners", "Partner", {
        name: text("Name"),
        logo: image("Logo image", "Optional. Leave blank to show a placeholder circle with the name."),
        logo_alt: text("Logo image description"),
      }),
      testimonials: list("Testimonials", "Testimonial", {
        name: text("Name"),
        role: text("Role"),
        title: text("Quote title"),
        body: textarea("Quote body"),
        image: image("Testimonial photo"),
        image_alt: text("Photo description"),
      }),
      closing_heading: textarea("Closing heading"),
      closing_body: textarea("Closing body"),
    },
  },

  footer: {
    label: "Footer",
    fields: {
      logo: image("Logo image", "Shown in the footer.", "/assets/aliaflow-logo.svg"),
      logo_alt: text("Logo image description", undefined, "Aliaflow"),
      home_href: text("Logo link URL", undefined, "#home"),
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
