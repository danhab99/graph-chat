"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Background,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  Node,
  Connection,
  NodeChange,
  EdgeChange,
  Controls,
  OnConnectEnd,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { generateNextMessage } from "@/lib/ollama";
import { collectAncestors } from "@/lib/collect_chat";
import { getOppositeNodeType, NodeType, wouldCreateCycle } from "@/lib/node";
import { InputModalProvider } from "@/components/InputModal";
import { InputNode } from "@/nodes/InputNode";
import { ResponseNode } from "@/nodes/Response";

let id = 1;
const getId = () => `${id++}`;
const nodeOrigin: [number, number] = [0.5, 0];

const AddNodeOnEdgeDrop = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<any, NodeType>>(
    [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition } = useReactFlow();
  const [loaded, setLoaded] = useState(false);

  const setNodeLabel = (nodeId: Node["id"], label: string) =>
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, label } } : node,
      ),
    );

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
            data: { label: "Start Prompt" },
            position: { x: 0, y: 50 },
            width: 300,
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
  }, [nodes, edges, loaded]);

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
    [edges],
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
        const newNode: Node = {
          id: nodeId,
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: {
            label: newNodeType === "prompt" ? "Click to enter prompt" : "Response",
            type: newNodeType,
          },
          type: newNodeType,
          origin: nodeOrigin,
          width: 300,
        };
        setNodes((nds) => nds.concat(newNode));
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
    [screenToFlowPosition, edges],
  );

  // Handle node click to open edit modal
  const handleNodeClick = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      switch (node.type) {
        case "response":
          setNodes((prev) =>
            prev.map((node) =>
              node.id === nodeId
                ? { ...node, data: { ...node.data, label: "thinking..." } }
                : node,
            ),
          );
          setNodeLabel(node.id, "thinking...");
          generateNextMessage(collectAncestors(nodeId, nodes, edges)).then(
            (nextMsg) => setNodeLabel(node.id, nextMsg),
          );
          break;
      }
    }
  };

  return (
    <InputModalProvider>
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
          onNodeClick={(_event, node) => handleNodeClick(node.id)}
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
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </InputModalProvider>
  );
};

export default () => (
  <ReactFlowProvider>
    <AddNodeOnEdgeDrop />
  </ReactFlowProvider>
);
