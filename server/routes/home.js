const express = require('express');
const router = express.Router();

// @route   GET /api/home/testimonials
// @desc    Get testimonials for home page
// @access  Public
router.get('/testimonials', async (req, res) => {
  try {
    // Updated testimonials data with real client testimonials
    const testimonials = [
      {
        id: 1,
        name: 'Jan Jilis van Delsen',
        company: 'Edtech to help training providers make more impact',
        text: 'Having worked with Khalil for several years now, I recommend his way of working, sincerity and especially his aptitude to be a critical friend. His ability to look at each topic from a different angle, turning most issues into opportunities is a skill I admire.',
        subject: 'Leadership Development',
        rating: 5,
        featured: true
      },
      {
        id: 2,
        name: 'Chris Garrard',
        company: 'Healthcare Retention Expert',
        text: 'I was mentored by Khalil via Digital Boost. From our very first session Khalil added so much value and wisdom to my marketing. I have now redefined my in-person and digital marketing structure with heaps of clarity. I\'d really recommend Khalil.',
        subject: 'Marketing Mentorship',
        rating: 5,
        featured: true
      },
      {
        id: 3,
        name: 'Claudia Welsh',
        company: 'Inspirational Leadership Speaker & Radio Presenter',
        text: 'Khalil provided a bespoke product that suited my service and clients, and even shared coaching tips to help close sales. He\'s approachable, knowledgeable, and client-focused. I highly recommend his services and books. It\'s clear he is driven by a desire to see his clients succeed.',
        subject: 'Bespoke Service & Business Coaching',
        rating: 5,
        featured: true
      },
      {
        id: 4,
        name: 'Nishita Soni',
        company: 'UK Visa & Corporate Migration Expert',
        text: 'Mr. Arouni is an amazing business coach and his work speaks to his years of experience. I would definitely recommend his company and his services.',
        subject: 'Business Coaching',
        rating: 5,
        featured: false
      },
      {
        id: 5,
        name: 'Yasser Elhajj',
        company: 'Managing Partner at CBM-Construmat',
        text: 'I have known Khalil for more than thirty years. He\'s the person I seek advice from when I need to bounce ideas or lift my mood. He\'s an authentic, genuine friend and invaluable confidant.',
        subject: 'Personal Support & Advisory',
        rating: 5,
        featured: false
      },
      {
        id: 6,
        name: 'Rafic Kamaleddine',
        company: 'Executive Coach/Consultant',
        text: 'I\'ve known Khalil for over 20 years as a professional and friend. He inspires confidence and provides practical, evidence-based advice. His extensive experience across industries makes him a go-to coach during challenging times.',
        subject: 'Experience and Support',
        rating: 5,
        featured: false
      },
      {
        id: 7,
        name: 'Zahid Khan',
        company: 'Director at Unitrade Infotech Ltd.',
        text: 'Khalil is the best business coach I know. He identifies problems, provides solutions, and holds you accountable. He persistently guides you until you achieve success.',
        subject: 'Business Coaching',
        rating: 5,
        featured: false
      },
      {
        id: 8,
        name: 'Shilpa Bilimoria-Cherry',
        company: 'Creative Director, Founder & Artisan Tailor',
        text: 'Working with Khalil helped me gain clarity and direction in my business. His coaching is fun, engaging, and full of valuable insights. I\'ve seen a real difference in how my business operates.',
        subject: 'Business Development Coaching',
        rating: 5,
        featured: false
      },
      {
        id: 9,
        name: 'Eric Haendler',
        company: 'Director at EHArchitects LTD',
        text: 'Khalil is genuine and empowering. His coaching and seminars introduced tools that improved both me and my business, especially in marketing. Highly recommended.',
        subject: '90 Day Programme & Business Tools',
        rating: 5,
        featured: false
      },
      {
        id: 10,
        name: 'Joanna Darek',
        company: 'Digital Staffing Agency Owner',
        text: 'Khalil genuinely cares about helping leaders succeed. His webinar provided both personal and business development tools, which I found extremely valuable. Highly recommended.',
        subject: '90 Day Planning Webinar',
        rating: 5,
        featured: false
      },
      {
        id: 11,
        name: 'Amandeep S.',
        company: 'Director',
        text: 'Khalil listens, creates actionable weekly plans, and opens your mind to new perspectives. He is a motivational and effective coach. Highly recommended.',
        subject: 'Weekly Business Coaching',
        rating: 5,
        featured: false
      },
      {
        id: 12,
        name: 'Richard Marchena',
        company: 'Owner at SBC Shutters Blinds Curtains Ltd',
        text: 'Khalil\'s session was motivational and packed with actionable insights and resources. It helped me plan my next business moves effectively. Great job, Khalil!',
        subject: '90 Day Business Planning',
        rating: 5,
        featured: false
      },
      {
        id: 13,
        name: 'Kulpreet Sangha',
        company: 'PMO Analyst & Sustainability Advocate',
        text: 'Khalil\'s coaching was tailored to my personality and delivered with deep insight. It opened mental pathways I hadn\'t explored before. He genuinely shares his knowledge.',
        subject: 'Personalised Coaching',
        rating: 5,
        featured: false
      },
      {
        id: 14,
        name: 'Amit Paithankar',
        company: 'Managing Director at Northwest Constructions',
        text: 'Khalil\'s workshops were energising and deeply helpful in organizing my business. He is knowledgeable and experienced. I highly recommend him for business growth.',
        subject: 'Workshops & Business Growth',
        rating: 5,
        featured: false
      },
      {
        id: 15,
        name: 'Jamal Elghandour',
        company: 'General Manager at Al Nahiya Group',
        text: 'I worked with Khalil for many years. His global insights, especially in the GCC region, and his coaching acumen make him one of the best in the field. Highly recommended.',
        subject: 'Business Coaching',
        rating: 5,
        featured: false
      },
      {
        id: 16,
        name: 'Amanda Rose',
        company: 'Photographer & Business Owner at Amanda Rose Photo',
        text: 'I met Khalil at an ActionCoach session and was immediately impressed by his deep knowledge and passion for business growth, paired with a warm, approachable demeanor. As a first-time business owner, the guidance and practical tools I received were invaluable.',
        subject: 'Business Growth & Coaching',
        rating: 5,
        featured: false
      },
      {
        id: 17,
        name: 'Venkata Varadarajan',
        company: 'Marketing Consultant | Brand Strategist | LinkedIn Top Voice',
        text: 'Khalil is highly accessible, deeply knowledgeable in advertising research, and maintains a perfect balance of professionalism and genuine care for colleagues. I consider him not just a great boss but a mentor.',
        subject: 'Leadership & Mentorship',
        rating: 5,
        featured: false
      },
      {
        id: 18,
        name: 'Soykan Geçit',
        company: 'Digital Director at Wavemaker Turkey',
        text: 'Working with Khalil during our Saudi Arabia operations was a valuable experience. He is an ambitious professional with deep expertise and a proactive, solutions-oriented approach that added significant value to our business.',
        subject: 'Strategic Operations',
        rating: 5,
        featured: false
      },
      {
        id: 19,
        name: 'Hisham Saud Al Johar',
        company: 'GM, Communications Planning & Governance, Ministry of Finance, Saudi Arabia',
        text: 'Khalil is one of the best professionals in his field. His strategic vision, expertise in marketing communications, and hands-on approach make him an asset to any team.',
        subject: 'Strategic Communications',
        rating: 5,
        featured: false
      },
      {
        id: 20,
        name: 'Abdul Razzaq Abu Ghazaleh',
        company: 'Marketing Consultant',
        text: 'Khalil possesses a deep understanding of client needs. His experience with leading brands enables him to craft effective media strategies and the right media mix.',
        subject: 'Media Strategy',
        rating: 5,
        featured: false
      },
      {
        id: 21,
        name: 'Ammar M.',
        company: 'COO at Al Tazaj Fakieh',
        text: 'Khalil was a true business partner—proactive, KPI-driven, and always acting in the best interest of our business. His strategic thinking and commitment brought a fresh perspective to our operations.',
        subject: 'Strategic Partnership',
        rating: 5,
        featured: false
      },
      {
        id: 22,
        name: 'Charles Boutros',
        company: 'Commercial Director',
        text: 'Khalil is a professional of the highest caliber—decent, experienced, and a pleasure to work with. His integrity and expertise consistently leave a positive impact on those around him.',
        subject: 'Professional Excellence',
        rating: 5,
        featured: false
      },
      {
        id: 23,
        name: 'Bander Asiri',
        company: 'Founder & Strategic Advisor',
        text: 'Khalil truly embodies what it means to be a business partner. He invests time in understanding the business thoroughly and goes the extra mile to uncover new opportunities and add value.',
        subject: 'Strategic Advisory',
        rating: 5,
        featured: false
      },
      {
        id: 24,
        name: 'Hassan Yazdi',
        company: 'Corporate Communication Director at BOE',
        text: 'Khalil is friendly, highly knowledgeable, and always solution-oriented. Working with him was a great experience—he consistently finds creative solutions and ensures progress even in challenging situations.',
        subject: 'Problem Solving & Solutions',
        rating: 5,
        featured: false
      },
      {
        id: 25,
        name: 'Omer Azeem',
        company: 'Strategy Consultant / Head of Strategy / Brand Development & Growth',
        text: 'Khalil is a seasoned media professional, who always has a keen eye on the overall media landscape and the trends which influence it. With his rich experience in media research and media strategy, his team is blessed to have him as a guide, coach and a manager.',
        subject: 'Media Strategy & Leadership',
        rating: 5,
        featured: false
      },
      {
        id: 26,
        name: 'Sa\'ed Totah',
        company: 'Group Chief Marketing Officer',
        text: 'It was always a pleasure working with Khalil. He was positioned as the hero on our business, handling all strategic and communication recommendations to clients. His passion and knowledge positioned him as the trusted media source for us and our clients.',
        subject: 'Strategic Leadership & Client Service',
        rating: 5,
        featured: false
      },
      {
        id: 27,
        name: 'Shadi Braish',
        company: 'Integrated Marketing Communication Solutions, Account Management',
        text: 'Khalil was the answer to all our queries in research. His great support through quantitative and qualitative research in every presentation/meeting was essential to equip the team with the right tools to achieve excellent results for our clients.',
        subject: 'Research Support & Insight',
        rating: 5,
        featured: false
      },
      {
        id: 28,
        name: 'Tom Roy',
        company: 'Strategist, Entrepreneur, Catalyst, Digital Marketing Specialist',
        text: 'Khalil is a tremendous resource to have on your team. He is hard working, energetic and amiable, at the same time. He has a thorough knowledge of the media environment in our market, is committed to continuously improve the agency product.',
        subject: 'Media Expertise & Team Contribution',
        rating: 5,
        featured: false
      },
      {
        id: 29,
        name: 'Arun Kumar Krishnan',
        company: 'COO - UAE, NGO Volunteer, Community Building, Market Analyst',
        text: 'Khalil is very practical and one of those very few managers who forms an opinion based on multiple researches and surveys. He is result oriented, and a good team manager. His warm and pleasing nature make him a person to work with.',
        subject: 'Practical Thinking & Team Management',
        rating: 5,
        featured: false
      },
      {
        id: 30,
        name: 'Imad Sarrouf',
        company: 'CEO | Growth Strategist | Digital Transformation & Marketing',
        text: 'Khalil is a very high energy, highly pragmatic professional who has the skills for identifying emerging trends and determining how best to act on them. He consistently delivers achievable solutions that reflect solid marketing insights.',
        subject: 'Strategic Foresight & Leadership',
        rating: 5,
        featured: false
      },
      {
        id: 31,
        name: 'Paul Aranjo',
        company: 'Growth Catalyst',
        text: 'In a world full of those who love to make themselves heard, Khalil is a breath of fresh air. His measured approach is reassuring. He is a good listener and only after he has fully comprehended the situation he springs to action.',
        subject: 'Decision-making & Leadership',
        rating: 5,
        featured: false
      },
      {
        id: 32,
        name: 'Ara M. Peltekian',
        company: 'Story Teller | Visionary | Strategic | Creative | Entrepreneurial',
        text: 'I would not hesitate to recommend Khalil, a true professional in his field, very personable with a high level of integrity and ethical standards.',
        subject: 'Professionalism & Integrity',
        rating: 5,
        featured: false
      },
      {
        id: 33,
        name: 'Chris Radford',
        company: 'Strategic Advisor and Non-Executive Director',
        text: 'Khalil always provided attentive service and delivered great results. It was a pleasure to do business with him. The market insights and research tools we used were excellent and valuable to us.',
        subject: 'Client Service & Research Tools',
        rating: 5,
        featured: false
      },
      {
        id: 34,
        name: 'Fouad Bedran',
        company: 'Owner, Manager at Vrè Nord Delivery Co.',
        text: 'Khalil is a 5-stars industry professional with loads of knowledge and know-how, great positive attitude and extremely reliable. He is also a very good team player and a genuine individual.',
        subject: 'Industry Knowledge & Team Spirit',
        rating: 5,
        featured: false
      }
    ];

    res.json({
      success: true,
      data: testimonials,
      total: testimonials.length
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching testimonials'
    });
  }
});

