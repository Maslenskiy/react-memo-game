import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { CountProvider } from "./contexts/count";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <CountProvider>
      <RouterProvider router={router}></RouterProvider>
    </CountProvider>
  </React.StrictMode>,
);
