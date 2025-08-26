import { CustomNode } from "@/components/CustomNode";
import { useInput } from "@/components/InputModal";
import {
  Node,
  NodeProps,
} from "@xyflow/react";

type InputNodeData = Node<
  {
    text: string;
  },
  "inputnode"
>;

export function InputNode(props: NodeProps<InputNodeData>) {
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
