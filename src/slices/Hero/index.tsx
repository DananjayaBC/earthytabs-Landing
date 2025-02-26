"use client";
import { FC, useEffect, useRef, useState } from "react";
import { Content, KeyTextField } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { gsap } from "gsap";
import Bounded from "@/components/Bounded";
import Shapes from "./Shapes";
import Button from "@/components/Button";

/**
 * Props for `Hero`.
 */
export type HeroProps = SliceComponentProps<Content.HeroSlice>;

/**
 * Component for "Hero" Slices.
 */
const Hero: FC<HeroProps> = ({ slice }) => {
  const component = useRef(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Simulate loading completion after 2 seconds
      setTimeout(() => {
        setIsLoading(false); // Hide loader after 2 seconds
      }, 2000);

      // Animation for the name
      tl.fromTo(
        ".name-animation",
        {
          x: -100,
          opacity: 0,
          rotate: -10,
        },
        {
          x: 0,
          opacity: 1,
          rotate: 0,
          ease: "elastic.out(1, 0.3)",
          duration: 1,
          transformOrigin: "left top",
          delay: 0.5,
          stagger: {
            each: 0.1,
            from: "random",
          },
        }
      );

      // Animation for the job title
      tl.fromTo(
        ".job-title",
        { y: 20, opacity: 0, scale: 1.2 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: "elastic.out(1, 0.3)" }
      );

      // Animation for the button
      tl.fromTo(
        ".btn1",
        { y: 20, autoAlpha: 0, scale: 1.2 }, // Use autoAlpha to handle visibility and opacity
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "elastic.out(1, 0.3)",
        }
      );
    }, component);

    return () => ctx.revert(); // Cleanup GSAP context
  }, []);

  /**
   * Adds spaces between words if they are camelCased.
   */
  const addSpaceBetweenWords = (text: string | null | undefined) => {
    if (!text) return ""; // Handle null or undefined cases
    return text.replace(/([a-z])([A-Z])/g, "$1 $2"); // Adds space between camelCase words
  };

  /**
   * Renders text with animation while preserving spaces.
   */
  const renderLetters = (
    name: KeyTextField | null | undefined,
    key: string
  ) => {
    if (!name) return;
    return name.split("").map((letter, index) => (
      <span
        key={index}
        className={`name-animation name-animation-${key} inline-block opacity-0`}
      >
        {letter === " " ? "\u00A0" : letter}{" "}
        {/* Ensures spaces are preserved */}
      </span>
    ));
  };

  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      ref={component}
    >
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900 z-50">
          <div className="content">
            <div className="pill">
              <div className="medicine">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
              </div>
              <div className="side"></div>
              <div className="side"></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`grid min-h-[70vh] grid-cols-1 items-center md:grid-cols-2 pl-4 md:pl-0 ${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-500`}
      >
        <Shapes />
        <div className="col-start-1 md:row-start-1" data-speed=".2">
          <section className="px-4 py-10 md:px-6 md:py-14 lg:py-16">
            <h1
              className="mb-8 text-[clamp(32px,16vmin,330px)] sm:text-[clamp(50px,11vmin,330px)] font-extrabold leading-none tracking-tighter"
              aria-label={`${slice.primary.hero_1st ?? ""} ${slice.primary.hero_2nd ?? ""}`}
            >
              <span className="block text-slate-300">
                {renderLetters(
                  addSpaceBetweenWords(slice.primary.hero_1st as string),
                  "1st"
                )}
              </span>
              <span className="-mt-[.2em] block text-slate-500">
                {renderLetters(
                  addSpaceBetweenWords(slice.primary.hero_2nd as string),
                  "2nd"
                )}
              </span>
            </h1>

            <span className="job-title block bg-gradient-to-tr from-yellow-500 via-yellow-200 to-yellow-500 bg-clip-text text-2xl font-bold uppercase tracking-[.1em] text-transparent opacity-0 md:text-4xl">
              {slice.primary.tag_line}
            </span>
            <br />
            <span className="btn1 block">
              <Button
                linkField={slice.primary.cta_link}
                label={slice.primary.cta_lable}
                className="ml-3"
              />
            </span>
          </section>
        </div>
      </div>
    </Bounded>
  );
};

export default Hero;
