import { useState } from "react";
import Unauthenticated from "./pages/Unauthenticated";
import Authenticated from "./pages/Authenticated";
import Request from "./components/Request";
import { ProfileLoadResponse, User } from "./types";
function App() {
  const [user, setUser] = useState<User>({
    firstName: "",
    group: "",
    lastName: "",
    username: "",
    uuid: "",
  });
  const [profileLoadAttempted, setProfileLoadAttempted] = useState(false);

  return !profileLoadAttempted ? (
    <Request
      message="Loading App"
      url="/profile"
      method="GET"
      data={{ randomness: Date.now() }}
      headers={{}}
      onSuccess={(data: ProfileLoadResponse) => {
        if (data.success && data.user.uuid.length === 36) {
          setUser(data.user);
        }
        setProfileLoadAttempted(true);
      }}
      onFailure={(error: object) => {
        console.log("error", error);
      }}
    />
  ) : user.uuid.length !== 36 ? (
    <Unauthenticated setUser={setUser} />
  ) : (
    <Authenticated user={user} setUser={setUser} />
  );
}

export default App;
