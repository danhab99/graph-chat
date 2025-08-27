import { Handle, Node, NodeProps, NodeResizer, Position } from "@xyflow/react";
import { useState } from "react";

export type CustomNodeProps = {
  label: string;
  color: string;
  onClick: () => void;
} & NodeProps<CustomNodeData>;

export type CustomNodeData = Node<
  {
    label: string;
  },
  "custom"
>;

export function CustomNode(props: CustomNodeProps) {
  const [hovering, setHovering] = useState(false);

  return (
    <div
      className={`${props.color === "yellow" ? "bg-yellow-200" : ""} ${props.color === "cyan" ? "bg-cyan-200" : ""} rounded-lg h-full shadow-md overflow-y-auto px-2 pb-2 text-black`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={props.onClick}
    >
      <span className="p-0 text-xs leading-none text-gray-500">
        {props.label}:
      </span>
      <NodeResizer isVisible={hovering} />
      <p>{props.data?.label}</p>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
