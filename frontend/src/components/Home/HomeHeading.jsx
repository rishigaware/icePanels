import { useEffect } from 'react';
import styles from './HomeHeading.module.css'; // Import the CSS module
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { PiHandDepositDuotone } from "react-icons/pi";
import { BiMoneyWithdraw } from "react-icons/bi";
import { FaBalanceScale, FaCrown, FaGlobe, FaBolt, FaBullhorn, FaTools, FaHeadset, FaStar, FaChartLine, FaUsers, FaCoins, FaWhatsapp, FaTelegramPlane, FaCreditCard, FaSimCard, FaAd, FaLaptop, FaBriefcase } from "react-icons/fa";
import { FaPlus, FaArrowRight } from "react-icons/fa";
// import logo from '../../assets/logo.png';
import newlogo from '../../assets/SP.png';
import { useUser } from "../../context/UserContext";

const HomeHeading = () => {
  const navigate = useNavigate(); // Initialize the navigate function
  const { user, setUser, refreshUserBalance } = useUser();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleClick = () => {
    navigate('/id'); // Redirect to the /id route
  };

  const handleLogout = () => {
    setUser(null); // Clear user context
    localStorage.removeItem('user'); // Remove user from localStorage
  };

  // Fetch balance on component mount and whenever the user changes
  useEffect(() => {
    if (user?.id) {
      refreshUserBalance();
    }
  }, [user?.id, refreshUserBalance]); // Refetch balance whenever the user changes

  return (
    <div className={styles.mainContainer}>
      <div className={styles.navbar}>
      <img
        src={newlogo}
        alt="Logo"
        style={{
          float: 'left',
          height: '85%',
          marginTop: '2px', // Adjust as needed
          marginLeft:'4px',
          objectFit: 'contain' // Ensures the image scales well inside the container
        }}
      />
        <div style={{ float: 'right' }}>
          {user ? (
            <button
              className={styles.buttonlogout}
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <button
              className={styles.buttonlogin}
              onClick={handleLogin}
            >
              Login
            </button>
          )}
        </div>
      </div>

      <div className={styles.top}>
        <div className={styles.topSquare}>
          <div className={styles.first}>
            <PiHandDepositDuotone />
            <h3 className={styles.deposit}>Deposit</h3>
          </div>

          <div className={styles.second}>
            <div className={styles.logo}>
            <img
              src={newlogo}
              alt="Logo"
              style={{
                height: '60px',
                marginTop: '2px',
                marginLeft: '4px',
                objectFit: 'contain',
                zIndex: 1000,
                position: 'relative'
              }}
            />           
            </div>

            <div className={styles.balanceContainer}>
              <FaBalanceScale size={20} />
              <p className={styles.balanceAmount}>₹{user?.balance || 0}</p>
            </div>
            <h3 className={styles.balance}>Wallet Balance</h3>
          </div>

          <div className={styles.third}>
            <h3 className={styles.withdraw}>Withdraw</h3>
            <BiMoneyWithdraw />
          </div>
        </div>
      </div>
        {/* Sliding Text Section */}
        {/* Sliding Text Section */}
        <div className={styles.slidingTextSection}>
          <div className={styles.slidingTextContainer}>
            <div className={styles.slidingText}>
              🚀 Welcome to The247Panel - Your Ultimate Gaming & Betting Platform! 🎮💰 • 🎯 Multiple Gaming Websites • 💎 Premium Features • 🔥 24/7 Support • ⚡ Instant Deposits & Withdrawals • 🏆 Best Odds Guaranteed • 🎲 Live Casino Games • 🎰 Slot Machines • 🃏 Card Games • 🏈 Sports Betting • 🎪 Live Events • 💰 Daily Bonuses • 🎁 Special Promotions • 🔐 Secure & Safe • 📱 Mobile Friendly • 🌟 VIP Membership • 🎊 Join Now & Win Big! 🎊
            </div>
          </div>
        </div>
        {/* Create Admin Panel Section */}
        <div 
            className={styles.createId} 
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
        >
          <div className={styles.leftSide}>
            <span className={styles.createIdEmoji}>🚀</span>
            <FaPlus size={18} className={styles.createIdIcon} />
            <span className={styles.createIdText}>CREATE SELF ADMIN PANEL&apos;S</span>
            <span className={styles.createIdEmoji}>⚡</span>
          </div>
          <div className={styles.rightSide}>
            <span className={styles.createIdEmoji}>🎯</span>
            <FaArrowRight size={18} className={`${styles.createIdArrow} ${styles.arrow}`} />
          </div>
        </div>

        {/* Animated Features Section */}
        <div className={styles.featuresSection}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <FaCrown className={styles.featureIcon} />
              <h4>Premium Exchange Solutions</h4>
              <p>All Premium Exchange, Admin & White Label services available.</p>
            </div>
            <div className={styles.featureCard}>
              <FaGlobe className={styles.featureIcon} />
              <h4>International Virtual SIM & Bank</h4>
              <p>Global virtual SIM cards and international banking support.</p>
            </div>
            <div className={styles.featureCard}>
              <FaBolt className={styles.featureIcon} />
              <h4>Instant Panel Refill</h4>
              <p>Quick and seamless instant panel refill anytime.</p>
            </div>
            <div className={styles.featureCard}>
              <FaBullhorn className={styles.featureIcon} />
              <h4>Digital Marketing Posters</h4>
              <p>Professional match posters and marketing creatives.</p>
            </div>
            <div className={styles.featureCard}>
              <FaTools className={styles.featureIcon} />
              <h4>Advanced Technical Services</h4>
              <p>Complete technical solutions for smooth platform operation.</p>
            </div>
            <div className={styles.featureCard}>
              <FaHeadset className={styles.featureIcon} />
              <h4>24/7 Technical Support</h4>
              <p>Round-the-clock support from our expert technical team and account managers.</p>
            </div>
          </div>
        </div>

        

        {/* Animated Stats Section */}
        <div className={styles.statsSection}>
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <FaUsers className={styles.statIcon} />
              <div className={styles.statNumber}>2K+</div>
              <div className={styles.statLabel}>Active Users</div>
            </div>
            <div className={styles.statItem}>
              <FaChartLine className={styles.statIcon} />
              <div className={styles.statNumber}>99.9%</div>
              <div className={styles.statLabel}>Uptime</div>
            </div>
            <div className={styles.statItem}>
              <FaStar className={styles.statIcon} />
              <div className={styles.statNumber}>4.9/5</div>
              <div className={styles.statLabel}>User Rating</div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className={styles.gamingPlatformsSection}>
          <h2 className={styles.sectionTitle}>🚀 Our Premium Services</h2>
          <div className={styles.platformsGrid}>
            <div className={styles.platformCard}>
              <div className={styles.platformIcon} style={{ color: '#25D366' }}><FaWhatsapp size={40} /></div>
              <h3>APIs</h3>
              <p>WhatsApp API <br/> Telegram Bot</p>
              <div className={styles.platformBadge}>Best</div>
            </div>
            <div className={styles.platformCard}>
              <div className={styles.platformIcon} style={{ color: '#FFD700' }}><FaCreditCard size={40} /></div>
              <h3>Payments</h3>
              <p>Payment Gateway <br/> Rental Account</p>
              <div className={styles.platformBadge}>Secure</div>
            </div>
            <div className={styles.platformCard}>
              <div className={styles.platformIcon} style={{ color: '#0088cc' }}><FaSimCard size={40} /></div>
              <h3>SIM Services</h3>
              <p>Indian Virtual SIM <br/> International Virtual SIM</p>
              <div className={styles.platformBadge}>New</div>
            </div>
            <div className={styles.platformCard}>
              <div className={styles.platformIcon} style={{ color: '#E1306C' }}><FaLaptop size={40} /></div>
              <h3>Digital Marketing</h3>
              <p>Google & Meta Ads <br/> Telegram & Instagram Ads</p>
              <div className={styles.platformBadge}>Trending</div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className={styles.testimonialsSection}>
          <h2 className={styles.sectionTitle}>💬 What Our Users Say</h2>
          <div className={styles.testimonialsContainer}>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialContent}>
                <div className={styles.quoteIcon}>&ldquo;</div>
                <p>&ldquo;Amazing platform! Fast withdrawals and great customer support. I&apos;ve been using it for 2 years now.&rdquo;</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>R</div>
                  <div className={styles.authorInfo}>
                    <h4>Rajesh Kumar</h4>
                    <span>Verified User</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialContent}>
                <div className={styles.quoteIcon}>&ldquo;</div>
                <p>&ldquo;24/7 support is amazing. They helped me resolve my issue within minutes. Great service!&rdquo;</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>A</div>
                  <div className={styles.authorInfo}>
                    <h4>Amit Patel</h4>
                    <span>Premium User</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className={styles.howItWorksSection}>
          <h2 className={styles.sectionTitle}>🚀 How It Works</h2>
          <div className={styles.stepsContainer}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Open Google</h3>
                <p>Search "the best panel provider" using link <b>SAIPUNT.INFO</b></p>
              </div>
              <div className={styles.stepIcon}>🔍</div>
            </div>
            <div className={styles.stepArrow}>→</div>
            
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Register</h3>
                <p>Register yourself with your mobile number and Gmail</p>
              </div>
              <div className={styles.stepIcon}>📱</div>
            </div>
            <div className={styles.stepArrow}>→</div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Create Panel</h3>
                <p>Click on Panels {'>'} Create self any Panel</p>
              </div>
              <div className={styles.stepIcon}>💻</div>
            </div>
            <div className={styles.stepArrow}>→</div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Select Panel</h3>
                <p>Select the panel that you want & Click on Create</p>
              </div>
              <div className={styles.stepIcon}>👆</div>
            </div>
            <div className={styles.stepArrow}>→</div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Fill Details</h3>
                <p>Fill required details then select coins and rate</p>
              </div>
              <div className={styles.stepIcon}>📝</div>
            </div>
            <div className={styles.stepArrow}>→</div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>Buy Now</h3>
                <p>Click on Buy now (You will get the Payment option)</p>
              </div>
              <div className={styles.stepIcon}>🛒</div>
            </div>
            <div className={styles.stepArrow}>→</div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h3>Payment & Submit</h3>
                <p>Make payment, Upload Screenshot and Click on Submit. You will get your Panel detail on SAIPUNT home page</p>
              </div>
              <div className={styles.stepIcon}>✅</div>
            </div>
          </div>
        </div>

        
        {/* Copyright Section */}
        <div className={styles.copyrightSection}>
          <p>© 2019 The247Panel. All rights reserved.</p>
        </div>
    </div>
  );
};



export default HomeHeading;
