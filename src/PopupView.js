import React from "react";
import "./PopupView.css";
import heliImage from "./heli.png";
import jeremyImage from "./Jeremy.png";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const PopupView = ({ onClose }) => {
  var settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    certerMode: true,
    centerPadding: 20,
  };
  return (
    <div className="popup-container">
      <div className="popup-body">
        <div className="popup-title">
          <button className="close-button" onClick={onClose}>Close</button>
          <h2>INFORMATION</h2>
        </div>

      <Slider {...settings}>
      <div>
        <h3>INTRO VIDEO</h3><br/><br/><br/>
        <div className="video-container">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/U4Sm7v6PDY8"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      <div>
        <h3>ABOUT THE PROJECT</h3><br/><br/><br/><br/><br/>
        <p className="italic-text">Welcome to ABBAverse, the ultimate destination for ABBA fans, music enthusiasts, and researchers alike!<br/><br/>
            Dive into a comprehensive compilation of global ABBA covers, showcased through an interactive website designed to highlight the diversity of musical interpretations.
            ABBAverse invites you to explore the universal language of music while celebrating the unique voices and backgrounds of musicians worldwide.<br/><br/>
            Join us on a journey that bridges cultures and showcases the timeless appeal of ABBA's iconic melodies!</p>
      </div>
      <div>
        <h3>MEET THE TEAM</h3><br/><br/><br/>
        <div className="team-container">
          <div className="team-member">
            <img src={heliImage} alt="Heli's Profile" className="profile-image" /><br/>
            <p className="profile-text">Back-End<br/>Front-End<br/>Development<br/>Data Processing</p>
          </div>
          <div className="team-member">
            <img src={jeremyImage} alt="Jeremy's Profile" className="profile-image" /><br/>
            <p className="profile-text">Styling<br/>Front-End<br/>Architecture<br/>Data Visualization</p>
          </div>
        </div>
      </div>
      <div>
        <h3>LEARNING OBJECTIVES</h3><br/>
        <p className="normal-text">
        Our learning objective for this project is to achieve proficiency in applying appropriate data visualization techniques to support users in creating narratives from interactive visualization websites. We structured our learning into five stages: Design, Defend, Critique, Demonstrate, and Evaluate, through practical exercises and collaborative teamwork. <br/><br/>
        In the Design stage, we deliberated on various visual mapping options, considering user requirements and preferences, and ultimately opted for maps and related visualization tools to facilitate diverse data interpretation. During the Defend stage, we conducted extensive research on visual mapping resources to inform our selection of the most suitable visualization methods for both users and data representation.<br/><br/>
        In the Critique stage, we integrated principles learned in class, such as data visualization constructs and color theory, into our project development process. Subsequently, we presented our concepts and prototypes to the class, incorporating constructive feedback to refine the visualization framework.<br/><br/>
        Finally, in the Evaluate stage, we conducted user testing and analyzed feedback from both users and classmates to gain comprehensive insights into the effectiveness and usability of our interactive visualization project.
        </p>
      </div>
      <div>
        <h3>DATA & SOURCES</h3><br/>
        <p className="normal-text">
        Our data is gathered with a self-designed structure web crawler with the webpage from SecondHandSongs.com. Here is the link to SecondHandSongs.com and the self-designed structure. <br/><br/>
        <a href={'https://secondhandsongs.com/artist/119/originals#nav-entity'} target="_blank" rel="noopener noreferrer">SecondHandSongs</a><br/>
        <a href={'https://colab.research.google.com/drive/13MSb4MSKlURvHUiv9OyVQkT8eGZVUSlK?usp=sharing'} target="_blank" rel="noopener noreferrer">Self-designed Web crawler</a><br/><br/><br/>
        For the visualization tools and Front-end development, we have searched for visual mapping methods and user-interface materials such as React, D3, and Mapbox to help us within the project development.<br/><br/>
        <a href={'https://legacy.reactjs.org/docs/create-a-new-react-app.html'} target="_blank" rel="noopener noreferrer">Building React App</a><br/>
        <a href={'https://christopheviau.com/d3list/gallery.html'} target="_blank" rel="noopener noreferrer">D3 Visualization Data Gallery</a><br/>
        <a href={'https://www.mapbox.com/blog/globe-view'} target="_blank" rel="noopener noreferrer">Mapbox Building 3D Globe</a><br/>
        <a href={'https://www.netlify.com/blog/2016/07/22/deploy-react-apps-in-less-than-30-seconds/'} target="_blank" rel="noopener noreferrer">Deploy Project with Netlify</a><br/><br/><br/><br/>
        Additionally, we've searched for related work for the project inspiration and the development. <br/><br/>
        - Pattuelli, M. C., Weller, C., & Szablya, G. (2011, September). Linked Jazz: an exploratory pilot. In International Conference on Dublin Core and Metadata Applications (pp. 158-164).
        </p>
      </div>
    </Slider>

      </div>
    </div>
  );
};

export default PopupView;