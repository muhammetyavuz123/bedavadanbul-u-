import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import BreadcrumbImage from "../../assets/breadcrumb.png";
import InquiryInbox from "../../components/InquiryInbox/InquiryInbox";

function MyInquiries() {
  return (
    <>
      <Breadcrumb
        title="Sorularım"
        breadcrumbText="Anasayfa / Sorularım"
        backgroundImage={BreadcrumbImage}
      />
      <div style={{ width: "100%", boxSizing: "border-box", padding: "24px 0 40px" }}>
        <InquiryInbox mode="customer" />
      </div>
    </>
  );
}

export default MyInquiries;
