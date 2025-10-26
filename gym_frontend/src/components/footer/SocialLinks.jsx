import {
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaFacebookF,
} from "react-icons/fa6";

const linkStyles =
  "flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:bg-red hover:text-white transition-all duration-300";

const socialMediaLinks = [
  {
    name: "LinkedIn",
    url: "https://du.ac.bd/body/CSE",
    icon: <FaLinkedin />,
  },
  {
    name: "Github",
    url: "https://du.ac.bd/body/CSE",
    icon: <FaGithub />,
  },
  {
    name: "Instagram",
    url: "https://du.ac.bd/body/CSE",
    icon: <FaInstagram />,
  },
  {
    name: "Facebook",
    url: "https://du.ac.bd/body/CSE",
    icon: <FaFacebookF />,
  },
];

function SocialLinks() {
  return (
    <ul className="flex gap-2">
      {socialMediaLinks.map(({ name, url, icon }) => (
        <li key={name}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={linkStyles}
            aria-label={name}
          >
            {icon}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default SocialLinks;
