import React from "react";
import "./breadcrumb.scss";

const Breadcrumb = ({ title, breadcrumbText, backgroundImage }) => {
  return (
    <div
      className="hero-header"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="overlay">
        <h1>{title}</h1>
        {breadcrumbText && <p className="breadcrumb">{breadcrumbText}</p>}
      </div>
    </div>
  );
};

export default Breadcrumb;
