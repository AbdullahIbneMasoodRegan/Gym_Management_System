import { Link } from "react-router-dom";

function Copyright() {
  return (
    <div className="font-medium text-gray-300">
      <p className=" ">
        All Rights Reserved | &copy; <span>{new Date().getFullYear()}</span> CSEDU Gym
      </p>
      <p>
        Designed by{" "}
        <Link
          to="https://cse.du.ac.bd"
          target="_blank"
          className="focus text-red"
        >
          CSE, DU
        </Link>
      </p>
    </div>
  );
}

export default Copyright;
