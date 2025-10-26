import SecondaryHeading from "../headings/SecondaryHeading";
import TertiaryHeading from "../headings/TertiaryHeading";

function Title() {
  return (
    <div className="mb-10">
      <SecondaryHeading>Why choose us</SecondaryHeading>
      <TertiaryHeading color="white">
        We can help you get the perfect shape you always wanted!
      </TertiaryHeading>
      <p className="font-medium text-gray-200">
        At <b>CSEDU Gym</b>, we are dedicated to helping you achieve the body of
        your dreams. Our expert trainers and nutritionists will work with you to
        create a personalized fitness and nutrition plan that helps you reach
        your specific goals.
      </p>
    </div>
  );
}

export default Title;
