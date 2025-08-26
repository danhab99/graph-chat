import { useInput } from "@/components/InputModal";
import {
  Handle,
  Node,
  NodeProps,
  NodeResizer,
  Position,
  useNodeConnections,
} from "@xyflow/react";
import { ChangeEventHandler, useState } from "react";

type InputNodeData = Node<
  {
    text: string;
  },
  "inputnode"
>;

export function InputNode(props: NodeProps<InputNodeData>) {
  const input = useInput();
  const [hovering, setHovering] = useState(false);

  return (
    <>
      <div
        onClick={() => input(props.id)}
        className="bg-yellow-200 rounded-lg h-full shadow-gray-300 shadow-md p-2"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <p>{props.data.label}</p>
        <NodeResizer isVisible={hovering} />
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
      </div>
    </>
  );
}
