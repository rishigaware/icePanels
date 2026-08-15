import styles from "./Home.module.css";
import HomeHeading from "./HomeHeading";
import ImageCarousel from "../../../ImageCarousel/ImageCarousel";
import { SOCIAL_LINKS } from "../../../../utils/socialLinks";

const Home = () => {

  return (
    <>
      <HomeHeading />

      {/* <div className={styles.carouselContainer}> */}
        {/* Horizontal Image Carousel */}
        {/* <ImageCarousel 
          type="horizontal" 
          carouselId="horizontal-main"
          canManage={true}
        /> */}
        
        {/* Square Image Carousel */}
        {/* <ImageCarousel 
          type="square" 
          carouselId="square-main"
          canManage={true}
        /> */}

        {/* Social Media Icons */}
        <div className={styles.socialIcons}>
          <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
          <a href={SOCIAL_LINKS.whatsappSupport} target="_blank" rel="noopener noreferrer">
            <i className="fab fa-whatsapp"></i>
          </a>
          <a href={SOCIAL_LINKS.whatsappChannel} target="_blank" rel="noopener noreferrer">
            <i className="fab fa-whatsapp"></i>
          </a>
          <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer">
            <i className="fab fa-telegram"></i>
          </a>
          <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook"></i>
          </a>
        </div>    
    </>
  );
};

export default Home;
