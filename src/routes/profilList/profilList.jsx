import Chat from "../../components/chat/Chat";
import List from "../../components/list/List";
import { useContext, useEffect, useState } from "react";

import { Await, Link, useLoaderData } from "react-router-dom";
import { Suspense } from "react";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";

function ProfilList() {
  const data = useLoaderData();
  const { currentUser } = useContext(AuthContext);
  const [confirmData, setConfirmData] = useState([]);

  useEffect(() => {
    const confirmPostGet = async () => {
      try {
        const res = await apiRequest.get(
          currentUser?.user?.role === "admin"
            ? `/posts?approved=${false}`
            : `/posts?userId=${currentUser?.user?.id}`,
        );
        setConfirmData(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    confirmPostGet();
  }, []);

  return (
    <>
      <div className="profilePage">
        <div className="details">
          <div className="wrapper">
            <div className="title">
              <h1>Kampanyalarım</h1>
            </div>
            {currentUser?.role === "admin" ? (
              <>
                {" "}
                <Suspense fallback={<p>Yükleniyor...</p>}>
                  <Await
                    resolve={confirmData}
                    errorElement={<p>Error loading posts!</p>}
                  >
                    {(confirmData) => <List posts={confirmData} />}
                  </Await>
                </Suspense>
              </>
            ) : (
              <Suspense fallback={<p>Yükleniyor...</p>}>
                <Await
                  resolve={confirmData}
                  errorElement={<p>Error loading posts!</p>}
                >
                  {(confirmData) => <List posts={confirmData} />}
                </Await>
              </Suspense>
            )}

            {/* <div className="title">
              <h1>Saved List</h1>
            </div> */}
            {/* <Suspense fallback={<p>Loading...</p>}>
              <Await
                resolve={data.postResponse}
                errorElement={<p>Error loading posts!</p>}
              >
                {(postResponse) => (
                  <List posts={postResponse.data.savedPosts} />
                )}
              </Await>
            </Suspense> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilList;
