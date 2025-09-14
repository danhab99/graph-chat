import { calculateColor } from "@/lib/color";
import {
  Handle,
  Node,
  NodeProps,
  NodeResizer,
  NodeToolbar,
  Position,
  useReactFlow,
} from "@xyflow/react";
import { MouseEvent, useState } from "react";
import Markdown from "react-markdown";

export type CustomNodeProps = {
  label: string;
  colorIndex: number;
  onClick?: () => void;
  onDoubleClick?: () => void;
  controls?: Record<
    string,
    (
      props: CustomNodeProps,
      e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
    ) => void
  >;
} & NodeProps<CustomNodeData>;

export type CustomNodeData = Node<
  {
    label: string;
  },
  "custom"
>;

export function CustomNode(props: CustomNodeProps) {
  const [hovering, setHovering] = useState(false);
  const { setNodes } = useReactFlow();

  return (
    <div
      className={`rounded-lg h-full shadow-md overflow-y-auto px-2 pb-2 text-black scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-thumb-slate-500 scrollbar-track-transparent`}
      style={{
        backgroundColor: calculateColor(props.colorIndex),
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={props.onClick}
      onDoubleClick={props.onDoubleClick}
    >
      <span className="p-0 text-xs leading-none text-gray-500">
        {props.label}:
      </span>
      <NodeResizer isVisible={hovering} />
      <Markdown>{props.data?.label}</Markdown>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <NodeToolbar position={Position.Bottom}>
        {props.controls
          ? Object.entries(props.controls)
              .concat([
                [
                  "delete",
                  () => {
                    setNodes((prev) =>
                      prev.filter((node) => node.id !== props.id),
                    );
                  },
                ],
              ])
              .map(([label, onClick], i) => (
                <button
                  key={i}
                  className="px-4 py-2 mx-2 rounded-lg shadow-lg"
                  style={{
                    backgroundColor: calculateColor(props.colorIndex + i),
                  }}
                  onClick={(e) => onClick(props, e)}
                >
                  {label}
                </button>
              ))
          : null}
      </NodeToolbar>
    </div>
  );
}
