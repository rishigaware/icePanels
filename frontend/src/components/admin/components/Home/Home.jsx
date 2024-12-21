import React from "react";
import styles from "./Home.module.css"; // Make sure this CSS is correctly defined
import Carousel from "../Carousel/Carousel";
import MiddleCarousel from "../Carousel/MiddleCarousel";
import BottomCarousel from "../Carousel/BottomCarousel";
import HomeHeading from "./HomeHeading";
import CardCarousel from "./CardCarousel";
import BottomCardCarousel from "./BottomCardCarousel";
import Slider from "./Slider";

const Home = () => {

  return (
    <>
      <HomeHeading />
      <div className={styles.carouselContainer}>
        <div className={styles.carousel}>
          <Carousel  />
        </div>
        {/* <Slider/> */}
        <CardCarousel/>
        <div className={styles.carousel}>
          <MiddleCarousel  />
        </div>
        {/* <Slider/>  */}
        <BottomCardCarousel />

        <div className={styles.secondCarousel}>
          <BottomCarousel  />
        </div>    

        {/* Social Media Icons */}
        <div className={styles.socialIcons}>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://wa.me" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-whatsapp"></i>
          </a>
          <a href="https://t.me" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-telegram"></i>
          </a>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook"></i>
          </a>
        </div>    
      </div>
    </>
  );
};

export default Home;
