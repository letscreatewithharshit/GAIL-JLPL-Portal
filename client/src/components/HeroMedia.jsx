import React, { useEffect, useState } from "react";
// Homepage banner: plays the video when one is available, otherwise shows the image.
export default function HeroMedia({ video, image }) {
  const [videoFailed, setVideoFailed] = useState(false);
  useEffect(() => {
    setVideoFailed(false);
  }, [video]);
  const showVideo = Boolean(video) && !videoFailed;
  return (
    <>
      {showVideo ? (
        <video
          key={video}
          className="hero-video"
          src={video}
          poster={image || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setVideoFailed(true)}
        />
      ) : (
        <div
          className="hero-image"
          style={
            image
              ? {
                  backgroundImage: `url("${image}")`,
                }
              : undefined
          }
        />
      )}
      {showVideo && <div className="hero-video-shade" />}
    </>
  );
}
