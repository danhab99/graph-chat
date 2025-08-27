import { Node, Edge } from "@xyflow/react";

export type Message = { role: "user" | "assistant"; content: string };

/**
 * Collects ancestors of a given node in a directed graph
 * @param nodeId - The ID of the node to find ancestors for
 * @param nodes - Array of all nodes in the graph
 * @param edges - Array of all edges in the graph
 * @returns Array of ancestor objects with role and content properties
 */
export const getAncestors = (
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
): Message[] => {
  // Build a map of incoming edges for each node (to find parents)
  const incomingEdgesMap: Record<string, string[]> = {};

  edges.forEach((edge) => {
    if (!incomingEdgesMap[edge.target]) {
      incomingEdgesMap[edge.target] = [];
    }
    incomingEdgesMap[edge.target].push(edge.source);
  });

  // Collect ancestors
  const ancestors: { role: "user" | "assistant"; content: string }[] = [];
  const visited = new Set<string>();
  const stack: string[] = [nodeId];

  while (stack.length > 0) {
    const currentNodeId = stack.pop()!;

    // Skip if already processed
    if (visited.has(currentNodeId)) continue;
    visited.add(currentNodeId);

    // Find the node in our nodes array
    const node = nodes.find((n) => n.id === currentNodeId);
    if (!node) continue;

    // Determine role based on node type
    const role: "user" | "assistant" =
      node.type === "prompt" ? "user" : "assistant";

    // Add to ancestors array
    ancestors.push({
      role,
      content: (node.data.label as string) || "",
    });

    // Add parents to stack for traversal
    if (incomingEdgesMap[currentNodeId]) {
      incomingEdgesMap[currentNodeId].forEach((parentId) => {
        if (!visited.has(parentId)) {
          stack.push(parentId);
        }
      });
    }
  }

  // Remove the starting node itself from ancestors
  return ancestors.filter((ancestor) => ancestor.content !== "");
};

// Check if adding an edge would create a cycle
export const wouldCreateCycle = (
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

export type NodeType = "prompt" | "response";

// Node type mapping
export const getOppositeNodeType = (nodeType: NodeType): NodeType => {
  return nodeType === "prompt" ? "response" : "prompt";
};
