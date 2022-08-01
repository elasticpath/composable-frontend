import { useContext, useEffect } from "react";
import { CarouselContext } from "pure-react-carousel";

interface CarouselListenerProps {
  setCurrentSlide: (index: number) => void;
}

export const CarouselListener: (
  props: CarouselListenerProps
) => JSX.Element = ({ setCurrentSlide }) => {
  const carouselContext = useContext(CarouselContext);

  useEffect(() => {
    function onChange() {
      setCurrentSlide(carouselContext.state.currentSlide);
    }
    carouselContext.subscribe(onChange);
    return () => carouselContext.unsubscribe(onChange);
  }, [carouselContext]);

  return <></>;
};
