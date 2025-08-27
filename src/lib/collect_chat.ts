import { Edge, Node } from "@xyflow/react";

/**
 * Type definition for a node in the graph
 */
type NodeType = "prompt" | "response";

/**
 * Type definition for ancestor object
 */
interface Ancestor {
  role: "user" | "assistant";
  content: string;
}

/**
 * Collects all ancestors of a given node in the directed graph
 * @param {string} nodeId - The ID of the target node
 * @param {GraphNode[]} nodes - Array of all nodes in the graph
 * @param {GraphEdge[]} edges - Array of all edges in the graph
 * @returns {Ancestor[]} Array of ancestor objects with role and content
 */
export const collectAncestors = (
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
): Ancestor[] => {
  // Build a mapping from target node to source nodes (reverse edges)
  const reverseEdges: Record<string, string[]> = {};
  edges.forEach((edge) => {
    if (!reverseEdges[edge.target]) {
      reverseEdges[edge.target] = [];
    }
    reverseEdges[edge.target].push(edge.source);
  });

  // BFS traversal to find all ancestors
  const ancestors: Ancestor[] = [];
  const visited = new Set<string>();
  const queue: string[] = [nodeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    // Skip if already visited or not in nodes
    if (visited.has(currentId) || !nodes.find((n) => n.id === currentId)) {
      continue;
    }

    visited.add(currentId);

    // Get the node data
    const node = nodes.find((n) => n.id === currentId);
    if (node) {
      // Determine role based on node type
      const role: "user" | "assistant" =
        node.type === "prompt" ? "user" : "assistant";
      const content = (node.data.label as string) || "";

      ancestors.push({ role, content });

      // Add parents to queue for further traversal
      if (reverseEdges[currentId]) {
        queue.push(...reverseEdges[currentId]);
      }
    }
  }

  // Remove the target node itself and return in correct order (from closest to farthest)
  return ancestors
    .filter((ancestor) => ancestor.content !== "")
    .reverse()
    .slice(0, -1);
};
