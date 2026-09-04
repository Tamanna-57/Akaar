import { AkaarThemeProvider } from "@akaar/design-system";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { AkaarNavigator } from "./src/navigation/AkaarNavigator";

/** Port of android/app/.../MainActivity.kt + AkaarApplication.kt entry wiring. */
export default function App() {
  return (
    <AkaarThemeProvider>
      <NavigationContainer>
        <AkaarNavigator />
      </NavigationContainer>
    </AkaarThemeProvider>
  );
}
