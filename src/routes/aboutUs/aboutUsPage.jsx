import React from "react";
import AboutUs from "../../components/AboutUs/AboutUs";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import BreadcrumbImage from "../../assets/breadcrumb.png";

const AboutUsPage = () => {
  return (
    <div>
      <Breadcrumb
        title="Hakkımızda"
        breadcrumbText="Anasayfa / Hakkımızda"
        backgroundImage={BreadcrumbImage}
      />
      <AboutUs />
    </div>
  );
};

export default AboutUsPage;
