// DownloadLink.js
import React from "react";

interface IDownloadLink {
  href: string;
  filename: string;
}

const DownloadLink = ({ href, filename }: IDownloadLink): JSX.Element => {
  
  return (
    <div>
      <a
        href={href}
        download={filename}
        style={{ textDecoration: "underline", color: "blue" }}
      >
        {filename}
      </a>
    </div>
  );
}

export default DownloadLink;