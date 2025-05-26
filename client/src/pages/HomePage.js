import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import { Link as RouterLink } from 'react-router-dom';

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArticleIcon from '@mui/icons-material/Article';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import PsychologyIcon from '@mui/icons-material/Psychology';
import GroupsIcon from '@mui/icons-material/Groups';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// Components
import HeroSection from '../components/home/HeroSection';

const HomePage = () => {
  // Testimonials carousel state
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  
  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: 'Jan Jilis van Delsen',
      company: 'Edtech to help training providers make more impact',
      text: 'Having worked with Khalil for several years now, I recommend his way of working, sincerity and especially his aptitude to be a critical friend. His ability to look at each topic from a different angle, turning most issues into opportunities is a skill I admire.'
    },
    {
      id: 2,
      name: 'Chris Garrard',
      company: 'Healthcare Retention Expert',
      text: 'I was mentored by Khalil via Digital Boost. From our very first session Khalil added so much value and wisdom to my marketing. I have now redefined my in-person and digital marketing structure with heaps of clarity. I\'d really recommend Khalil.'
    },
    {
      id: 3,
      name: 'Claudia Welsh',
      company: 'Inspirational Leadership Speaker & Radio Presenter',
      text: 'Khalil provided a bespoke product that suited my service and clients, and even shared coaching tips to help close sales. He\'s approachable, knowledgeable, and client-focused. I highly recommend his services and books. It\'s clear he is driven by a desire to see his clients succeed.'
    },
    {
      id: 4,
      name: 'Nishita Soni',
      company: 'UK Visa & Corporate Migration Expert',
      text: 'Mr. Arouni is an amazing business coach and his work speaks to his years of experience. I would definitely recommend his company and his services.'
    },
    {
      id: 5,
      name: 'Yasser Elhajj',
      company: 'Managing Partner at CBM-Construmat',
      text: 'I have known Khalil for more than thirty years. He\'s the person I seek advice from when I need to bounce ideas or lift my mood. He\'s an authentic, genuine friend and invaluable confidant.'
    },
    {
      id: 6,
      name: 'Rafic Kamaleddine',
      company: 'Executive Coach/Consultant',
      text: 'I\'ve known Khalil for over 20 years as a professional and friend. He inspires confidence and provides practical, evidence-based advice. His extensive experience across industries makes him a go-to coach during challenging times.'
    },
    {
      id: 7,
      name: 'Zahid Khan',
      company: 'Director at Unitrade Infotech Ltd.',
      text: 'Khalil is the best business coach I know. He identifies problems, provides solutions, and holds you accountable. He persistently guides you until you achieve success.'
    },
    {
      id: 8,
      name: 'Shilpa Bilimoria-Cherry',
      company: 'Creative Director, Founder & Artisan Tailor',
      text: 'Working with Khalil helped me gain clarity and direction in my business. His coaching is fun, engaging, and full of valuable insights. I\'ve seen a real difference in how my business operates.'
    },
    {
      id: 9,
      name: 'Eric Haendler',
      company: 'Director at EHArchitects LTD',
      text: 'Khalil is genuine and empowering. His coaching and seminars introduced tools that improved both me and my business, especially in marketing. Highly recommended.'
    },
    {
      id: 10,
      name: 'Joanna Darek',
      company: 'Digital Staffing Agency Owner',
      text: 'Khalil genuinely cares about helping leaders succeed. His webinar provided both personal and business development tools, which I found extremely valuable. Highly recommended.'
    },
    {
      id: 11,
      name: 'Amandeep S.',
      company: 'Director',
      text: 'Khalil listens, creates actionable weekly plans, and opens your mind to new perspectives. He is a motivational and effective coach. Highly recommended.'
    },
    {
      id: 12,
      name: 'Richard Marchena',
      company: 'Owner at SBC Shutters Blinds Curtains Ltd',
      text: 'Khalil\'s session was motivational and packed with actionable insights and resources. It helped me plan my next business moves effectively. Great job, Khalil!'
    },
    {
      id: 13,
      name: 'Kulpreet Sangha',
      company: 'PMO Analyst & Sustainability Advocate',
      text: 'Khalil\'s coaching was tailored to my personality and delivered with deep insight. It opened mental pathways I hadn\'t explored before. He genuinely shares his knowledge.'
    },
    {
      id: 14,
      name: 'Amit Paithankar',
      company: 'Managing Director at Northwest Constructions',
      text: 'Khalil\'s workshops were energising and deeply helpful in organizing my business. He is knowledgeable and experienced. I highly recommend him for business growth.'
    },
    {
      id: 15,
      name: 'Jamal Elghandour',
      company: 'General Manager at Al Nahiya Group',
      text: 'I worked with Khalil for many years. His global insights, especially in the GCC region, and his coaching acumen make him one of the best in the field. Highly recommended.'
    },
    {
      id: 16,
      name: 'Amanda Rose',
      company: 'Photographer & Business Owner at Amanda Rose Photo',
      text: 'I met Khalil at an ActionCoach session and was immediately impressed by his deep knowledge and passion for business growth, paired with a warm, approachable demeanor. As a first-time business owner, the guidance and practical tools I received were invaluable.'
    },
    {
      id: 17,
      name: 'Venkata Varadarajan',
      company: 'Marketing Consultant | Brand Strategist | LinkedIn Top Voice',
      text: 'Khalil is highly accessible, deeply knowledgeable in advertising research, and maintains a perfect balance of professionalism and genuine care for colleagues. I consider him not just a great boss but a mentor.'
    },
    {
      id: 18,
      name: 'Soykan Geçit',
      company: 'Digital Director at Wavemaker Turkey',
      text: 'Working with Khalil during our Saudi Arabia operations was a valuable experience. He is an ambitious professional with deep expertise and a proactive, solutions-oriented approach that added significant value to our business.'
    },
    {
      id: 19,
      name: 'Hisham Saud Al Johar',
      company: 'GM, Communications Planning & Governance, Ministry of Finance, Saudi Arabia',
      text: 'Khalil is one of the best professionals in his field. His strategic vision, expertise in marketing communications, and hands-on approach make him an asset to any team.'
    },
    {
      id: 20,
      name: 'Abdul Razzaq Abu Ghazaleh',
      company: 'Marketing Consultant',
      text: 'Khalil possesses a deep understanding of client needs. His experience with leading brands enables him to craft effective media strategies and the right media mix.'
    },
    {
      id: 21,
      name: 'Ammar M.',
      company: 'COO at Al Tazaj Fakieh',
      text: 'Khalil was a true business partner—proactive, KPI-driven, and always acting in the best interest of our business. His strategic thinking and commitment brought a fresh perspective to our operations.'
    },
    {
      id: 22,
      name: 'Charles Boutros',
      company: 'Commercial Director',
      text: 'Khalil is a professional of the highest caliber—decent, experienced, and a pleasure to work with. His integrity and expertise consistently leave a positive impact on those around him.'
    },
    {
      id: 23,
      name: 'Bander Asiri',
      company: 'Founder & Strategic Advisor',
      text: 'Khalil truly embodies what it means to be a business partner. He invests time in understanding the business thoroughly and goes the extra mile to uncover new opportunities and add value.'
    },
    {
      id: 24,
      name: 'Hassan Yazdi',
      company: 'Corporate Communication Director at BOE',
      text: 'Khalil is friendly, highly knowledgeable, and always solution-oriented. Working with him was a great experience—he consistently finds creative solutions and ensures progress even in challenging situations.'
    },
    {
      id: 25,
      name: 'Omer Azeem',
      company: 'Strategy Consultant / Head of Strategy / Brand Development & Growth',
      text: 'Khalil is a seasoned media professional, who always has a keen eye on the overall media landscape and the trends which influence it. With his rich experience in media research and media strategy, his team is blessed to have him as a guide, coach and a manager.'
    },
    {
      id: 26,
      name: 'Sa\'ed Totah',
      company: 'Group Chief Marketing Officer',
      text: 'It was always a pleasure working with Khalil. He was positioned as the hero on our business, handling all strategic and communication recommendations to clients. His passion and knowledge positioned him as the trusted media source for us and our clients.'
    },
    {
      id: 27,
      name: 'Shadi Braish',
      company: 'Integrated Marketing Communication Solutions, Account Management',
      text: 'Khalil was the answer to all our queries in research. His great support through quantitative and qualitative research in every presentation/meeting was essential to equip the team with the right tools to achieve excellent results for our clients.'
    },
    {
      id: 28,
      name: 'Tom Roy',
      company: 'Strategist, Entrepreneur, Catalyst, Digital Marketing Specialist',
      text: 'Khalil is a tremendous resource to have on your team. He is hard working, energetic and amiable, at the same time. He has a thorough knowledge of the media environment in our market, is committed to continuously improve the agency product.'
    },
    {
      id: 29,
      name: 'Arun Kumar Krishnan',
      company: 'COO - UAE, NGO Volunteer, Community Building, Market Analyst',
      text: 'Khalil is very practical and one of those very few managers who forms an opinion based on multiple researches and surveys. He is result oriented, and a good team manager. His warm and pleasing nature make him a person to work with.'
    },
    {
      id: 30,
      name: 'Imad Sarrouf',
      company: 'CEO | Growth Strategist | Digital Transformation & Marketing',
      text: 'Khalil is a very high energy, highly pragmatic professional who has the skills for identifying emerging trends and determining how best to act on them. He consistently delivers achievable solutions that reflect solid marketing insights.'
    },
    {
      id: 31,
      name: 'Paul Aranjo',
      company: 'Growth Catalyst',
      text: 'In a world full of those who love to make themselves heard, Khalil is a breath of fresh air. His measured approach is reassuring. He is a good listener and only after he has fully comprehended the situation he springs to action.'
    },
    {
      id: 32,
      name: 'Ara M. Peltekian',
      company: 'Story Teller | Visionary | Strategic | Creative | Entrepreneurial',
      text: 'I would not hesitate to recommend Khalil, a true professional in his field, very personable with a high level of integrity and ethical standards.'
    },
    {
      id: 33,
      name: 'Chris Radford',
      company: 'Strategic Advisor and Non-Executive Director',
      text: 'Khalil always provided attentive service and delivered great results. It was a pleasure to do business with him. The market insights and research tools we used were excellent and valuable to us.'
    },
    {
      id: 34,
      name: 'Fouad Bedran',
      company: 'Owner, Manager at Vrè Nord Delivery Co.',
      text: 'Khalil is a 5-stars industry professional with loads of knowledge and know-how, great positive attitude and extremely reliable. He is also a very good team player and a genuine individual.'
    }
  ];
  
  // Skills data
  const skills = [
    { 
      category: 'Coaching & Training', 
      items: ['Resilience Coaching', 'Leadership Development', 'Corporate Training', 'Team Building', 'Change Management'] 
    },
    { 
      category: 'Business Expertise', 
      items: ['Media Consulting', 'Marketing Strategy', 'Project Management', 'Business Development', 'Organizational Leadership'] 
    },
    { 
      category: 'Speaking & Writing', 
      items: ['Keynote Speaking', 'Workshop Facilitation', 'Published Author', 'Content Creation', 'Spiritual Wellbeing'] 
    }
  ];

  // Testimonials carousel functions
  const testimonialsPerPage = 3;
  const maxIndex = Math.max(0, Math.ceil(testimonials.length / testimonialsPerPage) - 1);

  const handlePrevTestimonials = () => {
    setCurrentTestimonialIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextTestimonials = () => {
    setCurrentTestimonialIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const getCurrentTestimonials = () => {
    const startIndex = currentTestimonialIndex * testimonialsPerPage;
    return testimonials.slice(startIndex, startIndex + testimonialsPerPage);
  };
  
  return (
    <>
      <Helmet>
        <title>Khalil Arouni - Resilience Coach & Author</title>
        <meta name="description" content="Khalil Arouni - Author, keynote speaker, and resilience coach offering transformational coaching through the TRIUMPH model." />
      </Helmet>
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Services Section */}
      <Box 
        id="services" 
        component="section" 
        sx={{ 
          py: 10, 
          backgroundColor: 'background.paper',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40%',
            height: '100%',
            backgroundImage: `radial-gradient(circle, rgba(124, 77, 255, 0.1) 0%, rgba(124, 77, 255, 0) 70%)`,
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box textAlign="center" mb={6}>
            <Typography 
              variant="overline" 
              color="primary" 
              component="p"
              sx={{ fontWeight: 500, letterSpacing: 1.5 }}
            >
              How I Can Help
            </Typography>
            <Typography 
              variant="h3" 
              component="h2"
              sx={{ 
                mb: 2,
                fontWeight: 700 
              }}
            >
              My Services
            </Typography>
            <Divider 
              sx={{ 
                width: 80, 
                mx: 'auto', 
                my: 3, 
                borderColor: 'primary.main',
                borderWidth: 2,
                borderRadius: 1
              }} 
            />
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                fontWeight: 400 
              }}
            >
              Specialized resilience-building services for individuals and organizations using the proven TRIUMPH framework
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {/* Service Cards */}
            {[
              {
                icon: <PsychologyIcon fontSize="large" />,
                title: 'Resilience Coaching',
                description: 'One-on-one coaching to build resilience, navigate challenges, and achieve personal transformation through the TRIUMPH model.',
                path: '/booking',
                color: 'linear-gradient(45deg, #5e35b1 0%, #7c4dff 100%)'
              },
              {
                icon: <RecordVoiceOverIcon fontSize="large" />,
                title: 'Keynote Speaking',
                description: 'Powerful, authentic presentations on resilience, post-traumatic growth, and navigating life-altering challenges.',
                path: '/booking',
                color: 'linear-gradient(45deg, #3949ab 0%, #536dfe 100%)'
              },
              {
                icon: <GroupsIcon fontSize="large" />,
                title: 'Corporate Workshops',
                description: 'Customized workshops to build resilient teams, foster workplace wellbeing, and develop leadership through change.',
                path: '/booking',
                color: 'linear-gradient(45deg, #1e88e5 0%, #42a5f5 100%)'
              }
            ].map((service, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  elevation={4} 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)'
                    }
                  }}
                >
                  {/* Card Top Color Bar */}
                  <Box 
                    sx={{ 
                      height: 15, 
                      width: '100%', 
                      background: service.color 
                    }} 
                  />
                  
                  <CardContent sx={{ p: 4, flexGrow: 1 }}>
                    <Avatar 
                      sx={{ 
                        mb: 2, 
                        width: 64, 
                        height: 64,
                        background: `${service.color}33`,
                        color: service.color.split(' ')[2].split(')')[0]
                      }}
                    >
                      {service.icon}
                    </Avatar>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                      {service.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {service.description}
                    </Typography>
                    <Button 
                      component={RouterLink} 
                      to={service.path}
                      variant="outlined" 
                      sx={{ 
                        mt: 2,
                        borderRadius: 2,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2
                        }
                      }}
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* About/Skills Section */}
      <Box 
        component="section" 
        sx={{ 
          py: 10, 
          backgroundColor: 'background.default' 
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="overline" 
                color="primary" 
                component="p"
                sx={{ fontWeight: 500, letterSpacing: 1.5 }}
              >
                About Me
              </Typography>
              <Typography 
                variant="h3" 
                component="h2"
                sx={{ 
                  mb: 3,
                  fontWeight: 700 
                }}
              >
                My Journey & Expertise
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                I am Khalil Arouni, a survivor of multiple critical illnesses, including cancer and a liver transplant. 
                This journey wasn't just about survival; it was a profound lesson in resilience, spiritual strength, 
                and the human capacity for transformation. From these experiences, I authored "My Best Friend" and 
                developed the TRIUMPH model – a 7-step framework to help individuals and organisations navigate 
                adversity, reclaim their inner strength, and achieve lasting positive change.
              </Typography>
              
              <Typography variant="body1" paragraph color="text.secondary">
                With 25+ years as an international media consultant and business strategist (MBA, CMgr MCMI, FCIM), 
                I combine deep personal understanding with proven professional expertise to deliver impactful talks, 
                workshops, and coaching programs for both individuals and organizations.
              </Typography>
              
              {/* Skills Grid */}
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {skills.map((skillGroup, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {skillGroup.category}
                    </Typography>
                    <List dense>
                      {skillGroup.items.map((skill, idx) => (
                        <ListItem key={idx} disableGutters sx={{ py: 0.5 }}>
                          <ListItemAvatar sx={{ minWidth: 36 }}>
                            <CheckCircleIcon color="primary" fontSize="small" />
                          </ListItemAvatar>
                          <ListItemText primary={skill} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                ))}
              </Grid>
              
              <Button 
                component={RouterLink} 
                to="/booking"
                variant="contained" 
                color="primary"
                size="large"
                startIcon={<CalendarTodayIcon />}
                sx={{ 
                  mt: 4,
                  py: 1.5,
                  px: 3,
                  borderRadius: 2 
                }}
              >
                Book a Consultation
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  p: 4, 
                  borderRadius: 4, 
                  background: 'linear-gradient(135deg, rgba(124, 77, 255, 0.1) 0%, rgba(83, 109, 254, 0.1) 100%)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
                }}
              >
                <Typography variant="h5" component="h3" gutterBottom fontWeight={600} color="primary.main">
                  <FormatQuoteIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '1.2em' }} />
                  The TRIUMPH Model
                </Typography>
                
                <Typography variant="body1" paragraph mt={2}>
                  My signature approach to resilience and transformation that has helped countless individuals and organizations:
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {[
                    { letter: 'T', meaning: 'Trust the process' },
                    { letter: 'R', meaning: 'Reclaim your inner strength' },
                    { letter: 'I', meaning: 'Identify opportunities in challenges' },
                    { letter: 'U', meaning: 'Understand your purpose' },
                    { letter: 'M', meaning: 'Manage change effectively' },
                    { letter: 'P', meaning: 'Pursue growth mindset' },
                    { letter: 'H', meaning: 'Harness your spiritual wellbeing' }
                  ].map((step, index) => (
                    <Grid item xs={12} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.main', 
                            width: 36, 
                            height: 36, 
                            mr: 2,
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}
                        >
                          {step.letter}
                        </Avatar>
                        <Typography variant="body1">{step.meaning}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                  <AutoStoriesIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Learn more in my book <strong>"My Best Friend: Seven Steps to Repossess Your Life Inner Riches, Change and Happiness"</strong>
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Testimonials Section with Carousel */}
      <Box 
        id="testimonials"
        component="section" 
        sx={{ 
          py: 10, 
          backgroundColor: 'background.paper',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '40%',
            height: '70%',
            backgroundImage: `radial-gradient(circle, rgba(0, 229, 255, 0.1) 0%, rgba(0, 229, 255, 0) 70%)`,
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box textAlign="center" mb={6}>
            <Typography 
              variant="overline" 
              color="primary" 
              component="p"
              sx={{ fontWeight: 500, letterSpacing: 1.5 }}
            >
              Client Experiences
            </Typography>
            <Typography 
              variant="h3" 
              component="h2"
              sx={{ 
                mb: 2,
                fontWeight: 700 
              }}
            >
              Testimonials
            </Typography>
            <Divider 
              sx={{ 
                width: 80, 
                mx: 'auto', 
                my: 3, 
                borderColor: 'primary.main',
                borderWidth: 2,
                borderRadius: 1
              }} 
            />
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                fontWeight: 400 
              }}
            >
              Hear how the TRIUMPH model has transformed lives and organizations
            </Typography>
          </Box>
          
          {/* Testimonials Carousel */}
          <Box sx={{ position: 'relative' }}>
            {/* Navigation Arrows */}
            <IconButton
              onClick={handlePrevTestimonials}
              disabled={currentTestimonialIndex === 0}
              sx={{
                position: 'absolute',
                left: { xs: -20, md: -60 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white'
                },
                '&:disabled': {
                  opacity: 0.3
                }
              }}
            >
              <ArrowBackIosIcon />
            </IconButton>
            
            <IconButton
              onClick={handleNextTestimonials}
              disabled={currentTestimonialIndex >= maxIndex}
              sx={{
                position: 'absolute',
                right: { xs: -20, md: -60 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white'
                },
                '&:disabled': {
                  opacity: 0.3
                }
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
            
            {/* Testimonials Grid */}
            <Grid container spacing={4}>
              {getCurrentTestimonials().map((testimonial) => (
                <Grid item xs={12} md={4} key={testimonial.id}>
                  <Paper 
                    elevation={4}
                    sx={{
                      p: 4,
                      height: '100%',
                      borderRadius: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                      }
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      paragraph
                      sx={{
                        position: 'relative',
                        zIndex: 1,
                        fontStyle: 'italic',
                        mb: 3
                      }}
                    >
                      "{testimonial.text}"
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        mt: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 1
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.company}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            
            {/* Carousel Indicators */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <Box
                  key={index}
                  onClick={() => setCurrentTestimonialIndex(index)}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: currentTestimonialIndex === index ? 'primary.main' : 'grey.300',
                    mx: 0.5,
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                      bgcolor: currentTestimonialIndex === index ? 'primary.dark' : 'grey.400'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box 
        component="section" 
        sx={{ 
          py: 12,
          background: 'linear-gradient(135deg, #7c4dff 0%, #536dfe 100%)',
          color: 'white'
        }}
      >
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography 
              variant="h3" 
              component="h2"
              sx={{ 
                mb: 3,
                fontWeight: 700 
              }}
            >
              Ready to Build Your Resilience?
            </Typography>
            <Typography 
              variant="h6"
              sx={{ 
                mb: 4,
                opacity: 0.9,
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              Connect with me to discuss how the TRIUMPH model can support your personal journey or organizational goals.
            </Typography>
            
            <Grid container spacing={3} justifyContent="center">
              <Grid item>
                <Button 
                  component={RouterLink} 
                  to="/booking"
                  variant="contained" 
                  color="secondary"
                  size="large"
                  startIcon={<CalendarTodayIcon />}
                  sx={{ 
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    backgroundColor: 'white',
                    color: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                >
                  Book a Session
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  component={RouterLink} 
                  to="/blog"
                  variant="outlined"
                  size="large"
                  startIcon={<ArticleIcon />}
                  sx={{ 
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    borderColor: 'white',
                    color: 'white',
                    borderWidth: 2,
                    '&:hover': {
                      borderColor: 'white',
                      borderWidth: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Read Blog
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  component={RouterLink} 
                  to="/events"
                  variant="outlined"
                  size="large"
                  startIcon={<EventIcon />}
                  sx={{ 
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    borderColor: 'white',
                    color: 'white',
                    borderWidth: 2,
                    '&:hover': {
                      borderColor: 'white',
                      borderWidth: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Upcoming Events
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default HomePage;
