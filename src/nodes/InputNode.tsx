import { CustomNode, CustomNodeData } from "@/components/CustomNode";
import { useInput } from "@/components/InputModal";
import { NodeProps } from "@xyflow/react";

export function InputNode(props: NodeProps<CustomNodeData>) {
  const input = useInput();

  return (
    <CustomNode
      {...props}
      color="yellow"
      onClick={() => input(props.id)}
      label="prompt"
    />
  );
}
