import React from "react";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import BangaloreImg from "../../assets/Bangalore.jpg";
import ChennaiImg from "../../assets/Chennai.jpg";
import DelhiImg from "../../assets/Delhi.jpg";
import KeralaImg from "../../assets/Kerala.jpg";
import JaipurImg from "../../assets/Jaipur.jpg";

function CityCarousel() {
  const cities = [
    { name: "Bangalore", image: BangaloreImg },   
    { name: "Delhi", image: DelhiImg },
    { name: "Jaipur", image: JaipurImg },
    { name: "Chennai", image: ChennaiImg },
    { name: "Kerala", image: KeralaImg },
  ];

  return (
    <div className="container mt-4 py-5">
      <h2 className="fw-bold mt-4 mb-4 text-center">Popular Hotel Destinations</h2><br></br>

      <Carousel
        interval={2000}
        indicators={false}
        controls={true}
        className="city-carousel"
      >
        {cities.map((city, index) => (
          <Carousel.Item key={index}>
            <div className="d-flex justify-content-center">
              <img
                src={city.image}
                alt={city.name}
                className="rounded-4 city-img"
              />
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}

export default CityCarousel;