// @route   GET /api/home/services
// @desc    Get services for home page
// @access  Public
router.get('/services', async (req, res) => {
  try {
    const services = [
      {
        id: 1,
        title: 'Resilience Coaching',
        description: 'One-on-one coaching to build resilience, navigate challenges, and achieve personal transformation through the TRIUMPH model.',
        icon: 'PsychologyIcon',
        color: 'linear-gradient(45deg, #5e35b1 0%, #7c4dff 100%)',
        features: [
          'Personal transformation coaching',
          'TRIUMPH model implementation',
          'Goal setting and achievement',
          'Stress and anxiety management',
          'Building mental resilience'
        ],
        duration: '60-90 minutes per session',
        price: 'Contact for pricing',
        popular: true
      },
      {
        id: 2,
        title: 'Keynote Speaking',
        description: 'Powerful, authentic presentations on resilience, post-traumatic growth, and navigating life-altering challenges.',
        icon: 'RecordVoiceOverIcon',
        color: 'linear-gradient(45deg, #3949ab 0%, #536dfe 100%)',
        features: [
          'Inspirational keynote presentations',
          'Post-traumatic growth topics',
          'Resilience building strategies',
          'Personal transformation stories',
          'Interactive audience engagement'
        ],
        duration: '45-90 minutes',
        price: 'Contact for pricing',
        popular: false
      },
      {
        id: 3,
        title: 'Corporate Workshops',
        description: 'Customized workshops to build resilient teams, foster workplace wellbeing, and develop leadership through change.',
        icon: 'GroupsIcon',
        color: 'linear-gradient(45deg, #1e88e5 0%, #42a5f5 100%)',
        features: [
          'Team resilience building',
          'Leadership development',
          'Change management training',
          'Workplace wellbeing programs',
          'Organizational transformation'
        ],
        duration: 'Half-day to multi-day programs',
        price: 'Contact for pricing',
        popular: false
      }
    ];

    res.json({
      success: true,
      data: services,
      total: services.length
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching services'
    });
  }
});

