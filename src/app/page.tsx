"use client";
import React, { useCallback, useEffect, useRef } from "react";
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
  OnConnectEndParams,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Define node types
type NodeType = "prompt" | "response";

const initialNodes: Node[] = [
  {
    id: "0",
    type: "prompt",
    data: { label: "Start Prompt" },
    position: { x: 0, y: 50 },
  },
];

let id = 1;
const getId = () => `${id++}`;

const nodeOrigin: [number, number] = [0.5, 0];

// Node type mapping
const getOppositeNodeType = (nodeType: NodeType): NodeType => {
  return nodeType === "prompt" ? "response" : "prompt";
};

// Check if adding an edge would create a cycle
const wouldCreateCycle = (
  edges: Edge[],
  sourceId: string,
  targetId: string,
): boolean => {
  // Build adjacency list for graph traversal
  const adjacencyList: Record<string, string[]> = {};

  // Initialize adjacency list with existing edges
  edges.forEach((edge) => {
    if (!adjacencyList[edge.source]) {
      adjacencyList[edge.source] = [];
    }
    adjacencyList[edge.source].push(edge.target);
  });

  // Add the new edge temporarily for cycle detection
  if (!adjacencyList[sourceId]) {
    adjacencyList[sourceId] = [];
  }
  adjacencyList[sourceId].push(targetId);

  // Check for cycles using DFS
  const visited: Set<string> = new Set();
  const recursionStack: Set<string> = new Set();

  const hasCycle = (nodeId: string): boolean => {
    if (!visited.has(nodeId)) {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = adjacencyList[nodeId] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor) && hasCycle(neighbor)) {
          return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }
    }
    recursionStack.delete(nodeId);
    return false;
  };

  // Check if the new edge creates a cycle
  const result = hasCycle(targetId);

  // Clean up - remove the temporary edge
  if (adjacencyList[sourceId]) {
    adjacencyList[sourceId].pop();
  }

  return result;
};

const AddNodeOnEdgeDrop = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => {
    if (!nodes) {
      const s = localStorage.getItem("nodes")
      if (s) {
        setNodes(JSON.parse(s))
      }
    } else {
      localStorage.setItem("nodes", JSON.stringify(nodes))
    }

    if (!edges) {
      const s = localStorage.getItem("edges")
      if (s) {
        setEdges(JSON.parse(s))
      }
    } else {
      localStorage.setItem("edges", JSON.stringify(edges))
    }
  }, [nodes, edges]);

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
  const onConnectEnd = useCallback(
    (
      event: React.MouseEvent | React.TouchEvent,
      connectionState: OnConnectEndParams,
    ) => {
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
            label: newNodeType === "prompt" ? "New Prompt" : "Response",
            type: newNodeType,
          },
          type: newNodeType,
          origin: nodeOrigin,
        };

        setNodes((nds) => nds.concat(newNode));

        if (connectionState.fromNode) {
          // Check if this connection would create a cycle
          if (!wouldCreateCycle(edges, connectionState.fromNode.id, nodeId)) {
            setEdges((eds) =>
              eds.concat({
                id: `${connectionState.fromNode.id}-${nodeId}`,
                source: connectionState.fromNode.id,
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
