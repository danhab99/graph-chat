"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Background,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Node,
  Connection,
  NodeChange,
  EdgeChange,
  Controls,
  OnConnectEnd,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getOppositeNodeType, NodeType, wouldCreateCycle } from "@/lib/node";
import { InputNode } from "@/nodes/InputNode";
import { ResponseNode } from "@/nodes/Response";

let id = 1;
const getId = () => `${id++}`;
const nodeOrigin: [number, number] = [0.5, 0];

export const MyReactFlow = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<any, NodeType>>(
    [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition } = useReactFlow();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (nodes.length > 0) {
      localStorage.setItem("nodes", JSON.stringify(nodes));
    } else if (!loaded) {
      const s = localStorage.getItem("nodes");
      if (s && s.length > 2) {
        setNodes(JSON.parse(s));
      } else {
        setNodes([
          {
            id: "0",
            type: "prompt",
            data: { label: "Double-click to enter first prompt" },
            position: { x: 0, y: 50 },
            width: 300,
            height: 200,
            resizing: true,
          },
        ]);
      }
    }

    if (edges.length > 0) {
      localStorage.setItem("edges", JSON.stringify(edges));
    } else if (!loaded) {
      const s = localStorage.getItem("edges");
      if (s && s.length > 2) {
        setEdges(JSON.parse(s));
      }
    }

    setLoaded(true);
  }, [nodes, edges, loaded, setEdges, setNodes]);

  // Handle direct connections between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      // Check if this connection would create a cycle
      if (params.source && params.target) {
        if (wouldCreateCycle(edges, params.source, params.target)) {
          console.warn("Connection would create a cycle - rejected");
          return;
        }
      }
      setEdges((eds) => addEdge(params, eds));
    },
    [edges, setEdges],
  );

  // Handle dropping edges to create new nodes
  const onConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState) => {
      if (!connectionState.isValid) {
        const nodeId = getId();
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;
        // Determine node type based on source node
        let newNodeType: NodeType = "response"; // default fallback
        if (connectionState.fromNode) {
          // Get the opposite node type
          newNodeType = getOppositeNodeType(
            connectionState.fromNode.type as NodeType,
          );
        }
        setNodes((nds) =>
          nds.concat([
            {
              id: nodeId,
              position: screenToFlowPosition({
                x: clientX,
                y: clientY,
              }),
              data: {
                label:
                  newNodeType === "prompt"
                    ? "Double-click to enter prompt"
                    : "Double-click to generate response",
                type: newNodeType,
              },
              type: newNodeType,
              origin: nodeOrigin,
              width: 300,
              height: 200,
            },
          ]),
        );
        if (connectionState.fromNode) {
          // Check if this connection would create a cycle
          if (!wouldCreateCycle(edges, connectionState.fromNode.id, nodeId)) {
            setEdges((eds) =>
              eds.concat({
                id: `${connectionState.fromNode!.id}-${nodeId}`,
                source: connectionState.fromNode!.id,
                target: nodeId,
              }),
            );
          } else {
            console.warn("Connection would create a cycle - rejected");
            // Remove the newly created node since we're rejecting the edge
            setNodes((nds) => nds.filter((node) => node.id !== nodeId));
          }
        }
      }
    },
    [screenToFlowPosition, edges, setEdges, setNodes],
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
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
        onEdgeClick={(_event, edge) =>
          setEdges((prev) => [...prev.filter((x) => x.id !== edge.id)])
        }
        deleteKeyCode={["Delete", "Backspace"]}
        onNodesDelete={(nodes) => {
          const ids = nodes.map((x) => x.id);
          setNodes((prev) => prev.filter((x) => !ids.includes(x.id)));
          setEdges((prev) =>
            prev.filter(
              (x) => !ids.includes(x.target) || !ids.includes(x.source),
            ),
          );
        }}
        nodeTypes={{
          prompt: InputNode,
          response: ResponseNode,
        }}
        snapToGrid
        snapGrid={[20, 20]}
      >
        <Background gap={[20, 20]} />
        <Controls />
      </ReactFlow>
    </div>
  );
};