// @route   GET /api/home/stats
// @desc    Get statistics for home page
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      yearsExperience: 25,
      clientsHelped: 500,
      workshopsDelivered: 150,
      countriesReached: 12,
      booksPublished: 1,
      successRate: 95
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching stats'
    });
  }
});

// @route   GET /api/home/triumph-model
// @desc    Get TRIUMPH model details
// @access  Public
router.get('/triumph-model', async (req, res) => {
  try {
    const triumphModel = {
      title: 'The TRIUMPH Model',
      description: 'A comprehensive 7-step framework for building resilience and achieving transformation',
      steps: [
        {
          letter: 'T',
          title: 'Trust the process',
          description: 'Learn to trust in your journey and the process of growth, even when the path seems unclear.',
          details: 'Building faith in your ability to overcome challenges and trusting that every experience serves a purpose in your development.'
        },
        {
          letter: 'R',
          title: 'Reclaim your inner strength',
          description: 'Rediscover and harness the power that lies within you to overcome any obstacle.',
          details: 'Identifying your core strengths, values, and capabilities that have carried you through previous challenges.'
        },
        {
          letter: 'I',
          title: 'Identify opportunities in challenges',
          description: 'Transform setbacks into stepping stones by finding the hidden opportunities within difficulties.',
          details: 'Developing the mindset to see challenges as growth opportunities and learning experiences.'
        },
        {
          letter: 'U',
          title: 'Understand your purpose',
          description: 'Clarify your life\'s mission and align your actions with your deeper calling.',
          details: 'Discovering your unique purpose and how your experiences can serve others and create meaningful impact.'
        },
        {
          letter: 'M',
          title: 'Manage change effectively',
          description: 'Develop the skills and mindset needed to navigate change with confidence and grace.',
          details: 'Building adaptability, resilience, and the ability to thrive in uncertain and changing environments.'
        },
        {
          letter: 'P',
          title: 'Pursue growth mindset',
          description: 'Embrace continuous learning and development as a way of life.',
          details: 'Cultivating curiosity, openness to feedback, and the belief that abilities can be developed through dedication.'
        },
        {
          letter: 'H',
          title: 'Harness your spiritual wellbeing',
          description: 'Connect with your spiritual dimension to find peace, purpose, and inner strength.',
          details: 'Exploring and nurturing your spiritual practices, whether through meditation, prayer, nature, or other meaningful connections.'
        }
      ]
    };

    res.json({
      success: true,
      data: triumphModel
    });
  } catch (error) {
    console.error('Error fetching TRIUMPH model:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching TRIUMPH model'
    });
  }
});

