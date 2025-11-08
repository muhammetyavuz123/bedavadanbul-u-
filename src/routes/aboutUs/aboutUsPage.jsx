import React from "react";
import AboutUs from "../../components/AboutUs/AboutUs";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import BreadcrumbImage from "../../assets/breadcrumb.png";

const aboutUsPage = () => {
  return (
    <div>
      <Breadcrumb
        title="Hakkımızda"
        breadcrumbText="Anasayfa / Hakkımızda"
        backgroundImage={BreadcrumbImage}
      />{" "}
      <AboutUs></AboutUs>
    </div>
  );
};

export default aboutUsPage;
