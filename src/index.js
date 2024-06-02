import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { CountProvider } from "./contexts/count";
import { LeaderProvider } from "./contexts/leaders";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <CountProvider>
      <LeaderProvider>
        <RouterProvider router={router}></RouterProvider>
      </LeaderProvider>
    </CountProvider>
  </React.StrictMode>,
);
