import React, { useState, useEffect, useCallback, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ElasticPathFile } from "@epcc-sdk/sdks-shopper";
import Image from "next/image";
import { cn } from "../../lib/cn";

type PropType = {
  slides: ElasticPathFile[];
  options?: Parameters<typeof useEmblaCarousel>[0];
};

const CarouselThumbnail: React.FC<PropType> = (props) => {
  const { slides, options } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(options);
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const indexedSlides = useMemo(
    () => slides.map((slide, index) => ({ ...slide, __index: index })),
    [slides],
  );

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi, emblaThumbsApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();

    emblaMainApi.on("select", onSelect).on("reInit", onSelect);
  }, [emblaMainApi, onSelect]);

  return (
    <div className="max-w-[48rem] m-auto">
      <div className="overflow-hidden" ref={emblaMainRef}>
        <div className={`flex touch-pan-y touch-pinch-zoom ml-[${1 * -1}rem]`}>
          {indexedSlides.map((slide) => (
            <div
              className="[transform:translate3d(0,0,0)] flex-[0_0_100%] min-w-0 pl-[1rem]"
              key={slide.__index}
            >
              <div className="relative w-full aspect-square rounded-lg">
                <Image
                  src={slide.link?.href!}
                  alt={slide.file_name || slide.link?.href!}
                  className="rounded-lg"
                  sizes="(min-width: 620px) 66vw, 100vw"
                  priority={slide.__index === 0}
                  fill
                  style={{
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={cn("mt-[0.8rem]")}>
        <div className="overflow-hidden" ref={emblaThumbsRef}>
          <div className={`flex flex-row ml-[${0.8 * -1}rem] gap-4`}>
            {indexedSlides.map((slide) => (
              <div
                key={slide.__index}
                className={cn(
                  "flex-[0_0_22%] min-w-0 rounded-lg flex",
                  slide.__index === selectedIndex &&
                    "border-2 border-brand-primary",
                )}
              >
                <button
                  onClick={() => onThumbClick(slide.__index)}
                  type="button"
                  className="flex-1"
                >
                  <div className="relative w-full aspect-square rounded-lg">
                    <Image
                      src={slide.link?.href!}
                      alt={slide.file_name || slide.link?.href!}
                      className="rounded-lg"
                      sizes="(min-width: 620px) 66vw, 100vw"
                      priority={slide.__index < 6}
                      fill
                      style={{
                        objectFit: "contain",
                      }}
                    />
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselThumbnail;
