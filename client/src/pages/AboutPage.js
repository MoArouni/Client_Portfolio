import React from 'react';
import { Container, Typography, Box, Grid, Paper, Avatar, Divider, Chip, List, ListItem, ListItemIcon, ListItemText, Button, Tabs, Tab } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Attempt to import react-helmet or handle its absence
let Helmet;
try {
  Helmet = require('react-helmet').Helmet;
} catch (e) {
  // Create a dummy Helmet component if the package is not available
  Helmet = ({ children }) => <>{children}</>;
}

const AboutPage = () => {
  const theme = useTheme();
  const [skillCategory, setSkillCategory] = React.useState('all');

  // Education data
  const education = [
    {
      institution: 'University of Dundee',
      degree: 'Master of Business Administration (M.B.A.), Project Management',
      period: '1990 - 1991',
      logo: '/images/dundee-logo.png'
    },
    {
      institution: 'American University of Beirut',
      degree: 'Bachelor of Arts (B.A.), Mathematics',
      period: '1984 - 1989',
      activities: 'President of the International Students Club; Secretary of the Chess club',
      logo: '/images/aub-logo.png'
    },
    {
      institution: 'American University of Beirut',
      degree: 'Teaching Diploma, Teaching Mathematics for Secondary Students',
      period: '1984 - 1989',
      activities: 'Chess Club, International Students Club',
      logo: '/images/aub-logo.png'
    }
  ];

  // Experience data
  const experience = [
    {
      position: 'Business Consultant',
      company: 'Sterling Media & Communications Ltd.',
      period: 'April 2022 - Present',
      location: 'London, England, United Kingdom (Hybrid)',
      skills: ['Media Buying', 'Social Media Marketing', 'Digital Marketing', 'Media Strategy', 'Media Planning'],
      description: 'Results-Driven Communication Agency'
    },
    {
      position: 'Author',
      company: 'My Best Friend The Book',
      period: 'April 2021 - Present',
      location: 'London, England, United Kingdom (Remote)',
      description: 'Authored "Transformational Change: How to Empower Yourself when Times are Tough" and "My Best Friend: Seven Steps to Repossess Your Life Inner Riches, Change and Happiness"',
      logo: '/images/mybestfriend.jpg'
    },
    {
      position: 'Managing Partner',
      company: 'Sarasbeads & Jewellery',
      period: 'December 2020 - Present',
      location: 'London Area, United Kingdom (Remote)',
      description: 'Saras Beads and Jewellery is a UK-based brand that creates exquisite, handcrafted jewellery inspired by the vibrant colours of the sea. Founded in 2021 by Sarah Sabraoui, the brand\'s mission is to spread joy, celebrate individuality, and become your happy place. Sarah\'s passion for handcrafting, stones, and charms seamlessly blended into creating exquisite jewellery pieces. She draws inspiration from the ocean\'s depths, infusing her designs with blue, turquoise, and bright colours.',
      logo: '/images/sarasbeads.jpeg'
    },
    {
      position: 'Managing Director',
      company: 'Sterling Marketing Consultancy Ltd',
      period: 'November 2017 - December 2022',
      location: 'London, United Kingdom (Hybrid)',
      skills: ['Media Buying', 'Social Media', 'Media Strategy', 'Media Planning', 'Digital Media'],
      description: 'Delivering measurable results for our clients, and committed to providing exceptional service and support at every stage of your journey. Our mission is to provide media solutions that perform. Clients require a good return on investment. Hence our mission is to provide clients with qualified sales leads they can take through their sales funnel. We have clients in Asia, Africa, Europe and the Middle East.'
    },
    {
      position: 'Director Consultant',
      company: 'BNI UK & Ireland',
      period: 'July 2020 - October 2021',
      location: 'NorthWest London',
      description: 'My vision is to exchange £8 million-plus worth of business by having a team of 50+ entrepreneurs supporting each other. Create a positive mindset, assist them in growing their business, increasing their sales and marketing, cooperating, and collaborating to achieve their business goals. Moreover, Director Consultants support and help their chapter increase membership, retain current members, and train and educate the members to help them get the most out of BNI.',
      logo: '/images/bni.jpeg'
    },
    {
      position: 'Business Growth Specialist',
      company: 'ActionCOACH UK',
      period: 'May 2018 - January 2021',
      location: 'London, United Kingdom',
      description: 'Business Growth Development Firm - a franchisee for ActionCOACH. I work with Business Owners to: increase their profits and make more money, get more done in less time, have more vacations and more quality family time, have a fantastic team environment geared towards achieving business goals, ensure their marketing activities work (Test & Measure), introduce systems to improve productivity, and concentrate on money generating tasks.'
    },
    {
      position: 'Managing Director',
      company: 'UM Mena',
      period: 'August 2007 - 2017',
      location: 'Saudi Arabia',
      description: 'Maintained profitability throughout tenure, reversing the downturn to revenue low of $30m at my arrival to achieve sales of $150m.',
      logo: '/images/UM.jpeg'
    },
    {
      position: 'Regional Research Director - MENA',
      company: 'UM Mena',
      period: 'September 2001 - July 2007',
      location: 'Dubai, United Arab Emirates',
      description: 'Created insight and understanding of UM\'s proprietary tools, travelling across Saudi Arabia, UAE, Morocco and Egypt to provide expertise across these markets.',
      logo: '/images/UM.jpeg'
    },
    {
      position: 'General Manager - GCC',
      company: 'Reach - ReachMass.com',
      period: '1993 - 2001',
      location: 'Sharjah - United Arab Emirates',
      description: 'Excellent grounding in marketing, qualitative and quantitative research and other projects, working with a demanding client base such as General Motors, Sheraton, Master Foods, and Unilever across GCC countries.'
    },
    {
      position: 'Marketing Assistant',
      company: 'Publicis Advertising',
      period: 'April 1992 - December 1993',
      location: ''
    }
  ];

  // Volunteering data
  const volunteering = [
    {
      position: 'Competition Officer * Swimming Judge * Committee member',
      organization: 'Brent Dolphins Swimming Club',
      period: 'April 2018 - Present',
      description: 'A non-profit organisation, providing children with healthier and competitive lifestyle.'
    },
    {
      position: 'Education Coordinator',
      organization: 'BNI UK & Ireland',
      period: 'April 2019 - October 2021',
      description: 'Educated members that networking is more about "farming" than "hunting"; it is about cultivating relationships. Guided and informed members in the process of developing a referral-based business.'
    },
    {
      position: 'Power Team Coordinator',
      organization: 'BNI UK & Ireland',
      period: 'July 2020 - October 2021'
    },
    {
      position: 'President - French School Swim Team (New Wave)',
      organization: 'EFIR - Ecole Française Internationale de Riyad',
      period: 'September 2015 - July 2017',
      description: 'Led the Swim Team with 111 swimmers competing among other teams in Saudi Arabia. Non-profit club aimed at improving children\'s swimming capabilities and providing a healthy competitive environment.'
    },
    {
      position: 'Committee Member',
      organization: 'AUB Alumni Association, Dubai & Northern Emirates',
      period: 'January 1999 - June 2007',
      description: 'Generated funds through different activities and helped needy students with tuition funds and scholarships to complete their education.'
    }
  ];

  // Skills data - reorganized into categories
  const skillCategories = [
    {
      name: 'Strategy',
      skills: ['BusinessStrategy', 'MarketAnalysis', 'DataAnalysis', 'CompetitiveAnalysis', 'GrowthPlanning']
    },
    {
      name: 'Marketing',
      skills: ['SEO', 'Advertising', 'ContentMarketing', 'Branding', 'FunnelDesign']
    },
    {
      name: 'Communication',
      skills: ['Copywriting', 'Storytelling', 'Negotiation', 'PublicSpeaking', 'ClientRelations']
    },
    {
      name: 'Technology',
      skills: ['Analytics', 'Automation', 'CRM', 'WebManagement', 'AItools']
    },
    {
      name: 'Leadership',
      skills: ['Coaching', 'TeamLeadership', 'DecisionMaking', 'TimeManagement', 'GoalSetting']
    }
  ];

  // All skills flattened for "All" category
  const allSkills = skillCategories.flatMap(category => category.skills);

  // Filter skills based on selected category
  const getDisplayedSkills = () => {
    if (skillCategory === 'all') {
      return allSkills;
    }
    const category = skillCategories.find(cat => cat.name === skillCategory);
    return category ? category.skills : [];
  };

  // Handle tab change
  const handleCategoryChange = (event, newValue) => {
    setSkillCategory(newValue);
  };

  return (
    <>
      <Helmet>
        <title>About Khalil Arouni | Resilience Coach & Author</title>
        <meta name="description" content="Learn about Khalil Arouni's journey from surviving critical illness to becoming a resilience coach, author, and keynote speaker." />
      </Helmet>

      {/* Hero Section */}
      <Box 
        sx={{ 
          pt: 12, 
          pb: 6, 
          backgroundColor: 'background.default',
          background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.main}15 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={7} alignItems="center">
            <Grid item xs={12} md={5}>
              <Box 
                component="img" 
                src="/images/profile.jpeg" 
                alt="Khalil Arouni" 
                sx={{ 
                  width: '100%', 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={7}>
              <Typography 
                variant="overline"
                sx={{ 
                  mb: 1, 
                  display: 'block',
                  color: 'primary.main',
                  fontWeight: 500,
                  letterSpacing: 1.5
                }}
              >
                About Me
              </Typography>
              
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Khalil Arouni
              </Typography>

              <Typography variant="h5" color="primary.main" gutterBottom fontWeight={500}>
                Resilience Coach • Author • Keynote Speaker
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                I am Khalil Arouni, a survivor of multiple critical illnesses, including cancer and a liver transplant. 
                This journey wasn't just about survival; it was a profound lesson in resilience, spiritual strength, 
                and the human capacity for transformation.
              </Typography>
              
              <Typography variant="body1" paragraph>
                From these experiences, I authored "My Best Friend" and developed the TRIUMPH model – a 7-step framework 
                to help individuals and organisations navigate adversity, reclaim their inner strength, and achieve 
                lasting positive change.
              </Typography>
              
              <Typography variant="body1" paragraph>
                My core focus is empowering others to build resilience and achieve post-traumatic growth. With a 25+ year 
                background as an international media consultant and business strategist (MBA, CMgr MCMI, FCIM), I combine 
                deep personal understanding with proven professional expertise to deliver impactful talks, workshops, and 
                coaching programs.
              </Typography>
              
              <Button 
                component={RouterLink} 
                to="/booking"
                variant="contained" 
                color="primary"
                size="large"
                startIcon={<CalendarTodayIcon />}
                sx={{ 
                  mt: 2,
                  py: 1.5,
                  px: 3,
                  borderRadius: 2
                }}
              >
                Book a Session
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* TRIUMPH Model Section */}
      <Box sx={{ py: 8, backgroundColor: theme.palette.background.paper }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h2" gutterBottom fontWeight={700}>
                The TRIUMPH Model
              </Typography>
              
              <Typography variant="body1" paragraph>
                Through my personal journey of overcoming critical illnesses, I developed the TRIUMPH model—a proven 
                framework that guides individuals and organizations through adversity toward positive transformation.
              </Typography>
              
              <Box sx={{ my: 4 }}>
                {[
                  { letter: 'T', meaning: 'Transformation', description: 'Embrace change as an opportunity for growth and renewal' },
                  { letter: 'R', meaning: 'Resilience', description: 'Build inner strength to bounce back from adversity' },
                  { letter: 'I', meaning: 'Identity', description: 'Understand and reconnect with your authentic self' },
                  { letter: 'U', meaning: 'Unity', description: 'Connect with others and foster meaningful relationships' },
                  { letter: 'M', meaning: 'Mindset', description: 'Cultivate positive thought patterns and emotional intelligence' },
                  { letter: 'P', meaning: 'Purpose', description: 'Discover and pursue what gives your life meaning' },
                  { letter: 'H', meaning: 'Honesty', description: 'Embrace truthfulness with yourself and others for genuine growth' }
                ].map((step, index) => (
                  <Box key={index} sx={{ mb: 2.5, display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.primary.main, 
                        color: 'white',
                        width: 40, 
                        height: 40, 
                        mr: 2,
                        fontWeight: 'bold',
                        fontSize: '1.1rem'
                      }}
                    >
                      {step.letter}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ mt: 0.5 }}>
                        {step.meaning}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.primary.main}20 100%)`,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <FormatQuoteIcon 
                  sx={{ 
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    fontSize: '5rem',
                    opacity: 0.1,
                    color: theme.palette.primary.main
                  }} 
                />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h5" component="h3" gutterBottom fontWeight={600} color="primary.main">
                    My Book: "My Best Friend"
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" sx={{ mb: 2, fontStyle: 'italic' }}>
                    Seven Steps to Repossess Your Life Inner Riches, Change and Happiness
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    In my book, I share the complete TRIUMPH methodology and my personal story of transformation. 
                    It's a practical guide for anyone facing adversity who wants to not just survive but thrive.
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    I also offer "Transformational Change: How to Empower Yourself when Times are Tough" — a companion 
                    guide focused on navigating challenging transitions with resilience and purpose.
                  </Typography>
                  
                  <Box 
                    component="img"
                    src="/images/mybestfriend.jpg"
                    alt="My Best Friend book cover"
                    sx={{ 
                      width: '60%',
                      maxWidth: 250,
                      borderRadius: 2,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      display: 'block',
                      mx: 'auto',
                      mt: 4
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Box sx={{ py: 8, backgroundColor: theme.palette.background.default }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" component="h2" gutterBottom fontWeight={700}>
              My Services
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                color: 'text.secondary'
              }}
            >
              I offer a range of services to help individuals and organizations build resilience and achieve positive transformation
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {[
              {
                icon: <PsychologyIcon fontSize="large" />,
                title: 'Resilience Coaching',
                description: `Individual coaching using the TRIUMPH model to help you navigate challenges, build resilience, and achieve personal transformation. Sessions are tailored to your specific needs and goals.`,
                services: [
                  'Personal resilience assessment',
                  'Customized resilience-building strategies',
                  'Navigating life transitions',
                  'Finding purpose after trauma',
                  'Spiritual wellbeing cultivation'
                ]
              },
              {
                icon: <VolunteerActivismIcon fontSize="large" />,
                title: 'Organizational Resilience',
                description: `Programs for teams and organizations to foster a culture of resilience, wellbeing, and effective change management. Build stronger teams that can navigate uncertainty with confidence.`,
                services: [
                  'Team resilience workshops',
                  'Leadership development',
                  'Change management',
                  'Creating cultures of wellbeing',
                  'Team building exercises'
                ]
              },
              {
                icon: <FormatQuoteIcon fontSize="large" />,
                title: 'Speaking & Workshops',
                description: `Inspiring keynote presentations and interactive workshops on resilience, post-traumatic growth, and the TRIUMPH methodology. Customized for your event or organization.`,
                services: [
                  'Keynote speaking',
                  'Interactive workshops',
                  'Panel discussions',
                  'Virtual presentations',
                  'Train-the-trainer programs'
                ]
              }
            ].map((service, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 4, 
                    height: '100%',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: theme.palette.primary.main,
                      width: 56,
                      height: 56,
                      mb: 2
                    }}
                  >
                    {service.icon}
                  </Avatar>
                  
                  <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                    {service.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {service.description}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom fontWeight={600} color="primary">
                    Services Include:
                  </Typography>
                  
                  <List dense disablePadding sx={{ mt: 1, mb: 2 }}>
                    {service.services.map((item, idx) => (
                      <ListItem key={idx} disablePadding disableGutters sx={{ mb: 1 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <CheckCircleIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Box sx={{ mt: 'auto', pt: 2 }}>
                    <Button 
                      component={RouterLink}
                      to="/booking"
                      variant="outlined"
                      color="primary"
                      sx={{ borderRadius: 2 }}
                      fullWidth
                    >
                      Book Now
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Experience & Education Section */}
      <Box sx={{ py: 8, backgroundColor: theme.palette.background.paper }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {/* Professional Experience */}
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={4}>
                <WorkIcon color="primary" fontSize="large" sx={{ mr: 2 }} />
                <Typography variant="h4" component="h2" fontWeight={600}>
                  Professional Experience
                </Typography>
              </Box>
              
              {experience.map((job, index) => (
                <Paper 
                  key={index} 
                  elevation={1}
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: 2,
                    borderLeft: `4px solid ${theme.palette.primary.main}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    {job.logo && (
                      <Box 
                        component="img"
                        src={job.logo}
                        alt={`${job.company} logo`}
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          objectFit: 'contain',
                          mr: 2,
                          borderRadius: 1,
                          mb: 2
                        }}
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom fontWeight={600}>
                        {job.position}
                      </Typography>
                      
                      <Typography variant="subtitle1" gutterBottom>
                        {job.company}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {job.period} {job.location && `• ${job.location}`}
                      </Typography>
                      
                      {job.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {job.description}
                        </Typography>
                      )}
                      
                      {job.skills && (
                        <Box sx={{ mt: 2 }}>
                          {job.skills.map((skill, idx) => (
                            <Chip 
                              key={idx} 
                              label={skill} 
                              size="small" 
                              sx={{ mr: 1, mb: 1, bgcolor: `${theme.palette.primary.main}20` }} 
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Grid>
            
            {/* Education & Volunteering */}
            <Grid item xs={12} md={6}>
              <Box>
                <Box display="flex" alignItems="center" mb={4}>
                  <SchoolIcon color="primary" fontSize="large" sx={{ mr: 2 }} />
                  <Typography variant="h4" component="h2" fontWeight={600}>
                    Education
                  </Typography>
                </Box>
                
                {education.map((edu, index) => (
                  <Paper 
                    key={index} 
                    elevation={1}
                    sx={{ 
                      p: 3, 
                      mb: 3, 
                      borderRadius: 2,
                      borderLeft: `4px solid ${theme.palette.secondary.main}`
                    }}
                  >
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {edu.institution}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      {edu.degree}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {edu.period}
                    </Typography>
                    
                    {edu.activities && (
                      <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                        Activities: {edu.activities}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Box>
              
              <Box sx={{ mt: 6 }}>
                <Box display="flex" alignItems="center" mb={4}>
                  <VolunteerActivismIcon color="primary" fontSize="large" sx={{ mr: 2 }} />
                  <Typography variant="h4" component="h2" fontWeight={600}>
                    Volunteering
                  </Typography>
                </Box>
                
                {volunteering.map((vol, index) => (
                  <Paper 
                    key={index} 
                    elevation={1}
                    sx={{ 
                      p: 3, 
                      mb: 3, 
                      borderRadius: 2,
                      borderLeft: `4px solid ${theme.palette.success.main}`
                    }}
                  >
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {vol.position}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      {vol.organization}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {vol.period}
                    </Typography>
                    
                    {vol.description && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {vol.description}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Skills Section */}
      <Box sx={{ py: 8, backgroundColor: theme.palette.background.default }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" component="h2" gutterBottom fontWeight={600}>
              Skills & Expertise
            </Typography>
          </Box>
          
          {/* Category Tabs */}
          <Box sx={{ width: '100%', mb: 4 }}>
            <Tabs 
              value={skillCategory} 
              onChange={handleCategoryChange} 
              centered
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: theme.palette.primary.main,
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <Tab value="all" label="All" />
              {skillCategories.map((category) => (
                <Tab key={category.name} value={category.name} label={category.name} />
              ))}
            </Tabs>
          </Box>
          
          {/* Display Skills */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {getDisplayedSkills().map((skill, index) => (
              <Chip 
                key={index}
                label={skill}
                sx={{ 
                  m: 0.5, 
                  py: 2.5,
                  bgcolor: `${theme.palette.primary.main}15`,
                  '&:hover': {
                    bgcolor: `${theme.palette.primary.main}25`,
                  }
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          py: 8,
          background: 'linear-gradient(135deg, #7c4dff 0%, #536dfe 100%)',
          color: 'white'
        }}
      >
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h4" component="h2" gutterBottom fontWeight={700}>
              Let's Work Together
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
              If you are seeking a speaker who can authentically connect personal adversity to universal principles 
              of growth or a coach to guide your team towards greater resilience, I invite you to connect. 
              Let's explore how the TRIUMPH model can support your goals.
            </Typography>
            
            <Button 
              component={RouterLink}
              to="/booking"
              variant="contained" 
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
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default AboutPage; 