import TertiaryHeading from "../../headings/TertiaryHeading";

import mountain from "../../../images/about-page/mountain.png";
import target from "../../../images/about-page/target.png";
import img1 from "../../../images/about-page/img1.webp";
import img2 from "../../../images/about-page/img2.webp";

function History() {
  return (
    <section className="bg-[url('./images/about-page/bg.png')] bg-cover px-6 py-32 text-center">
      <div className="container grid shadow-2xl xl:grid-cols-2 ">
        <div className="flex h-full flex-col gap-4 self-center bg-white p-4">
          <img
            src={target}
            alt=""
            className="hover:rotate-y-180 mx-auto w-32 transition-all duration-700"
          />
          <TertiaryHeading>Our history</TertiaryHeading>
          <p className="font-medium text-gray-300">
            Founded with a passion for fitness and community, our gym started as a small
  local training center focused on helping people live healthier, stronger lives.
  Over the years, we have grown into a full-service fitness hub, combining
  state-of-the-art equipment, expert trainers, and a welcoming atmosphere that
  inspires every member to reach their goals.
          </p>
        </div>

        <div className="overflow-hidden">
          <img
            src={img1}
            alt=""
            className="h-full transition-all duration-300 hover:scale-110"
          />
        </div>

        <div className="flex h-full flex-col gap-4 self-center bg-white p-4 xl:order-4">
          <img
            src={mountain}
            alt=""
            className="hover:rotate-y-180 mx-auto transition-all duration-700"
          />
          <TertiaryHeading>Our Mission</TertiaryHeading>
          <p className="font-medium text-gray-300">
            Our mission is to empower individuals to achieve their best selves through
  fitness, discipline, and community. We’re dedicated to providing a space where
  everyone—no matter their experience level—can train confidently, stay motivated,
  and build lasting healthy habits for life.
          </p>
        </div>

        <div className="overflow-hidden">
          <img
            src={img2}
            alt=""
            className="h-full transition-all duration-300 hover:scale-110"
          />
        </div>
      </div>
    </section>
  );
}

export default History;
