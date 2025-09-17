import { CustomNode, CustomNodeData } from "@/components/CustomNode";
import { useSelectedModel } from "@/hooks/useModelState";
import { collectAncestors } from "@/lib/collect_chat";
import { generateNextMessage } from "@/lib/ollama";
import { NodeProps, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";

export function ResponseNode(props: NodeProps<CustomNodeData>) {
  const { setNodes, getNodes, getEdges } = useReactFlow();
  const [loading, setLoading] = useState(false);

  const [selectedModel] = useSelectedModel();
  const [lastModelToGenerate, setLastModelToGenerate] = useState("");

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
        const str = new Array(3).fill(" ");
        str[i++] = ".";
        if (i > 3) {
          i = 0;
        }
        setNodeLabel(`thinking${str.join(" ")}`);
      });
    }, 200);

    const nodes = getNodes();
    const edges = getEdges();

    setLastModelToGenerate(selectedModel);
    generateNextMessage(collectAncestors(props.id, nodes, edges), selectedModel)
      .then((nextMsg) => {
        setNodeLabel(nextMsg);
      })
      .finally(() => {
        clearInterval(interv);
        setLoading(false);
      });
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
      label={
        lastModelToGenerate ? `${lastModelToGenerate} responded:` : "response"
      }
      controls={{
        generate: () => run(),
        copy: () => {
          navigator.clipboard.writeText(props.data.label || "");
          alert("Copied to clipboard!");
        },
      }}
      onDoubleClick={() => run()}
      colorIndex={1}
    />
  );
}
