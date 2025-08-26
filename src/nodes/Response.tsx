import { useSetThisNode } from "@/lib/node";
import {
  getIncomers,
  Handle,
  Node,
  NodeProps,
  Position,
  useEdges,
  useEdgesState,
  useNodeConnections,
  useNodeId,
  useNodes,
  useNodesState,
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
  const [loading, setLoading] = useState(false);
  const set = useSetThisNode(props);

  const [promptConnection] = useNodeConnections({
    handleId: "prompt",
  });
  const [responseConnection] = useNodeConnections({
    handleId: "response",
  });

  useEffect(() => {
    setLoading(true);

    (async () => {
      const response: string = await processResponse(
        props.data.system,
        props.data.prompt,
      );

      set((prev) => ({
        ...prev,
        response,
      }));

      setLoading(false);
    })();
  }, [props]);

  const id = useNodeId();
  const edges = useEdges();

  return (
    <div className="border border-solid border-black">
      test
      <Handle position={Position.Bottom} />
    </div>
  );
}

async function processResponse(
  system: string,
  prompt: string,
): Promise<string> {
  return "";
}
