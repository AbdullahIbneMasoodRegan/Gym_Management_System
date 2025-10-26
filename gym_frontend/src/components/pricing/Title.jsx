import SecondaryHeading from "../headings/SecondaryHeading";
import TertiaryHeading from "../headings/TertiaryHeading";

function Title() {
  return (
    <div className="relative z-20">
      <SecondaryHeading>Pricing chart</SecondaryHeading>
      <TertiaryHeading>Exclusive pricing plan</TertiaryHeading>
      <p className="mx-auto max-w-[50ch] font-medium text-gray-300">
        At CSEDU Gym, we offer flexible membership plans designed to fit your lifestyle
  and fitness goals. Whether you’re just starting out or training like a pro,
  you’ll find the perfect plan to help you stay consistent and reach your peak
  performance.
      </p>
    </div>
  );
}

export default Title;
