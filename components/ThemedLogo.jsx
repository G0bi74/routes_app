import { Image, useColorScheme } from "react-native";

import Logo from "../assets/img/logo.png";

const ThemedLogo = ({ size = 120, style, ...props }) => {
  return (
    <Image
      source={Logo}
      style={[
        {
          width: size,
          height: size,
          resizeMode: "contain",
        },
        style,
      ]}
      {...props}
    />
  );
};

export default ThemedLogo;
