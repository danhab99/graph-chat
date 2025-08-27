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
    label: string;
  },
  "response"
>;

export function ResponseNode(props: NodeProps<ResponseNodeData>) {
  const { setNodes, getNodes, getEdges } = useReactFlow();
  const [loading, setLoading] = useState(false);

  const run = () => {
    if (loading) {
      return;
    }
    setLoading(true);

    const setNodeLabel = (label: string) =>
      setNodes((prev) =>
        prev.map((node) =>
          node.id === props.id
            ? { ...node, data: { ...node.data, label } }
            : node,
        ),
      );

    let i = 0;
    const interv = setInterval(() => {
      requestAnimationFrame(() => {
        let str = new Array(3).fill(" ");
        str[i++] = ".";
        if (i > 3) {
          i = 0;
        }
        setNodeLabel(`thinking${str.join(" ")}`);
      });
    }, 200);

    const nodes = getNodes();
    const edges = getEdges();

    generateNextMessage(collectAncestors(props.id, nodes as any, edges)).then(
      (nextMsg) => {
        clearInterval(interv);
        setNodeLabel(nextMsg);
        setLoading(false);
      },
    );
  };

  // AUTO RUN
  useEffect(() => {
    if (!props.data.label) {
      run();
    }
  }, []);

  return (
    <CustomNode
      {...props}
      label="response"
      color="cyan"
      onClick={() => run()}
    />
  );
}
