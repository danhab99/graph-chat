import { useReactFlow } from "@xyflow/react";
import { createContext, useContext, useRef, useState } from "react";

const InputModalContext = createContext<(nodeId: string) => Promise<string>>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_x) => Promise.resolve(""),
);

export function useInput() {
  return useContext(InputModalContext);
}

export function InputModalProvider(props: React.PropsWithChildren<unknown>) {
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { setNodes } = useReactFlow();

  const resolveFunc = useRef<(value: string | PromiseLike<string>) => void>(
    () => {},
  );

  const cancelEdit = () => {
    resolveFunc.current("");
    setEditingNodeId(null);
    setEditText("");
  };

  const saveEdit = () => {
    if (editingNodeId) {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === editingNodeId
            ? { ...node, data: { ...node.data, label: editText } }
            : node,
        ),
      );
      resolveFunc.current?.(editText);
      setEditingNodeId(null);
      setEditText("");
    }
  };

  return (
    <InputModalContext.Provider
      value={(nodeId) =>
        new Promise((resolve) => {
          setEditingNodeId(nodeId);
          resolveFunc.current = resolve;
        })
      }
    >
      {editingNodeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="p-6 bg-white rounded-lg shadow-xl w-96">
            <h3 className="mb-4 text-lg font-semibold">Edit Prompt</h3>
            <textarea
              className="w-full h-32 p-2 border border-gray-300 resize-none rounded-md"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Enter your prompt text here..."
            />
            <div className="flex justify-end mt-4 space-x-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={cancelEdit}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                onClick={saveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {props.children}
    </InputModalContext.Provider>
  );
}
