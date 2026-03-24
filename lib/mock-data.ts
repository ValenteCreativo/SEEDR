export interface MockProject {
  id: string;
  creator_wallet_address: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  stage: string;
  funding_goal_sol: number;
  current_backed_sol: number;
  cover_image_url: string | null;
  project_url: string | null;
  status: string;
  created_at: string;
  milestones: MockMilestone[];
  benefits: MockBenefit[];
}

export interface MockMilestone {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  status: string;
}

export interface MockBenefit {
  id: string;
  title: string;
  description: string;
  tier_label: string;
}

export const MOCK_PROJECTS: MockProject[] = [
  {
    id: 'mock-1',
    creator_wallet_address: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
    title: 'Waylearn',
    tagline: 'Interactive learning paths for Web3 builders',
    description:
      'Waylearn is an interactive education platform designed specifically for Web3 developers. We offer structured learning paths that take you from blockchain basics to building production dApps on Solana. Each module includes hands-on coding challenges, peer reviews, and on-chain certificates of completion. Our goal is to onboard the next million developers into Web3 by making the learning curve less steep and more fun.',
    category: 'EdTech',
    stage: 'early',
    funding_goal_sol: 15,
    current_backed_sol: 4.2,
    cover_image_url: null,
    project_url: null,
    status: 'active',
    created_at: '2025-03-01T00:00:00Z',
    milestones: [
      { id: 'ms-1-1', title: 'Launch Beta Platform', description: 'Deploy first 5 learning paths with interactive code editor', sort_order: 0, status: 'completed' },
      { id: 'ms-1-2', title: 'On-chain Certificates', description: 'Issue NFT certificates on Solana for completed courses', sort_order: 1, status: 'pending' },
      { id: 'ms-1-3', title: 'Community Marketplace', description: 'Enable community-created learning paths with revenue sharing', sort_order: 2, status: 'pending' },
    ],
    benefits: [
      { id: 'bn-1-1', title: 'Early Access', description: 'Get lifetime access to all learning paths before public launch', tier_label: 'Early Supporter' },
      { id: 'bn-1-2', title: 'Builder Badge NFT', description: 'Exclusive on-chain badge marking you as a founding supporter', tier_label: 'Early Supporter' },
      { id: 'bn-1-3', title: 'Private Discord', description: 'Access to private Discord channel with the founding team', tier_label: 'Early Supporter' },
    ],
  },
  {
    id: 'mock-2',
    creator_wallet_address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    title: 'LoopMarket',
    tagline: 'Circular economy marketplace for local communities',
    description:
      'LoopMarket is a peer-to-peer marketplace that encourages reuse, repair, and local trade. Instead of throwing things away, community members can list items for trade, borrow tools, or find local repair services. Every transaction builds reputation on-chain, creating a trust layer for local economies. We are starting in three pilot cities and plan to expand based on community demand.',
    category: 'Marketplace',
    stage: 'early',
    funding_goal_sol: 25,
    current_backed_sol: 8.5,
    cover_image_url: null,
    project_url: null,
    status: 'active',
    created_at: '2025-02-15T00:00:00Z',
    milestones: [
      { id: 'ms-2-1', title: 'MVP Launch', description: 'Launch marketplace in 3 pilot cities with basic listing and trade functionality', sort_order: 0, status: 'completed' },
      { id: 'ms-2-2', title: 'Reputation System', description: 'Deploy on-chain reputation scoring for community trust', sort_order: 1, status: 'pending' },
      { id: 'ms-2-3', title: 'Repair Network', description: 'Integrate local repair services and tool-lending libraries', sort_order: 2, status: 'pending' },
    ],
    benefits: [
      { id: 'bn-2-1', title: 'Founding Member Badge', description: 'On-chain badge recognizing you as a founding community member', tier_label: 'Early Supporter' },
      { id: 'bn-2-2', title: 'Zero Fees for 1 Year', description: 'No transaction fees on the platform for your first year', tier_label: 'Early Supporter' },
      { id: 'bn-2-3', title: 'Community Governance', description: 'Voting rights on marketplace rules and feature priorities', tier_label: 'Early Supporter' },
    ],
  },
  {
    id: 'mock-3',
    creator_wallet_address: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    title: 'PulseNode',
    tagline: 'Open-source climate sensor network for urban areas',
    description:
      'PulseNode is building an open-source network of environmental sensors for cities. Each node measures air quality, temperature, humidity, and noise levels, publishing data on-chain for transparency. Citizens, researchers, and city planners can access real-time environmental data to make better decisions. We are designing affordable, solar-powered sensor hardware that anyone can deploy.',
    category: 'Climate/IoT',
    stage: 'early',
    funding_goal_sol: 20,
    current_backed_sol: 12.3,
    cover_image_url: null,
    project_url: null,
    status: 'active',
    created_at: '2025-01-20T00:00:00Z',
    milestones: [
      { id: 'ms-3-1', title: 'Hardware Prototype', description: 'Design and test first solar-powered sensor node prototype', sort_order: 0, status: 'completed' },
      { id: 'ms-3-2', title: 'Data Dashboard', description: 'Launch public dashboard with real-time environmental data visualization', sort_order: 1, status: 'pending' },
      { id: 'ms-3-3', title: 'City Pilot Program', description: 'Deploy 50 nodes across first pilot city with municipal partnership', sort_order: 2, status: 'pending' },
    ],
    benefits: [
      { id: 'bn-3-1', title: 'Sensor Node Kit', description: 'Receive a DIY sensor node kit to deploy in your neighborhood', tier_label: 'Early Supporter' },
      { id: 'bn-3-2', title: 'Data Access NFT', description: 'NFT granting premium API access to the full sensor network data', tier_label: 'Early Supporter' },
      { id: 'bn-3-3', title: 'Name a Node', description: 'Name and dedicate a sensor node in the network', tier_label: 'Early Supporter' },
    ],
  },
  {
    id: 'mock-4',
    creator_wallet_address: '6sbzC1eH4FTujJXWj51eQe25cYvr4xfXbJ1vAj7j2k5J',
    title: 'Frameshift',
    tagline: 'AI-powered creative brief tool for indie studios',
    description:
      'Frameshift helps indie game studios and creative agencies generate production-ready creative briefs in minutes instead of days. Using AI trained on thousands of successful creative projects, it generates mood boards, style guides, asset lists, and project timelines. Teams can collaborate in real-time and iterate on briefs with AI assistance. Built by creatives, for creatives.',
    category: 'Creative/AI',
    stage: 'early',
    funding_goal_sol: 12,
    current_backed_sol: 3.7,
    cover_image_url: null,
    project_url: null,
    status: 'active',
    created_at: '2025-03-05T00:00:00Z',
    milestones: [
      { id: 'ms-4-1', title: 'AI Brief Generator', description: 'Launch core AI engine for generating creative briefs from prompts', sort_order: 0, status: 'completed' },
      { id: 'ms-4-2', title: 'Team Collaboration', description: 'Real-time multiplayer editing and commenting on briefs', sort_order: 1, status: 'pending' },
      { id: 'ms-4-3', title: 'Asset Pipeline', description: 'Auto-generate placeholder assets and connect to design tool exports', sort_order: 2, status: 'pending' },
    ],
    benefits: [
      { id: 'bn-4-1', title: 'Pro Plan Free for 6 Months', description: 'Full access to all AI features and unlimited briefs', tier_label: 'Early Supporter' },
      { id: 'bn-4-2', title: 'Custom AI Training', description: 'Train the AI on your studio\'s style and past projects', tier_label: 'Early Supporter' },
      { id: 'bn-4-3', title: 'Founding Studio Badge', description: 'Featured as a founding studio on our public showcase', tier_label: 'Early Supporter' },
    ],
  },
  {
    id: 'mock-5',
    creator_wallet_address: '3Js7k9mHtMGwZnkzRiGs8VgtEbXFgULEYMpvRFvuRL5n',
    title: 'GlyphOS',
    tagline: 'Minimal OS interface for maker hardware',
    description:
      'GlyphOS is a lightweight operating system interface designed for maker hardware like Raspberry Pi, Arduino displays, and custom PCBs. It provides a beautiful, touch-friendly UI layer that makes it easy to build kiosks, smart home panels, point-of-sale terminals, and interactive installations. Think of it as the missing UI layer between your hardware project and a polished product.',
    category: 'Hardware',
    stage: 'early',
    funding_goal_sol: 30,
    current_backed_sol: 6.1,
    cover_image_url: null,
    project_url: null,
    status: 'active',
    created_at: '2025-02-28T00:00:00Z',
    milestones: [
      { id: 'ms-5-1', title: 'Core UI Framework', description: 'Release lightweight rendering engine optimized for low-power displays', sort_order: 0, status: 'completed' },
      { id: 'ms-5-2', title: 'Widget Marketplace', description: 'Community marketplace for UI components and templates', sort_order: 1, status: 'pending' },
      { id: 'ms-5-3', title: 'Hardware Partnerships', description: 'Official support for top 10 maker boards and display modules', sort_order: 2, status: 'pending' },
    ],
    benefits: [
      { id: 'bn-5-1', title: 'Dev Kit', description: 'Pre-configured Raspberry Pi with GlyphOS and sample projects', tier_label: 'Early Supporter' },
      { id: 'bn-5-2', title: 'Premium Widgets', description: 'Lifetime access to all premium UI widgets and themes', tier_label: 'Early Supporter' },
      { id: 'bn-5-3', title: 'Hardware Co-design', description: 'Join the hardware advisory group and influence supported devices', tier_label: 'Early Supporter' },
    ],
  },
  {
    id: 'mock-6',
    creator_wallet_address: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    title: 'Stackwise',
    tagline: 'Personal knowledge graph for developers',
    description:
      'Stackwise automatically builds a personal knowledge graph from your code, docs, bookmarks, and notes. It connects concepts across projects and surfaces relevant context when you need it. Imagine a second brain that actually understands your tech stack. Search across everything you have ever learned, see how concepts relate, and never lose track of that blog post or code snippet again.',
    category: 'Productivity',
    stage: 'early',
    funding_goal_sol: 18,
    current_backed_sol: 9.8,
    cover_image_url: null,
    project_url: null,
    status: 'active',
    created_at: '2025-02-10T00:00:00Z',
    milestones: [
      { id: 'ms-6-1', title: 'Browser Extension', description: 'Chrome/Firefox extension to capture and link web content automatically', sort_order: 0, status: 'completed' },
      { id: 'ms-6-2', title: 'IDE Integration', description: 'VS Code extension that surfaces relevant knowledge while coding', sort_order: 1, status: 'pending' },
      { id: 'ms-6-3', title: 'Graph Visualization', description: 'Interactive 3D knowledge graph explorer with semantic search', sort_order: 2, status: 'pending' },
    ],
    benefits: [
      { id: 'bn-6-1', title: 'Lifetime Pro', description: 'Lifetime access to Pro features including unlimited graph nodes', tier_label: 'Early Supporter' },
      { id: 'bn-6-2', title: 'Beta Tester', description: 'Early access to all new features and integrations', tier_label: 'Early Supporter' },
      { id: 'bn-6-3', title: 'Feature Request Priority', description: 'Your feature requests get priority in the development roadmap', tier_label: 'Early Supporter' },
    ],
  },
];

export function getMockUser(walletAddress: string) {
  return {
    id: 'mock-user-1',
    wallet_address: walletAddress,
    display_name: null,
    username: null,
    bio: null,
    avatar_url: null,
    role_preference: 'backer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
