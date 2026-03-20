import styles from "./Home.module.css";
import HomeHeading from "./HomeHeading";
import ImageCarousel from "../ImageCarousel/ImageCarousel";
import '@fortawesome/fontawesome-free/css/all.min.css';


import { useUser } from "../../context/UserContext";

const Home = () => {
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';

  console.log("Home.jsx - User:", user);
  console.log("Home.jsx - isAdmin:", isAdmin);

  return (
    <>
      <HomeHeading />

      {/* <div className={styles.carouselContainer}> */}
        {/* Horizontal Image Carousel */}
        {/* <ImageCarousel 
          type="horizontal" 
          carouselId="horizontal-main"
          canManage={isAdmin}
        /> */}
        
        {/* Square Image Carousel */}
        {/* <ImageCarousel 
          type="square" 
          carouselId="square-main"
          canManage={isAdmin}
        /> */}

        {/* Social Media Icons */}
        <div className={styles.socialIcons}>
          <a href="https://www.instagram.com/invites/contact/?igsh=x2tqbkpegs5b&utm_content=10vuc3u2" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://wa.me/6285857878389" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-whatsapp"></i>
          </a>
          <a href="https://t.me/Saipuntofficialupdate" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-telegram"></i>
          </a>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook"></i>
          </a>
        </div>
    </>
  );
};

export default Home;
