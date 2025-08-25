"use client";
import React, { useCallback, useRef } from "react";
import {
  Background,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  ReactFlowInstance,
  OnConnectEndParams,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const initialNodes: Node[] = [
  {
    id: "0",
    type: "input",
    data: { label: "Node" },
    position: { x: 0, y: 50 },
  },
];

let id = 1;
const getId = () => `${id++}`;

const nodeOrigin: [number, number] = [0.5, 0];

const AddNodeOnEdgeDrop = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<>([]);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const onConnectEnd = useCallback(
    (event: React.MouseEvent | React.TouchEvent, connectionState: OnConnectEndParams) => {
      if (!connectionState.isValid) {
        const id = getId();
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;

        const newNode: Node = {
          id,
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: { label: `Node ${id}` },
          origin: nodeOrigin,
        };

        setNodes((nds) => nds.concat(newNode));

        if (connectionState.fromNode) {
          setEdges((eds) =>
            eds.concat({
              id: `${connectionState.fromNode.id}-${id}`,
              source: connectionState.fromNode.id,
              target: id,
            }),
          );
        }
      }
    },
    [screenToFlowPosition],
  );

  return (
    <div className="wrapper w-screen h-screen" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange as (changes: NodeChange[]) => void}
        onEdgesChange={onEdgesChange as (changes: EdgeChange[]) => void}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        fitView
        fitViewOptions={{ padding: 2 }}
        nodeOrigin={nodeOrigin}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <AddNodeOnEdgeDrop />
  </ReactFlowProvider>
);
