import { CustomNode } from "@/components/CustomNode";
import { collectAncestors } from "@/lib/collect_chat";
import { generateNextMessage } from "@/lib/ollama";
import {
  Handle,
  Node,
  NodeProps,
  NodeResizer,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { useEffect, useState } from "react";

type ResponseNodeData = Node<
  {
    system: string;
    prompt: string;
    response: string;
  },
  "response"
>;

export function ResponseNode(props: NodeProps<ResponseNodeData>) {
  const { setNodes, getNodes, getEdges } = useReactFlow();

  const run = () => {
    const setNodeLabel = (nodeId: Node["id"], label: string) =>
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, label } }
            : node,
        ),
      );

    setNodeLabel(props.id, "thinking...");

    const nodes = getNodes();
    const edges = getEdges();

    generateNextMessage(collectAncestors(props.id, nodes as any, edges)).then(
      (nextMsg) => setNodeLabel(props.id, nextMsg),
    );
  };

  // AUTO RUN
  useEffect(() => {
    run();
  }, []);

  return (
    <CustomNode {...props} label="response" color="cyan" onClick={() => run} />
  );
}
