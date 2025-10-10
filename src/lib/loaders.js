import { defer } from "react-router-dom";
import apiRequest from "./apiRequest";

export const singlePageLoader = async ({ request, params }) => {
  const res = await apiRequest("/posts/" + params.id);
  return res.data;
};
// export const listPageLoader = async ({ request, params }) => {
//   const query = request.url.split("?")[1];
//   const postPromise = apiRequest("/posts?" + query);
//   return defer({
//     postResponse: postPromise,
//   });
// };
export const listPageLoader = async ({ request }) => {
  const url = new URL(request.url);
  url.searchParams.set("approved", true); // 👈 burada filtreliyoruz

  const postPromise = apiRequest("/posts?" + url.searchParams.toString());

  return defer({
    postResponse: postPromise,
  });
};

export const profilePageLoader = async () => {
  const postPromise = apiRequest("/users/profilePosts");
  // const chatPromise = apiRequest("/chats");
  return defer({
    postResponse: postPromise,
    // chatResponse: chatPromise,
  });
};
