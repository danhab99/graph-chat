import { useSetThisNode } from "@/lib/node";
import { Handle, Node, NodeProps, Position, useNodeConnections } from "@xyflow/react";
import { ChangeEventHandler } from "react";

type InputNodeData = Node<
  {
    text: string;
  },
  "inputnode"
>;

export function InputNode(props: NodeProps<InputNodeData>) {
  const set = useSetThisNode(props);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    set((prev) => ({ ...prev, text: e.target.value }));

  const connections = useNodeConnections({
    handleType: "target",
    handleId: "my-handle",
  });

  return (
    <div className="node">
      <input value={props.data.text} onChange={handleChange} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
