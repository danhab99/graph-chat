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

  const [hovering, setHovering] = useState(false);

  return (
    <div
      className="bg-cyan-200 rounded-lg h-full shadow-gray-300 shadow-md p-2 overflow-y-auto"
      onClick={() => run()}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <NodeResizer isVisible={hovering} />
      <p>{props.data.label}</p>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
