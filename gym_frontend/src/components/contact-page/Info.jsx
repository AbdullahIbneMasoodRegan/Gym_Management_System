import SocialLinks from "../footer/SocialLinks";

const headingStyles = `relative mb-4 mt-6 pb-2 text-xl font-bold capitalize before:absolute before:bottom-0 before:h-1 before:w-16 before:bg-red`;

function Info() {
  return (
    <div>
      <h3 className="mb-4 text-3xl font-bold">
        We are here for help you To Shape Your Body
      </h3>
      <p className="font-medium text-gray-300">
      At our gym, we believe fitness is more than just a goal — it’s a lifestyle. Whether you’re looking to build strength, improve endurance, or simply feel healthier, our expert trainers and modern facilities are here to support you every step of the way.
Join us today and take the first step toward a stronger, more confident you.
      </p>
      <div className="grid 2xl:grid-cols-2 2xl:gap-y-8">
        <div>
          <h4 className={headingStyles}>Dhaka, Bangladesh</h4>
          <address className="font-medium not-italic text-gray-300">
            University of Dhaka
            <br /> Dhaka
          </address>
        </div>
        <div>
          <h4 className={headingStyles}>Opening Hours</h4>
          <p className="whitespace-nowrap font-medium text-gray-300">
            Mon to Fri: 9:00 am — 10:00 pm
          </p>
          <p className="whitespace-nowrap font-medium text-gray-300">
            Sat: 10:30 pm — 12:00 am
          </p>
        </div>
        <div>
          <h4 className={headingStyles}>Information</h4>
          <a
            href="tel:+98-21-225-429-71"
            className="block font-medium text-gray-300"
          >
            +01898989898
          </a>
          <a
            href="cs.du.ac.bd"
            className="block font-medium text-gray-300"
          >
            csedugym@gmail.com
          </a>
        </div>
        <div>
          <h4 className={headingStyles}>Follow Us On</h4>
          <SocialLinks />
        </div>
      </div>
    </div>
  );
}

export default Info;
