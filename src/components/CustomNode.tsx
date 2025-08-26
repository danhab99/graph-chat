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

type ResponseNodeProps = {
  label: string;
  color: string;
  onClick: () => void;
};

type ResponseNodeData = Node<
  {
    system: string;
    prompt: string;
    response: string;
  },
  "response"
>;

export function CustomNode(
  props: NodeProps<ResponseNodeData> & ResponseNodeProps,
) {
  const { setNodes, getNodes, getEdges } = useReactFlow();

  const [hovering, setHovering] = useState(false);

  return (
    <div
      className={`bg-${props.color}-200 rounded-lg h-full shadow-gray-300 shadow-md overflow-y-auto px-2 pb-2`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={props.onClick}
    >
      <span className="text-xs text-gray-500 leading-none p-0">
        {props.label}:
      </span>
      <NodeResizer isVisible={hovering} />
      <p>{props.data.label}</p>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
