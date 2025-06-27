import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import React from 'react';

export const SwipperComponent = ({ children, ...swiperProps }) => {
  return (
    <Swiper {...swiperProps}>
      {React.Children.map(children, (child) => (
        <SwiperSlide>{child}</SwiperSlide>
      ))}
    </Swiper>
  );
};
