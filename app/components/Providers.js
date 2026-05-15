"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import AuthInitializer from "@/app/components/AuthInitializer";

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