// @route   GET /api/home/about
// @desc    Get about information for home page
// @access  Public
router.get('/about', async (req, res) => {
  try {
    const about = {
      name: 'Khalil Arouni',
      title: 'Resilience Coach & Author',
      bio: 'I am Khalil Arouni, a survivor of multiple critical illnesses, including cancer and a liver transplant. This journey wasn\'t just about survival; it was a profound lesson in resilience, spiritual strength, and the human capacity for transformation.',
      credentials: [
        'MBA - Master of Business Administration',
        'CMgr MCMI - Chartered Manager',
        'FCIM - Fellow of the Chartered Institute of Marketing',
        '25+ years international media consulting experience',
        'Published Author of "My Best Friend"',
        'Certified Resilience Coach'
      ],
      achievements: [
        'Survived multiple life-threatening illnesses',
        'Developed the TRIUMPH resilience model',
        'Published author and keynote speaker',
        'International media consultant',
        'Helped 500+ individuals and organizations',
        'Delivered workshops in 12+ countries'
      ],
      mission: 'To help individuals and organizations build resilience, navigate adversity, and achieve lasting positive transformation through the TRIUMPH model.',
      vision: 'A world where everyone has the tools and support needed to transform challenges into opportunities for growth and success.'
    };

    res.json({
      success: true,
      data: about
    });
  } catch (error) {
    console.error('Error fetching about information:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching about information'
    });
  }
});

module.exports = router;
