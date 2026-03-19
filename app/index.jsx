import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useUser } from "../hooks/useUser";
import ThemedLoader from "../components/ThemedLoader";

const Home = () => {
  const { user, authChecked } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!authChecked) return;

    if (user) {
      router.replace("/profile");
    } else {
      router.replace("/login");
    }
  }, [user, authChecked]);

  return <ThemedLoader />;
};

export default Home;
