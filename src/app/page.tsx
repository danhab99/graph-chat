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
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (!nodes) {
      const s = localStorage.getItem("nodes");
      if (s) {
        setNodes(JSON.parse(s));
      }
    } else {
      localStorage.setItem("nodes", JSON.stringify(nodes));
    }
    if (!edges) {
      const s = localStorage.getItem("edges");
      if (s) {
        setEdges(JSON.parse(s));
      }
    } else {
      localStorage.setItem("edges", JSON.stringify(edges));
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

  // Handle node click to open edit modal
  const handleNodeClick = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node && node.type === "prompt") {
      setEditingNodeId(nodeId);
      setEditText(node.data.label || "");
    }
  };

  // Save edited text
  const saveEdit = () => {
    if (editingNodeId) {
      setNodes(
        nodes.map((node) =>
          node.id === editingNodeId
            ? { ...node, data: { ...node.data, label: editText } }
            : node,
        ),
      );
      setEditingNodeId(null);
      setEditText("");
    }
  };

  // Close modal without saving
  const cancelEdit = () => {
    setEditingNodeId(null);
    setEditText("");
  };

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
        onNodeClick={(event, node) => handleNodeClick(node.id)}
      >
        <Background />
      </ReactFlow>

      {/* Edit Modal */}
      {editingNodeId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Prompt</h3>
            <textarea
              className="w-full h-32 p-2 border border-gray-300 rounded-md resize-none"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Enter your prompt text here..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={cancelEdit}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={saveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <AddNodeOnEdgeDrop />
  </ReactFlowProvider>
);
