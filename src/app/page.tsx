"use client";
import React from "react";
import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { InputModalProvider } from "@/components/InputModal";
import { MyReactFlow } from "@/components/ReactFlow";
import { SidebarTrigger } from "@/components/ui/sidebar";

const AddNodeOnEdgeDrop = () => {
  return (
    <InputModalProvider>
      <SidebarTrigger />
      <div className="w-screen h-screen wrapper">
        <MyReactFlow />
      </div>
    </InputModalProvider>
  );
};

// eslint-disable-next-line import/no-anonymous-default-export, react/display-name
export default () => (
  <ReactFlowProvider>
    <AddNodeOnEdgeDrop />
  </ReactFlowProvider>
);
