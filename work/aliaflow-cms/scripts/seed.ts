import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../src/users/user.entity';
import { Section } from '../src/sections/section.entity';
import { Media } from '../src/media/media.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'aliaflow',
  password: process.env.DB_PASSWORD ?? 'aliaflow',
  database: process.env.DB_NAME ?? 'aliaflow_cms',
  entities: [User, Section, Media],
  synchronize: true,
});

const initialSections: Array<{ key: string; label: string; data: Record<string, unknown> }> = [
  {
    key: 'hero',
    label: 'Hero',
    data: {
      eyebrow: 'A L I A F L O W',
      heading: 'YOUR TRUSTED<br />LEADERSHIP PARTNER',
      image: '/assets/boardroom.png',
    },
  },
  {
    key: 'nav-links',
    label: 'Header navigation',
    data: { links: ['Home', 'Products', 'Packages', 'Projects', 'About us', 'Contact us'] },
  },
  {
    key: 'footer',
    label: 'Footer',
    data: {
      eyebrow: "LET'S TALK",
      heading: 'Make your business<br /><em>thrive.</em>',
      email: 'hello@aliaflow.com',
      wordmark: 'ALIAFLOW',
      tagline: 'Leadership partner for desirable, competitive and scalable businesses.',
      social: [
        { label: 'LinkedIn', href: '#home' },
        { label: 'Instagram', href: '#home' },
      ],
      copyright: '© 2025 Aliaflow. All rights reserved.',
    },
  },
  {
    key: 'outcomes',
    label: 'Outcome stack',
    data: {
      items: [
        {
          label: 'is Desirable',
          emphasis: 'DIFFERENT',
          copy: 'We create a truly differentiated business for you, built around the new and emerging needs and desires in your target market.',
          stats: ['# 4 Senses', '# 3 Loops'],
        },
        {
          label: 'is Feasible',
          emphasis: 'COMPETITIVE',
          copy: "The competitive advantage we create for you is based on a mixture of your organization's capabilities and the future of emerging technologies, which makes it a unique and hard-to-copy advantage. At the same time, this competitive advantage will be at several silos and levels of your organization. Different types of innovation would eventually make it hard for your competitors to imitate your business structure.",
          stats: ['# 7 Risks', '# 6 Roles', '# 5 Games'],
        },
        {
          label: 'is Viable',
          emphasis: 'SCALABLE',
          copy: 'At this stage, we design a sustainable revenue model for your business that ensures long-term growth and keeps the organization moving steadily toward its goals. This model is built to support consistent progress, not just short-term gains. We also plan growth in a controlled and strategic way at every phase, ensuring that each step strengthens the business and prepares it for the next version of your business model.',
          stats: ['# 8 Changes', '# 9 Tests'],
        },
      ],
    },
  },
  {
    key: 'service-cards',
    label: 'Service catalogue',
    data: {
      items: [
        { number: '1', title: 'Future of X Book', body: 'We turn complex futures into a clear, shared business narrative.', image: '/assets/magazine.png' },
        { number: '2', title: 'Critical Business Loop', body: 'We discover the loops that connect customer value, operations and growth.', image: '/assets/metro-paths.png' },
        { number: '3', title: 'Brand Culture & XP', body: 'We shape the customer and employee experiences that make strategy tangible.', image: '/assets/people-feedback.png' },
      ],
    },
  },
  {
    key: 'leadership-cards',
    label: 'Leadership cards',
    data: {
      items: [
        { number: '04', title: 'BUSINESS GAME', body: 'Strategic simulation sessions for decisions made under uncertainty.', image: '/assets/leadership-team.png' },
        { number: '05', title: 'STRATEGIC ROLES', body: 'A shared language for accountable, complementary leadership roles.', image: '/assets/metro-boardroom.png' },
        { number: '06', title: 'LEADERSHIP MODEL', body: 'Leadership operating models that turn strategic intent into action.', image: '/assets/speaking-halftone.png' },
      ],
    },
  },
  {
    key: 'design-cards',
    label: 'Design cards',
    data: {
      items: [
        { number: '07', title: 'RISK SETTING', body: 'Set the relevant boundaries before change becomes expensive.', image: '/assets/robotics-halftone.png' },
        { number: '08', title: 'CHANGE SOLVING', body: 'Move complex transformations from ambition to coordinated delivery.', image: '/assets/design-event.png' },
        { number: '09', title: 'PERFORMANCE TESTING', body: 'Test business capability in the reality of your operating system.', image: '/assets/workshop.png' },
      ],
    },
  },
  {
    key: 'projects',
    label: 'Projects',
    data: {
      items: [
        { name: 'Alialab', subtitle: 'Innovation & design lab', image: '/assets/alialab-loop.png' },
        { name: 'Aliapay', subtitle: 'Payment experience', image: '/assets/aliapay-loop.png' },
        { name: 'Aliasys', subtitle: 'Scalable operating system', image: '/assets/aliasys-loop.png' },
      ],
    },
  },
  {
    key: 'trust',
    label: 'Trust section',
    data: {
      eyebrow: 'WHY CHOOSE US?',
      heading: 'Enabling business thrivability through technocratic innovation',
      pillars: [
        { number: '01', title: 'DIFFERENT', body: 'We recognize the needs that are about to matter.' },
        { number: '02', title: 'COMPETITIVE', body: 'We translate strategic intent into operating advantage.' },
        { number: '03', title: 'SCALABLE', body: 'We design change to live beyond the launch.' },
      ],
      teamEyebrow: 'THE PEOPLE BEHIND ALIAFLOW',
      teamHeading: 'One team.<br />Many perspectives.',
      team: [
        { image: '/assets/ehteshamzadeh.png', name: 'S. Ehteshamzadeh', role: 'Strategic Design' },
        { image: '/assets/daem.png', name: 'V. Daem', role: 'Business Leadership' },
        { image: '/assets/mohit.png', name: 'N. Mohit', role: 'Experience Innovation' },
        { image: '/assets/tavakoli.png', name: 'N. Tavakoli', role: 'Transformation' },
      ],
    },
  },
];

async function seed() {
  await dataSource.initialize();

  const usersRepository = dataSource.getRepository(User);
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@aliaflow.com';
  const existingAdmin = await usersRepository.findOne({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'change-me-please', 10);
    await usersRepository.save(usersRepository.create({ email: adminEmail, passwordHash }));
    console.log(`Created admin user ${adminEmail}`);
  } else {
    console.log(`Admin user ${adminEmail} already exists`);
  }

  const sectionsRepository = dataSource.getRepository(Section);
  for (const section of initialSections) {
    const existing = await sectionsRepository.findOne({ where: { key: section.key } });
    if (existing) {
      console.log(`Section "${section.key}" already exists, skipping`);
      continue;
    }
    await sectionsRepository.save(sectionsRepository.create({ ...section, updatedBy: null }));
    console.log(`Seeded section "${section.key}"`);
  }

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
