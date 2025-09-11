import React from "react";
import Lottie from "lottie-react";
import { useEffect, useState } from "react";

const fetchAnimationData = async () => {
  const response = await fetch("/logo%20animation.json");
  return await response.json();
};


const LogoAnimation = ({ style }) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetchAnimationData().then(setAnimationData);
  }, []);

  if (!animationData) return null;
  return (
    <div style={style}>
      <Lottie animationData={animationData} loop={true} />
    </div>
  );
};

export default LogoAnimation;
